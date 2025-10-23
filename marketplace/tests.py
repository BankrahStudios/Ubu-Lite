import os
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import CreativeProfile, User

# Use an environment variable for test password so it's not hardcoded in the repo
TEST_PASSWORD = os.environ.get("UBU_LITE_TEST_PASSWORD", "Pass123!@#")


class MarketplaceAPITest(APITestCase):
    def setUp(self):
        # create users
        self.maya = User.objects.create_user(
            username="maya",
            password=TEST_PASSWORD,
            role="creative",
            email="maya@example.com",
        )
        CreativeProfile.objects.create(user=self.maya, city="Nairobi", region="Nairobi")
        self.chris = User.objects.create_user(
            username="chris",
            password=TEST_PASSWORD,
            role="client",
            email="chris@example.com",
        )

    def get_token(self, username, password):
        url = reverse("token_obtain_pair")
        resp = self.client.post(
            url, {"username": username, "password": password}, format="json"
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        return resp.data["access"]

    def test_auth_register_and_login(self):
        url = reverse("register")
        resp = self.client.post(
            url,
            {"username": "alice", "password": TEST_PASSWORD, "role": "client"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        token = self.get_token("alice", TEST_PASSWORD)
        self.assertTrue("." in token)

    def test_service_crud_permissions(self):
        maya_token = self.get_token("maya", TEST_PASSWORD)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {maya_token}")
        # create service
        resp = self.client.post(
            reverse("services-list"),
            {
                "title": "Logo",
                "description": "Nice",
                "category": "design",
                "price": "100.00",
            },
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        service_id = resp.data["id"]
        # client cannot modify
        chris_token = self.get_token("chris", TEST_PASSWORD)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {chris_token}")
        resp = self.client.patch(
            reverse("services-detail", args=[service_id]),
            {"price": "150.00"},
            format="json",
        )
        self.assertIn(
            resp.status_code,
            (status.HTTP_403_FORBIDDEN, status.HTTP_405_METHOD_NOT_ALLOWED),
        )

    def test_booking_and_status_and_messages(self):
        # create service as maya
        maya_token = self.get_token("maya", TEST_PASSWORD)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {maya_token}")
        resp = self.client.post(
            reverse("services-list"),
            {
                "title": "Logo",
                "description": "Nice",
                "category": "design",
                "price": "100.00",
            },
            format="json",
        )
        service_id = resp.data["id"]

        # chris books
        chris_token = self.get_token("chris", TEST_PASSWORD)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {chris_token}")
        resp = self.client.post(
            reverse("bookings-list"),
            {"service": service_id, "date": "2030-01-01T10:00:00Z"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        booking_id = resp.data["id"]

        # creative approves
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {maya_token}")
        resp = self.client.put(
            reverse("bookings-status", args=[booking_id]),
            {"status": "approved"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        # non-participant cannot approve
        User.objects.create_user(
            username="stranger", password=TEST_PASSWORD, role="client"
        )
        stranger_token = self.get_token("stranger", TEST_PASSWORD)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {stranger_token}")
        resp = self.client.put(
            reverse("bookings-status", args=[booking_id]),
            {"status": "declined"},
            format="json",
        )
        self.assertIn(
            resp.status_code, (status.HTTP_403_FORBIDDEN, status.HTTP_400_BAD_REQUEST)
        )

        # messaging: participant posts
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {chris_token}")
        resp = self.client.post(
            reverse("booking-messages", args=[booking_id]),
            {"content": "Hello"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

        # non-participant cannot post
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {stranger_token}")
        resp = self.client.post(
            reverse("booking-messages", args=[booking_id]),
            {"content": "Hi"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_creatives_search(self):
        resp = self.client.get(reverse("creatives-search") + "?location=Nairobi")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue(
            any(
                "maya" in (c.get("user") or {}).get("username", "") for c in resp.json()
            )
        )
