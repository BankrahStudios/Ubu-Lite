import os
import sys

from django.urls import reverse
from rest_framework.test import APIClient

import django

# Ensure project root is on sys.path so Django settings can be loaded
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ubu_lite.settings")
django.setup()

from marketplace.models import CreativeProfile, User  # noqa: E402

client = APIClient()

# Use environment variable for debug/test password to avoid hardcoded secrets
TEST_PASSWORD = os.environ.get("UBU_LITE_TEST_PASSWORD", "Pass123!@#")

# create or get users (idempotent)
maya, created = User.objects.get_or_create(
    username="maya_dbg", defaults={"role": "creative"}
)
if created:
    maya.set_password(TEST_PASSWORD)
    maya.save()
maya_profile, _ = CreativeProfile.objects.get_or_create(
    user=maya, defaults={"city": "Nairobi"}
)

chris, created = User.objects.get_or_create(
    username="chris_dbg", defaults={"role": "client"}
)
if created:
    chris.set_password(TEST_PASSWORD)
    chris.save()

# login maya
resp = client.post(
    reverse("token_obtain_pair"),
    {"username": "maya_dbg", "password": TEST_PASSWORD},
    format="json",
)
print("maya login", resp.status_code, getattr(resp, "data", resp.content))
maya_token = (getattr(resp, "data", {}) or {}).get("access")
if maya_token:
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {maya_token}")
else:
    print("Failed to obtain maya token; aborting")
    raise SystemExit(1)

# create service
resp = client.post(
    reverse("services-list"),
    {"title": "Logo", "description": "Nice", "category": "design", "price": "100.00"},
    format="json",
)
print("create service", resp.status_code, getattr(resp, "data", resp.content))
service_id = (getattr(resp, "data", {}) or {}).get("id")
if not service_id:
    print("Service creation failed; aborting")
    raise SystemExit(1)

# login chris
client.credentials()
resp = client.post(
    reverse("token_obtain_pair"),
    {"username": "chris_dbg", "password": TEST_PASSWORD},
    format="json",
)
print("chris login", resp.status_code, getattr(resp, "data", resp.content))
chris_token = (getattr(resp, "data", {}) or {}).get("access")
if chris_token:
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {chris_token}")
else:
    print("Failed to obtain chris token; aborting")
    raise SystemExit(1)

# attempt booking
resp = client.post(
    reverse("bookings-list"),
    {"service": service_id, "date": "2030-01-01T10:00:00Z"},
    format="json",
)
print("booking create", resp.status_code, getattr(resp, "data", resp.content))

if resp.status_code != 201:
    # More verbose dump for debugging; handle decoding errors specifically
    try:
        print("raw content:", resp.content.decode())
    except UnicodeDecodeError:
        print("raw content (bytes):", resp.content)

# show bookings list
resp = client.get(reverse("bookings-list"))
print("bookings list", resp.status_code, getattr(resp, "data", resp.content))
