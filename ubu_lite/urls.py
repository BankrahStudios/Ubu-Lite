"""
URL configuration for ubu_lite project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/dev/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def root_view(request):
    """Simple JSON root view to make the base URL return a small API fingerprint."""
    return JsonResponse({"ok": True, "api": "/api/", "admin": "/admin/"})

urlpatterns = [
    path("", root_view),
    path("admin/", admin.site.urls),
    path("api/", include("marketplace.urls")),  # ← market place urls
]

