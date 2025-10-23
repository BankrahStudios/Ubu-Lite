from django.contrib import admin

from .models import (
    Booking,
    CreativeProfile,
    Message,
    Service,
    User,
    PortfolioItem,
    CreativeWallet,
    Escrow,
    WithdrawalRequest,
)


@admin.register(User)
class UserAdmin(admin.ModelAdmin):

    list_display = ("id", "username", "email", "role", "is_staff")
    search_fields = ("username", "email")


@admin.register(CreativeProfile)
class CreativeProfileAdmin(admin.ModelAdmin):

    list_display = ("id", "user", "city", "region", "hourly_rate")
    search_fields = ("user__username", "city", "region", "skills")


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):

    list_display = ("id", "title", "creative_profile", "category", "price")
    search_fields = ("title", "category", "creative_profile__user__username")


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):

    list_display = ("id", "service", "client", "date", "status", "meet_url")
    list_filter = ("status",)
    search_fields = ("service__title", "client__username")


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):

    list_display = ("id", "booking", "sender", "timestamp")
    search_fields = ("sender__username", "booking__service__title")


@admin.register(PortfolioItem)
class PortfolioItemAdmin(admin.ModelAdmin):
    list_display = ("id", "profile", "title", "media_type", "created_at")
    list_filter = ("media_type",)
    search_fields = ("title", "profile__user__username")


@admin.register(CreativeWallet)
class CreativeWalletAdmin(admin.ModelAdmin):
    list_display = ("user", "available_balance", "pending_balance", "updated_at")


@admin.register(Escrow)
class EscrowAdmin(admin.ModelAdmin):
    list_display = (
        "order",
        "amount",
        "fee_percent",
        "fee_amount",
        "creator_amount",
        "status",
        "client_fulfilled",
        "creative_fulfilled",
        "released_at",
    )
    list_filter = ("status",)


@admin.register(WithdrawalRequest)
class WithdrawalRequestAdmin(admin.ModelAdmin):
    list_display = ("user", "amount", "status", "created_at", "processed_at")
    list_filter = ("status",)
