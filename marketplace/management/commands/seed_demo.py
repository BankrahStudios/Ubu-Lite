from decimal import Decimal
from random import choice, randint

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

from marketplace.models import Category, CreativeProfile, Service


CATEGORIES = [
    ("art", "Art"),
    ("music", "Music"),
    ("design", "Design"),
    ("photo", "Photography"),
    ("video", "Video"),
]

CREATIVES = [
    ("alice_artist", "Painter and muralist"),
    ("ben_beats", "Music producer and DJ"),
    ("cara_creator", "Brand and logo designer"),
    ("dave_dp", "Portrait photographer"),
]

SERVICES = [
    ("Logo Design", "Clean, modern logo for your brand", "design"),
    ("Live DJ Set", "Club or event DJ set (2 hours)", "music"),
    ("Mural Session", "On‑site mural painting session", "art"),
    ("Portrait Shoot", "Outdoor portrait photography session", "photo"),
]


class Command(BaseCommand):
    help = "Seed demo categories, creatives, and services for local testing"

    def handle(self, *args, **options):
        User = get_user_model()

        # Ensure categories
        slug_to_obj = {}
        for slug, name in CATEGORIES:
            obj, _ = Category.objects.get_or_create(slug=slug, defaults={"name": name})
            if not obj.name:
                obj.name = name
                obj.save(update_fields=["name"])
            slug_to_obj[slug] = obj

        # Ensure creatives and profiles
        created_users = 0
        for username, bio in CREATIVES:
            user, new = User.objects.get_or_create(
                username=username, defaults={"role": User.Roles.CREATIVE}
            )
            if new:
                user.set_password("demo12345")
                user.save(update_fields=["password"])
                created_users += 1
            CreativeProfile.objects.get_or_create(
                user=user,
                defaults={
                    "bio": bio,
                    "skills": ";".join(["photoshop", "illustrator", "premiere"][0:randint(1, 3)]),
                    "city": choice(["Accra", "Kumasi", "Takoradi", "Tema"]),
                    "region": choice(["Greater Accra", "Ashanti", "Western", "Greater Accra"]),
                    "hourly_rate": Decimal(str(randint(20, 80))),
                },
            )

        # Create services for each creative
        created_services = 0
        for profile in CreativeProfile.objects.select_related("user").all():
            for title, desc, cat_slug in SERVICES:
                category = slug_to_obj.get(cat_slug)
                svc, new = Service.objects.get_or_create(
                    creative_profile=profile,
                    title=f"{title} by {profile.user.username}",
                    defaults={
                        "description": desc,
                        "category": category,
                        "price": Decimal(str(randint(30, 200))),
                    },
                )
                if new:
                    created_services += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Seed complete: categories={Category.objects.count()} creatives={CreativeProfile.objects.count()} services_total={Service.objects.count()} (+{created_services} new) users_created={created_users}"
            )
        )

