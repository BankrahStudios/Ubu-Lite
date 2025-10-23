from django.db import migrations

CATS = [
    ("graphic-design", "Graphic Design"),
    ("web-development", "Web Development"),
    ("photography", "Photography"),
    ("video-editing", "Video Editing"),
    ("brand-strategy", "Brand Strategy"),
    ("illustration", "Illustration"),
]


def seed_categories(apps, schema_editor):
    Category = apps.get_model("marketplace", "Category")
    Service = apps.get_model("marketplace", "Service")

    # Create categories if missing
    cat_map = {}
    for slug, name in CATS:
        obj, _ = Category.objects.get_or_create(slug=slug, defaults={"name": name})
        cat_map[slug] = obj

    # Best-effort assignment by title keywords
    kw_map = {
        "graphic": "graphic-design",
        "design": "graphic-design",
        "web": "web-development",
        "frontend": "web-development",
        "backend": "web-development",
        "photo": "photography",
        "shoot": "photography",
        "video": "video-editing",
        "edit": "video-editing",
        "brand": "brand-strategy",
        "strategy": "brand-strategy",
        "illustration": "illustration",
        "illustrat": "illustration",
    }

    for s in Service.objects.filter(category__isnull=True):
        t = (s.title or "").lower()
        chosen = None
        for kw, slug in kw_map.items():
            if kw in t:
                chosen = slug
                break
        if chosen:
            s.category = cat_map.get(chosen)
            try:
                s.save(update_fields=["category"])  # ignore failures silently
            except Exception:
                pass


def noop_reverse(apps, schema_editor):
    # Keep any assigned categories; do not delete seed data.
    pass


class Migration(migrations.Migration):
    dependencies = [
        ("marketplace", "0004_alter_service_category"),
    ]

    operations = [
        migrations.RunPython(seed_categories, noop_reverse),
    ]

