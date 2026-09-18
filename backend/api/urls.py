from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import TicketViewSet, current_user

router = DefaultRouter()
router.register(r"tickets", TicketViewSet, basename="ticket")

urlpatterns = [
    path("auth/me/", current_user, name="current-user"),
]

urlpatterns += router.urls