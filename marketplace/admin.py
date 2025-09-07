from django.contrib import admin
from .models import User, CreativeProfile, Service, Booking, Message


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
	list_display = ("id", "service", "client", "date", "status")
	list_filter = ("status",)
	search_fields = ("service__title", "client__username")


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
	list_display = ("id", "booking", "sender", "timestamp")
	search_fields = ("sender__username", "booking__service__title")
