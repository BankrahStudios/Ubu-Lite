from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsServiceOwnerOrReadOnly(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        # obj is Service
        owner = getattr(getattr(obj, "creative_profile", None), "user", None)
        return owner == request.user
