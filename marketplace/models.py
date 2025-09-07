from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    class Roles(models.TextChoices):
        CREATIVE = "creative", "Creative"
        CLIENT = "client", "Client"
    role = models.CharField(max_length=16, choices=Roles.choices)

    def is_creative(self):
        return self.role == self.Roles.CREATIVE

class CreativeProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    bio = models.TextField(blank=True)
    skills = models.CharField(max_length=255, blank=True)
    portfolio_links = models.TextField(blank=True)
    hourly_rate = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    city = models.CharField(max_length=64, blank=True)
    region = models.CharField(max_length=64, blank=True)

    def __str__(self):
        return f"{self.user.username}"

class Service(models.Model):
    creative_profile = models.ForeignKey(
        CreativeProfile, on_delete=models.CASCADE, related_name="services"
    )
    title = models.CharField(max_length=120)
    description = models.TextField()
    category = models.CharField(max_length=64)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.title

class Booking(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        DECLINED = "declined", "Declined"

    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name="bookings")
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name="bookings")
    date = models.DateTimeField()
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PENDING)

    def participants(self):
        return [self.client, self.service.creative_profile.user]

class Message(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["timestamp"]
