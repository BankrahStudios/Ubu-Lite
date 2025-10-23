# marketplace/serializers.py
from rest_framework import serializers

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
    User,
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "role"]


class ServiceBriefSerializer(serializers.ModelSerializer):
    category_name = serializers.SerializerMethodField()

    class Meta:
        model = Service
        fields = ["id", "title", "category_name", "price"]

    def get_category_name(self, obj):
        return getattr(obj.category, "name", None)


class CreativeProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    portfolio_items = serializers.SerializerMethodField()
    services = serializers.SerializerMethodField()
    avatar = serializers.FileField(read_only=True)

    class Meta:
        model = CreativeProfile
        fields = [
            "id",
            "user",
            "bio",
            "skills",
            "portfolio_links",
            "avatar",
            "hourly_rate",
            "city",
            "region",
            "portfolio_items",
            "services",
        ]

    def get_portfolio_items(self, obj):
        items = obj.portfolio_items.order_by("-created_at")[:12]
        return PortfolioItemSerializer(items, many=True).data

    def get_services(self, obj):
        return ServiceBriefSerializer(obj.services.all()[:12], many=True).data


class ServiceSerializer(serializers.ModelSerializer):
    creative_profile = serializers.PrimaryKeyRelatedField(read_only=True)
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), allow_null=True, required=False)

    class Meta:
        model = Service
        fields = ["id", "creative_profile", "title", "description", "category", "price"]


class BookingSerializer(serializers.ModelSerializer):
    client = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Booking
        fields = [
            "id",
            "service",
            "client",
            "date",
            "duration_minutes",
            "notes",
            "meet_url",
            "status",
        ]
        read_only_fields = ["status"]

    def create(self, validated_data):
        # status is always defaulted; client is set in view
        return super().create(validated_data)


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ["id", "booking", "sender", "content", "timestamp"]
        read_only_fields = ["timestamp", "sender", "booking"]


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "slug", "name", "description"]


class GigExtraSerializer(serializers.ModelSerializer):
    class Meta:
        model = GigExtra
        fields = ["id", "service", "title", "description", "price"]


class OrderExtraSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderExtra
        fields = ["id", "order", "extra", "price"]


class OrderSerializer(serializers.ModelSerializer):
    buyer = serializers.PrimaryKeyRelatedField(read_only=True)
    order_extras = OrderExtraSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "service",
            "buyer",
            "created_at",
            "updated_at",
            "delivery_deadline",
            "total_price",
            "status",
            "instructions",
            "order_extras",
        ]
        read_only_fields = ["created_at", "updated_at", "total_price", "status"]

    def create(self, validated_data):
        # calculate total price from service price + selected extras.
        # Caller should set extras separately if needed.
        return super().create(validated_data)


class ReviewSerializer(serializers.ModelSerializer):
    author = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Review
        fields = ["id", "order", "author", "rating", "comment", "created_at"]
        read_only_fields = ["created_at"]


class PaymentTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentTransaction
        fields = [
            "id",
            "order",
            "provider",
            "provider_id",
            "amount",
            "status",
            "created_at",
        ]
        read_only_fields = ["created_at"]


class PortfolioItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PortfolioItem
        fields = [
            "id",
            "profile",
            "title",
            "media_type",
            "file",
            "external_url",
            "created_at",
        ]
        read_only_fields = ["profile", "created_at"]


# ---- Escrow / Wallets ----
class EscrowSerializer(serializers.ModelSerializer):
    class Meta:
        model = Escrow
        fields = [
            "id",
            "order",
            "amount",
            "fee_percent",
            "fee_amount",
            "creator_amount",
            "status",
            "client_fulfilled",
            "creative_fulfilled",
            "released_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "fee_amount",
            "creator_amount",
            "status",
            "released_at",
            "created_at",
            "updated_at",
        ]


class WalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreativeWallet
        fields = ["available_balance", "pending_balance", "updated_at"]


class WithdrawalRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = WithdrawalRequest
        fields = ["id", "amount", "status", "created_at", "processed_at"]
        read_only_fields = ["status", "created_at", "processed_at"]
