from decimal import Decimal

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from marketplace.models import CreativeProfile, Service, Order, PaymentTransaction, Escrow, CreativeWallet


class Command(BaseCommand):
    help = "End-to-end API walkthrough: create order (client), simulate payment, fulfill client+creative via API, show wallet."

    def handle(self, *args, **options):
        User = get_user_model()

        # Ensure demo users and service exist
        creative = User.objects.get_or_create(username="demo_creative", defaults={"role": "creative"})[0]
        client = User.objects.get_or_create(username="demo_client", defaults={"role": "client"})[0]
        if not creative.has_usable_password():
            creative.set_password("demo12345"); creative.save(update_fields=["password"])
        if not client.has_usable_password():
            client.set_password("demo12345"); client.save(update_fields=["password"])

        profile, _ = CreativeProfile.objects.get_or_create(user=creative)
        service, _ = Service.objects.get_or_create(
            creative_profile=profile,
            title="Demo Service",
            defaults={"description": "Demo", "price": Decimal("100.00")},
        )

        # Login client to obtain JWT via API
        client_api = APIClient()
        client_access = str(RefreshToken.for_user(client).access_token)
        client_api.credentials(HTTP_AUTHORIZATION=f"Bearer {client_access}")

        # Create an order as the client
        resp = client_api.post("/api/orders/", {"service": service.id, "instructions": "Do great work"}, format="json")
        if resp.status_code not in (200, 201):
            self.stderr.write(f"Create order failed: {resp.status_code} {getattr(resp, 'data', None)}")
            return
        order_id = resp.data.get("id")
        total_price = resp.data.get("total_price")
        self.stdout.write(self.style.SUCCESS(f"Order created via API id={order_id} total={total_price}"))

        # Simulate payment success (bypass external Stripe) and fund escrow
        order = Order.objects.get(id=order_id)
        PaymentTransaction.objects.create(order=order, provider="stripe", provider_id=f"api_{order_id}", amount=order.total_price, status="succeeded")
        order.status = Order.Status.PAID
        order.save(update_fields=["status"])
        escrow, _ = Escrow.objects.update_or_create(order=order, defaults={"amount": order.total_price, "status": Escrow.Status.FUNDED})
        self.stdout.write(self.style.SUCCESS(f"Escrow funded id={escrow.id} amount={escrow.amount}"))

        # Login creative and mark creative fulfillment via API
        creative_api = APIClient()
        creative_access = str(RefreshToken.for_user(creative).access_token)
        creative_api.credentials(HTTP_AUTHORIZATION=f"Bearer {creative_access}")
        resp = creative_api.post(f"/api/escrows/{escrow.id}/creative_fulfill/")
        self.stdout.write(self.style.HTTP_INFO(f"creative_fulfill status={resp.status_code}"))

        # Client marks client fulfillment via API
        resp = client_api.post(f"/api/escrows/{escrow.id}/client_fulfill/")
        self.stdout.write(self.style.HTTP_INFO(f"client_fulfill status={resp.status_code}"))

        # Show wallet
        w = CreativeWallet.for_user(creative)
        self.stdout.write(self.style.SUCCESS(f"Wallet available={w.available_balance} pending={w.pending_balance}"))
