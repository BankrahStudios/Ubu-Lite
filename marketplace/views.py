"""API views for the marketplace app.

Includes viewsets and API endpoints for services, bookings, messages,
orders, payments and Stripe webhook handling used in the demo app.
"""

import logging
from django.conf import settings
from django.db.models import Q
from django.shortcuts import get_object_or_404
import stripe
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination

from .models import (
    Booking,
    Category,
    CreativeProfile,
    CreativeWallet,
    PortfolioItem,
    GigExtra,
    Message,
    Order,
    OrderExtra,
    Escrow,
    PaymentTransaction,
    WithdrawalRequest,
    Review,
    Service,
)
from .permissions import IsServiceOwnerOrReadOnly
from django.core.mail import send_mail, EmailMessage
from django.conf import settings as dj_settings
from .serializers import (
    BookingSerializer,
    CategorySerializer,
    CreativeProfileSerializer,
    PortfolioItemSerializer,
    GigExtraSerializer,
    MessageSerializer,
    OrderSerializer,
    EscrowSerializer,
    PaymentTransactionSerializer,
    WalletSerializer,
    WithdrawalRequestSerializer,
    ReviewSerializer,
    ServiceSerializer,
    # UserSerializer (unused here)
)

# configure stripe
stripe.api_key = getattr(settings, "STRIPE_SECRET_KEY", None)
_logger = logging.getLogger(__name__)


