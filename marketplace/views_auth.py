from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from .models import User, CreativeProfile
from .serializers import UserSerializer

class RegisterView(APIView):
    permission_classes = [AllowAny]
    @transaction.atomic
    def post(self, request):
        role = request.data.get("role")
        if role not in ("creative", "client"):
            return Response({"detail": "role must be creative or client"}, status=400)

        username = request.data.get('username')
        password = request.data.get('password')
        if not username or not password:
            return Response({"detail": "username and password are required"}, status=400)

        if User.objects.filter(username=username).exists():
            return Response({"detail": "username already exists"}, status=400)

        user = User.objects.create_user(
            username=username,
            email=request.data.get("email", ""),
            password=password,
            role=role,
        )

        if role == "creative":
            CreativeProfile.objects.create(user=user)

        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
