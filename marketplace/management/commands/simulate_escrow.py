from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils import timezone

from marketplace.models import (
    User,
    CreativeProfile,
    Service,
    Order,
    PaymentTransaction,
    Escrow,
    CreativeWallet,
)
from rest_framework_simplejwt.tokens import RefreshToken


class Command(BaseCommand):
    help = "Simulate an end-to-end escrow: order paid -> dual fulfill -> wallet credited"

    def handle(self, *args, **options):
        # Create or fetch users
        creative, _ = User.objects.get_or_create(
            username="demo_creative", defaults={"role": User.Roles.CREATIVE}
        )
        client, _ = User.objects.get_or_create(
            username="demo_client", defaults={"role": User.Roles.CLIENT}
        )
        # Ensure passwords for JWT login
        if not creative.has_usable_password():
            creative.set_password("demo12345")
            creative.save(update_fields=["password"])
        if not client.has_usable_password():
            client.set_password("demo12345")
            client.save(update_fields=["password"])

        # Ensure creative profile exists
        profile, _ = CreativeProfile.objects.get_or_create(user=creative)

        # Create service
        service, _ = Service.objects.get_or_create(
            creative_profile=profile,
            title="Demo Service",
            defaults={"description": "Demo", "price": Decimal("100.00")},
        )

        # Create order
        order = Order.objects.create(service=service, buyer=client, total_price=service.price)
        self.stdout.write(self.style.SUCCESS(f"Order #{order.id} created total={order.total_price}"))

        # Simulate payment succeeded
        PaymentTransaction.objects.create(
            order=order,
            provider="stripe",
            provider_id=f"test_{order.id}",
            amount=order.total_price,
            status="succeeded",
        )
        order.status = Order.Status.PAID
        order.save(update_fields=["status"])
        escrow, _ = Escrow.objects.update_or_create(
            order=order,
            defaults={
                "amount": order.total_price,
                "status": Escrow.Status.FUNDED,
                "client_fulfilled": False,
                "creative_fulfilled": False,
            },
        )
        self.stdout.write(self.style.SUCCESS(f"Escrow funded: amount={escrow.amount}"))

        # Mark both sides fulfilled
        escrow.client_fulfilled = True
        escrow.creative_fulfilled = True
        escrow.save(update_fields=["client_fulfilled", "creative_fulfilled"])
        released = escrow.maybe_release()

        fee, creator_amount = escrow.fee_amount, escrow.creator_amount
        wallet = CreativeWallet.for_user(creative)

        self.stdout.write(
            self.style.SUCCESS(
                f"Released={released} fee={fee} creator_amount={creator_amount} wallet_available={wallet.available_balance}"
            )
        )

        # Print JWT tokens for quick API testing
        creative_tokens = RefreshToken.for_user(creative)
        client_tokens = RefreshToken.for_user(client)
        self.stdout.write(self.style.HTTP_INFO("--- Demo Credentials & Tokens ---"))
        self.stdout.write("username=demo_client password=demo12345")
        self.stdout.write(f"client_access={str(client_tokens.access_token)}")
        self.stdout.write("username=demo_creative password=demo12345")
        self.stdout.write(f"creative_access={str(creative_tokens.access_token)}")
