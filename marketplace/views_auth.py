from django.db import transaction
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import CreativeProfile, User
from .serializers import UserSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from django.conf import settings

try:
    from google.oauth2 import id_token as google_id_token
    from google.auth.transport import requests as google_requests
except Exception:  # pragma: no cover - optional import for environments without google-auth
    google_id_token = None
    google_requests = None


class RegisterView(APIView):
    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request):
        role = request.data.get("role")
        if role not in ("creative", "client"):
            return Response({"detail": "role must be creative or client"}, status=400)

        username = request.data.get("username")
        password = request.data.get("password")
        if not username or not password:
            return Response(
                {"detail": "username and password are required"}, status=400
            )

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


class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get("id_token") or request.data.get("credential")
        role = request.data.get("role") or "client"
        if not token:
            return Response({"detail": "id_token is required"}, status=400)

        if not getattr(settings, "GOOGLE_CLIENT_ID", None):
            return Response({"detail": "GOOGLE_CLIENT_ID not configured"}, status=500)

        if not google_id_token or not google_requests:
            return Response({"detail": "google-auth library not available"}, status=500)

        try:
            idinfo = google_id_token.verify_oauth2_token(
                token, google_requests.Request(), settings.GOOGLE_CLIENT_ID
            )
        except Exception as e:  # verification failed
            return Response({"detail": f"Invalid Google token: {e}"}, status=400)

        email = idinfo.get("email")
        sub = idinfo.get("sub")
        name = idinfo.get("name") or (email.split("@")[0] if email else sub)

        if not email:
            return Response({"detail": "Email not present in token"}, status=400)

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "username": name,
                "role": role if role in ("creative", "client") else "client",
            },
        )

        if created and user.role == "creative":
            CreativeProfile.objects.create(user=user)

        refresh = RefreshToken.for_user(user)
        data = {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": UserSerializer(user).data,
        }
        return Response(data, status=200)


class GoogleClientIdView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        cid = getattr(settings, "GOOGLE_CLIENT_ID", "")
        return Response({"client_id": cid})
