from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, ValidationError

from .models import User, CreativeProfile, Service, Booking, Message
from .serializers import (
    UserSerializer,
    CreativeProfileSerializer,
    ServiceSerializer,
    BookingSerializer,
    MessageSerializer,
)
from .permissions import IsServiceOwnerOrReadOnly


class CreativeProfileViewSet(viewsets.ReadOnlyModelViewSet):
    """
    List / retrieve creatives. Search by ?location=<city or region>
    """
    queryset = CreativeProfile.objects.select_related("user").all()
    serializer_class = CreativeProfileSerializer

    @action(detail=False, methods=["get"])
    def search(self, request):
        q = (request.query_params.get("location") or "").strip()
        qs = self.get_queryset()
        if q:
            qs = qs.filter(Q(city__icontains=q) | Q(region__icontains=q))
        page = self.paginate_queryset(qs)
        ser = self.get_serializer(page or qs, many=True)
        return (
            self.get_paginated_response(ser.data)
            if page is not None
            else Response(ser.data)
        )


class ServiceViewSet(viewsets.ModelViewSet):
    """
    CRUD for services. Only the owner (creative) can modify.
    """
    queryset = Service.objects.select_related("creative_profile", "creative_profile__user").all()
    serializer_class = ServiceSerializer
    permission_classes = [IsServiceOwnerOrReadOnly]

    def perform_create(self, serializer):
        user = self.request.user
        if not hasattr(user, "profile"):
            raise PermissionDenied("Only creatives with a profile may create services.")
        serializer.save(creative_profile=user.profile)


class BookingViewSet(viewsets.ModelViewSet):
    """
    Create a booking as a client. Creative can approve/decline via /status/ action.
    """
    queryset = Booking.objects.select_related(
        "service", "client", "service__creative_profile__user"
    ).all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(client=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            raise ValidationError(serializer.errors)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        # Allow creatives to update booking status via PUT
        partial = kwargs.pop('partial', False)
        booking = self.get_object()
        if 'status' in request.data:
            # Only the creative may update status
            if booking.service.creative_profile.user != request.user:
                return Response({"detail": "Only the creative can update status."}, status=403)
            new_status = (request.data.get('status') or '').lower()
            valid = {c for c, _ in Booking.Status.choices}
            if new_status not in valid:
                return Response({"detail": "Invalid status."}, status=400)
            booking.status = new_status
            booking.save()
            return Response(BookingSerializer(booking).data)

        # Otherwise, delegate to default update (e.g., cancel/delete by client)
        return super().update(request, *args, **kwargs)

    @action(detail=True, methods=["put", "patch"])
    def status(self, request, pk=None):
        booking = self.get_object()
        # Only the creative may update status
        if booking.service.creative_profile.user != request.user:
            return Response({"detail": "Only the creative can update status."}, status=403)
        new_status = (request.data.get("status") or "").lower()
        valid = {c for c, _ in Booking.Status.choices}
        if new_status not in valid:
            return Response({"detail": "Invalid status."}, status=400)
        booking.status = new_status
        booking.save()
        return Response(BookingSerializer(booking).data)


class MessageViewSet(viewsets.ModelViewSet):
    """
    Messages are scoped to a booking. Only booking participants can post/read.
    """
    queryset = Message.objects.select_related("booking", "sender").all()
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        booking_id = self.kwargs.get("booking_id") or self.request.query_params.get("booking")
        if booking_id:
            qs = qs.filter(booking_id=booking_id)
        return qs

    def perform_create(self, serializer):
        booking_id = self.kwargs.get("booking_id") or self.request.data.get("booking")
        booking = get_object_or_404(Booking, pk=booking_id)
        if self.request.user not in booking.participants():
            raise PermissionDenied("Only booking participants can post messages.")
        serializer.save(booking=booking, sender=self.request.user)
