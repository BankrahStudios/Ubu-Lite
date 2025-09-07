# marketplace/serializers.py
from rest_framework import serializers
from .models import User, CreativeProfile, Service, Booking, Message

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "role"]

class CreativeProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = CreativeProfile
        fields = [
            "id", "user", "bio", "skills", "portfolio_links",
            "hourly_rate", "city", "region"
        ]

class ServiceSerializer(serializers.ModelSerializer):
    creative_profile = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Service
        fields = ["id", "creative_profile", "title", "description", "category", "price"]

class BookingSerializer(serializers.ModelSerializer):
    client = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Booking
        fields = ["id", "service", "client", "date", "status"]
        read_only_fields = ["status"]

    def create(self, validated_data):
        # status is always defaulted; client is set in view
        return super().create(validated_data)

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ["id", "booking", "sender", "content", "timestamp"]
        read_only_fields = ["timestamp", "sender", "booking"]


