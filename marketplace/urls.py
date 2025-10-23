from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    BookingViewSet,
    CategoryViewSet,
    CreatePaymentIntentView,
    CreativeProfileViewSet,
    EscrowViewSet,
    PortfolioItemViewSet,
    GigExtraViewSet,
    MessageViewSet,
    OrderViewSet,
    PaymentTransactionViewSet,
    WalletView,
    WithdrawalRequestViewSet,
    PublishableKeyView,
    DemoCreateFundedOrderView,
    DemoWithdrawView,
    ReviewViewSet,
    ServiceViewSet,
    StripeWebhookView,
)
from .views_auth import RegisterView, GoogleLoginView, GoogleClientIdView

router = DefaultRouter()
router.register(r"creatives", CreativeProfileViewSet, basename="creatives")
router.register(r"services", ServiceViewSet, basename="services")
router.register(r"bookings", BookingViewSet, basename="bookings")
router.register(r"portfolio", PortfolioItemViewSet, basename="portfolio")
router.register(r"categories", CategoryViewSet, basename="categories")
router.register(r"extras", GigExtraViewSet, basename="extras")
router.register(r"orders", OrderViewSet, basename="orders")
router.register(r"reviews", ReviewViewSet, basename="reviews")
router.register(r"payments", PaymentTransactionViewSet, basename="payments")
router.register(r"escrows", EscrowViewSet, basename="escrows")
router.register(r"withdrawals", WithdrawalRequestViewSet, basename="withdrawals")

# messages under /messages/ and /bookings/<id>/messages/
message_list = MessageViewSet.as_view({"get": "list", "post": "create"})

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/google/", GoogleLoginView.as_view(), name="google-login"),
    path("auth/google/client-id/", GoogleClientIdView.as_view(), name="google-client-id"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("", include(router.urls)),
    path("messages/", message_list, name="messages-list"),
    path("bookings/<int:booking_id>/messages/", message_list, name="booking-messages"),
    # wallets
    path("wallet/", WalletView.as_view(), name="wallet"),
    path("demo/create-funded-order/", DemoCreateFundedOrderView.as_view(), name="demo-create-funded-order"),
    path("demo/withdraw/", DemoWithdrawView.as_view(), name="demo-withdraw"),
    # payments
    path(
        "payments/create-intent/",
        CreatePaymentIntentView.as_view(),
        name="create-payment-intent",
    ),
    path("payments/webhook/", StripeWebhookView.as_view(), name="stripe-webhook"),
    path(
        "payments/publishable-key/",
        PublishableKeyView.as_view(),
        name="stripe-publishable-key",
    ),
]