class SmallPage(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 50

def _make_ics(booking: Booking) -> bytes:
    """Create a minimal ICS calendar event for the booking (UTC).

    Returns bytes suitable for EmailMessage.attach(filename, content, mimetype).
    """
    try:
        dtstart = booking.date.strftime("%Y%m%dT%H%M%SZ")
        # Default to 60 minutes if duration not set
        minutes = booking.duration_minutes or 60
        dtend = (booking.date + timezone.timedelta(minutes=minutes)).strftime("%Y%m%dT%H%M%SZ")
        uid = f"booking-{booking.pk}@ubulite"
        summary = f"UBU Lite • {booking.service.title}"
        desc = f"Meet: {booking.meet_url or 'TBA'}"
        ics = (
            "BEGIN:VCALENDAR\r\n"
            "VERSION:2.0\r\n"
            "PRODID:-//UBU Lite//EN\r\n"
            "BEGIN:VEVENT\r\n"
            f"UID:{uid}\r\n"
            f"DTSTART:{dtstart}\r\n"
            f"DTEND:{dtend}\r\n"
            f"SUMMARY:{summary}\r\n"
            f"DESCRIPTION:{desc}\r\n"
            "END:VEVENT\r\n"
            "END:VCALENDAR\r\n"
        )
        return ics.encode("utf-8")
    except Exception:
        return b""


class CreativeProfileViewSet(viewsets.ReadOnlyModelViewSet):
    """
    List / retrieve creatives. Search by ?location=<city or region>
    """

    queryset = CreativeProfile.objects.select_related("user").all()
    serializer_class = CreativeProfileSerializer
    pagination_class = SmallPage

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

    @action(detail=False, methods=["get", "patch"], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Get or update the current user's creative profile.

        - GET returns the profile (creates an empty one if the user is a creative without a profile yet).
        - PATCH updates allowed fields: bio, skills, hourly_rate, city, region, portfolio_links.
        """
        user = request.user
        profile = getattr(user, "profile", None)
        if request.method.lower() == "get":
            if profile is None and getattr(user, "is_creative", lambda: False)():
                profile = CreativeProfile.objects.create(user=user)
            if profile is None:
                raise PermissionDenied("Only creatives have profiles.")
            return Response(self.get_serializer(profile).data)

        # PATCH
        if profile is None:
            raise PermissionDenied("Only creatives can update profiles.")
        fields = ["bio", "skills", "hourly_rate", "city", "region", "portfolio_links"]
        for f in fields:
            if f in request.data:
                setattr(profile, f, request.data.get(f))
        # avatar upload
        if "avatar" in request.FILES:
            profile.avatar = request.FILES["avatar"]
        profile.save()
        return Response(self.get_serializer(profile).data)


class ServiceViewSet(viewsets.ModelViewSet):
    """
    CRUD for services. Only the owner (creative) can modify.
    """

    queryset = Service.objects.select_related(
        "creative_profile", "creative_profile__user"
    ).all()
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
    pagination_class = SmallPage

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if not user.is_authenticated:
            return qs.none()
        # Only show bookings where the user is a participant (client or creative)
        return qs.filter(Q(client=user) | Q(service__creative_profile__user=user)).order_by("-date", "-pk")

    def perform_create(self, serializer):
        serializer.save(client=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            raise ValidationError(serializer.errors)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        try:
            b = Booking.objects.select_related("service__creative_profile__user").get(pk=serializer.data["id"])
            subj = "New booking request"
            msg = f"Booking #{b.pk} requested for service '{b.service.title}' on {b.date}."
            to = [b.service.creative_profile.user.email or ""]
            if to and to[0]:
                send_mail(subj, msg, dj_settings.DEFAULT_FROM_EMAIL, to, fail_silently=True)
        except Exception:
            pass
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )

    def update(self, request, *args, **kwargs):
        # Allow creatives to update booking status via PUT
        kwargs.pop("partial", None)
        booking = self.get_object()
        if "status" in request.data:
            # Only the creative may update status
            if booking.service.creative_profile.user != request.user:
                return Response(
                    {"detail": "Only the creative can update status."}, status=403
                )
            new_status = (request.data.get("status") or "").lower()
            valid = {c for c, _ in Booking.Status.choices}
            if new_status not in valid:
                return Response({"detail": "Invalid status."}, status=400)
            booking.status = new_status
            booking.save()
            try:
                subj = f"Booking #{booking.pk} status updated"
                msg = f"Your booking for '{booking.service.title}' is now {booking.status}."
                to = [booking.client.email or ""]
                if to and to[0]:
                    if booking.status == Booking.Status.APPROVED:
                        email = EmailMessage(subj, msg, dj_settings.DEFAULT_FROM_EMAIL, to)
                        ics = _make_ics(booking)
                        if ics:
                            email.attach("booking.ics", ics, "text/calendar")
                        email.send(fail_silently=True)
                    else:
                        send_mail(subj, msg, dj_settings.DEFAULT_FROM_EMAIL, to, fail_silently=True)
            except Exception:
                pass
            return Response(BookingSerializer(booking).data)

        # Otherwise, delegate to default update (e.g., cancel/delete by client)
        return super().update(request, *args, **kwargs)

    @action(detail=True, methods=["put", "patch"])
    def status(self, request, pk=None):
        booking = self.get_object()
        # Only the creative may update status
        if booking.service.creative_profile.user != request.user:
            return Response(
                {"detail": "Only the creative can update status."}, status=403
            )
        new_status = (request.data.get("status") or "").lower()
        valid = {c for c, _ in Booking.Status.choices}
        if new_status not in valid:
            return Response({"detail": "Invalid status."}, status=400)
        booking.status = new_status
        booking.save()
        try:
            subj = f"Booking #{booking.pk} status updated"
            msg = f"Your booking for '{booking.service.title}' is now {booking.status}."
            to = [booking.client.email or ""]
            if to and to[0]:
                if booking.status == Booking.Status.APPROVED:
                    email = EmailMessage(subj, msg, dj_settings.DEFAULT_FROM_EMAIL, to)
                    ics = _make_ics(booking)
                    if ics:
                        email.attach("booking.ics", ics, "text/calendar")
                    email.send(fail_silently=True)
                else:
                    send_mail(subj, msg, dj_settings.DEFAULT_FROM_EMAIL, to, fail_silently=True)
        except Exception:
            pass
        return Response(BookingSerializer(booking).data)

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        booking = self.get_object()
        if booking.service.creative_profile.user != request.user:
            return Response({"detail": "Only the creative can approve."}, status=403)
        booking.status = Booking.Status.APPROVED
        booking.decision_at = None
        booking.save()
        return Response(BookingSerializer(booking).data)

    @action(detail=True, methods=["post"])
    def decline(self, request, pk=None):
        booking = self.get_object()
        if booking.service.creative_profile.user != request.user:
            return Response({"detail": "Only the creative can decline."}, status=403)
        booking.status = Booking.Status.DECLINED
        booking.decision_at = None
        booking.save()
        return Response(BookingSerializer(booking).data)

    @action(detail=True, methods=["post"])
    def schedule(self, request, pk=None):
        """Set meeting URL and optional duration. Creative only."""
        booking = self.get_object()
        if booking.service.creative_profile.user != request.user:
            return Response({"detail": "Only the creative can schedule."}, status=403)
        booking.meet_url = (request.data.get("meet_url") or "").strip()
        if request.data.get("duration_minutes"):
            try:
                booking.duration_minutes = int(request.data.get("duration_minutes"))
            except ValueError:
                return Response({"detail": "Invalid duration."}, status=400)
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
        booking_id = self.kwargs.get("booking_id") or self.request.query_params.get(
            "booking"
        )
        if booking_id:
            qs = qs.filter(booking_id=booking_id)
        # Restrict to messages where the user is a booking participant
        user = self.request.user
        if not user.is_authenticated:
            return qs.none()
        return qs.filter(
            Q(booking__client=user)
            | Q(booking__service__creative_profile__user=user)
        )

    def perform_create(self, serializer):
        booking_id = self.kwargs.get("booking_id") or self.request.data.get("booking")
        booking = get_object_or_404(Booking, pk=booking_id)
        if self.request.user not in booking.participants():
            raise PermissionDenied("Only booking participants can post messages.")
        serializer.save(booking=booking, sender=self.request.user)


# --- Marketplace extensions: categories, orders, extras, reviews (starter) ---
class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class GigExtraViewSet(viewsets.ModelViewSet):
    queryset = GigExtra.objects.select_related("service").all()
    serializer_class = GigExtraSerializer
    permission_classes = [IsServiceOwnerOrReadOnly]


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.select_related("service", "buyer").all()
    serializer_class = OrderSerializer

    def perform_create(self, serializer):
        # buyer is the current user
        buyer = self.request.user
        order = serializer.save(buyer=buyer)
    # Calculate total price from service base price and any extras provided
        total = order.service.price
        extras = self.request.data.get("extras", [])
        for extra_id in extras:
            try:
                extra = GigExtra.objects.get(pk=extra_id, service=order.service)
                OrderExtra.objects.create(order=order, extra=extra, price=extra.price)
                total += extra.price
            except GigExtra.DoesNotExist:
                continue
        order.total_price = total
        order.save()
    # NOTE: place to call payment provider (create intent/charge).
    # Here we just create a PaymentTransaction record stub.
        PaymentTransaction.objects.create(
            order=order,
            provider="stub",
            provider_id=f"stub-{order.pk}",
            amount=order.total_price,
            status="initiated",
        )
    # NOTE: in production you'd call a payment provider here and
    # set Order.total_price


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.select_related("order", "author").all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]


class PaymentTransactionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PaymentTransaction.objects.select_related("order").all()
    serializer_class = PaymentTransactionSerializer


class EscrowViewSet(viewsets.ModelViewSet):
    """Manage escrow for orders and mark fulfillment from both sides.

    Typical flow:
    - Escrow is auto-created when payment succeeds (webhook).
    - Client and creative mark fulfillment; when both true, funds release and
      67% is credited to creative wallet, 33% retained as fee.
    """

    queryset = Escrow.objects.select_related("order", "order__service", "order__buyer").all()
    serializer_class = EscrowSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.is_staff:
            return qs
        return qs.filter(Q(order__buyer=user) | Q(order__service__creative_profile__user=user))

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def client_fulfill(self, request, pk=None):
        escrow = self.get_object()
        if escrow.order.buyer != request.user and not request.user.is_staff:
            return Response({"detail": "Only the client can mark fulfillment."}, status=403)
        escrow.client_fulfilled = True
        escrow.save(update_fields=["client_fulfilled", "updated_at"])
        released = escrow.maybe_release()
        return Response({"released": released, **EscrowSerializer(escrow).data})

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def creative_fulfill(self, request, pk=None):
        escrow = self.get_object()
        if escrow.order.service.creative_profile.user != request.user and not request.user.is_staff:
            return Response({"detail": "Only the creative can mark fulfillment."}, status=403)
        escrow.creative_fulfilled = True
        escrow.save(update_fields=["creative_fulfilled", "updated_at"])
        released = escrow.maybe_release()
        return Response({"released": released, **EscrowSerializer(escrow).data})

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def refund(self, request, pk=None):
        escrow = self.get_object()
        if not request.user.is_staff:
            return Response({"detail": "Admins only for refund in this demo."}, status=403)
        if escrow.status != Escrow.Status.FUNDED:
            return Response({"detail": "Escrow not in funded state."}, status=400)
        escrow.status = Escrow.Status.REFUNDED
        escrow.save(update_fields=["status", "updated_at"])
        return Response(EscrowSerializer(escrow).data)


class WalletView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        wallet = CreativeWallet.for_user(request.user)
        return Response(WalletSerializer(wallet).data)


class WithdrawalRequestViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = WithdrawalRequestSerializer

    def get_queryset(self):
        return WithdrawalRequest.objects.filter(user=self.request.user).order_by("-created_at")

    def perform_create(self, serializer):
        # basic guard: amount must be <= available
        wallet = CreativeWallet.for_user(self.request.user)
        amount = serializer.validated_data.get("amount")
        if amount > wallet.available_balance:
            raise ValidationError({"amount": "Insufficient balance"})
        serializer.save(user=self.request.user)

class PortfolioItemViewSet(viewsets.ModelViewSet):
    """Creatives can manage their portfolio items (images/videos or links)."""

    queryset = PortfolioItem.objects.select_related("profile", "profile__user").all()
    serializer_class = PortfolioItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        # Non-staff only see their own items
        if not user.is_staff:
            qs = qs.filter(profile__user=user)
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        if not hasattr(user, "profile"):
            raise PermissionDenied("Only creatives can add portfolio items.")
        serializer.save(profile=user.profile)


class CreatePaymentIntentView(APIView):
    """Create a Stripe PaymentIntent for an order (dev/demo only).

    POST body: { order: <id> }
    Returns: { client_secret }
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_id = request.data.get("order")
        order = get_object_or_404(Order, pk=order_id)
        # only buyer can create payment for their order
        if order.buyer != request.user:
            return Response(
                {"detail": "Only the buyer may pay for this order."}, status=403
            )

        amount = int(order.total_price * 100)  # cents
        # Create PaymentIntent
        try:
            intent = stripe.PaymentIntent.create(
                amount=amount,
                currency="usd",
                metadata={"order_id": str(order.id)},
            )
        except stripe.error.StripeError:
            _logger.exception("Stripe error creating PaymentIntent for order %s", order.id)
            return Response({"detail": "stripe error"}, status=400)

        # record a stub transaction
        PaymentTransaction.objects.create(
            order=order,
            provider="stripe",
            provider_id=intent.id,
            amount=order.total_price,
            status="created",
        )
        return Response({"client_secret": intent.client_secret})


class StripeWebhookView(APIView):
    # webhook endpoint; do not require auth — validate signature header
    authentication_classes = []

    def post(self, request):
        payload = request.body
        sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")
        endpoint_secret = getattr(settings, "STRIPE_WEBHOOK_SECRET", None)
        try:
            event = (
                stripe.Webhook.construct_event(
                    payload, sig_header, endpoint_secret
                )
                if endpoint_secret
                else stripe.Event.construct_from(request.data, stripe.api_key)
            )
        except (ValueError, stripe.error.SignatureVerificationError, stripe.error.StripeError):
            # ValueError can occur parsing payload; SignatureVerificationError when signature fails.
            _logger.exception("Invalid Stripe webhook payload or signature")
            return Response(status=400)

        # Handle payment_intent.succeeded
        if event["type"] == "payment_intent.succeeded":
            intent = event["data"]["object"]
            provider_id = intent.get("id")
            # find PaymentTransaction and update
            pt = PaymentTransaction.objects.filter(
                provider="stripe", provider_id=provider_id
            ).first()
            if pt:
                pt.status = "succeeded"
                pt.save()
                # update order
                order = pt.order
                order.status = Order.Status.PAID
                order.save()
                # Create or update escrow record for the order when paid
                Escrow.objects.update_or_create(
                    order=order,
                    defaults={
                        "amount": order.total_price,
                        "status": Escrow.Status.FUNDED,
                        "client_fulfilled": False,
                        "creative_fulfilled": False,
                    },
                )

        return Response(status=200)


class PublishableKeyView(APIView):
    """
    Return the Stripe publishable key for client-side initialization.

    This value is safe to expose to the browser.
    """

    permission_classes = []

    def get(self, request):
        return Response(
            {"publishableKey": getattr(settings, "STRIPE_PUBLISHABLE_KEY", "")}
        )


class DemoCreateFundedOrderView(APIView):
    """Create a funded demo order for the authenticated client.

    - Ensures a demo creative + service exist.
    - Creates an order for the caller as buyer with price 100.00.
    - Simulates payment success and funds an escrow for the full amount.
    Returns: { order_id, escrow_id, amount }
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        from decimal import Decimal
        from django.contrib.auth import get_user_model

        User = get_user_model()
        buyer = request.user

        # Create/find demo creative and service
        creative = User.objects.get_or_create(
            username="demo_creative", defaults={"role": "creative"}
        )[0]
        profile, _ = CreativeProfile.objects.get_or_create(user=creative)
        service, _ = Service.objects.get_or_create(
            creative_profile=profile,
            title="Demo Service",
            defaults={"description": "Demo", "price": Decimal("100.00")},
        )

        # Create order for caller
        order = Order.objects.create(service=service, buyer=buyer, total_price=service.price, status=Order.Status.PAID)
        PaymentTransaction.objects.create(order=order, provider="stripe", provider_id=f"demo_{order.id}", amount=order.total_price, status="succeeded")

        escrow, _ = Escrow.objects.update_or_create(
            order=order,
            defaults={
                "amount": order.total_price,
                "status": Escrow.Status.FUNDED,
                "client_fulfilled": False,
                "creative_fulfilled": False,
            },
        )
        return Response({"order_id": order.id, "escrow_id": escrow.id, "amount": str(escrow.amount)})


class DemoWithdrawView(APIView):
    """Move funds from available -> pending by creating an approved WithdrawalRequest.

    POST body: { amount?: decimal-string }  If omitted, withdraw full available balance.
    Returns: { requested, available_balance, pending_balance, status }
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        from decimal import Decimal, InvalidOperation

        user = request.user
        wallet = CreativeWallet.for_user(user)

        raw_amount = (request.data or {}).get("amount")
        if raw_amount is None or str(raw_amount).strip() == "":
            amount = wallet.available_balance
        else:
            try:
                amount = Decimal(str(raw_amount))
            except InvalidOperation:
                raise ValidationError({"amount": "Invalid amount"})
        if amount <= 0:
            raise ValidationError({"amount": "Must be > 0"})
        if amount > wallet.available_balance:
            raise ValidationError({"amount": "Insufficient balance"})

        wr = WithdrawalRequest.objects.create(user=user, amount=amount)
        ok = wr.approve()
        return Response(
            {
                "requested": str(amount),
                "status": wr.status,
                "available_balance": str(CreativeWallet.for_user(user).available_balance),
                "pending_balance": str(CreativeWallet.for_user(user).pending_balance),
            }
        )
