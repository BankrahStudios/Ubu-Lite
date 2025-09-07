from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import CreativeProfileViewSet, ServiceViewSet, BookingViewSet, MessageViewSet
from .views_auth import RegisterView

router = DefaultRouter()
router.register(r"creatives", CreativeProfileViewSet, basename="creatives")
router.register(r"services",  ServiceViewSet,       basename="services")
router.register(r"bookings",  BookingViewSet,       basename="bookings")

# messages under /messages/ and /bookings/<id>/messages/
message_list = MessageViewSet.as_view({"get": "list", "post": "create"})

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/",    TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/refresh/",  TokenRefreshView.as_view(),     name="token_refresh"),
    path("", include(router.urls)),
    path("messages/", message_list, name="messages-list"),
    path("bookings/<int:booking_id>/messages/", message_list, name="booking-messages"),
]
