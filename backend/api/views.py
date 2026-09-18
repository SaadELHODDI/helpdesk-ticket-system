from django.db.models import Count
from django.db.models.functions import TruncDate
from django.utils import timezone

from rest_framework import viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Ticket
from .serializers import TicketSerializer

def is_it_staff(user):
    return (
        user.is_superuser
        or user.groups.filter(
            name__in=["IT Agent", "IT Manager"]
        ).exists()
    )

class TicketViewSet(viewsets.ModelViewSet):
    serializer_class = TicketSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser, FormParser, MultiPartParser]

    def get_queryset(self):
        queryset = Ticket.objects.select_related(
            "category",
            "created_by",
            "assigned_to",
            "resolved_by",
        ).all()

        # Normal employees can see only tickets they created.
        # IT Agent, IT Manager, and superusers can see every ticket.
        if not is_it_staff(self.request.user):
            queryset = queryset.filter(created_by=self.request.user)

        return queryset

    def perform_create(self, serializer):
        # The person authenticated by JWT becomes the ticket creator.
        # React cannot choose or fake another employee's account.
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        ticket = self.get_object()

        new_status = serializer.validated_data.get(
            "status",
            ticket.status
        )

        # Record the IT user and date only when an IT user closes a ticket.
        if (
            new_status == "closed"
            and ticket.status != "closed"
            and is_it_staff(self.request.user)
        ):
            serializer.save(
                resolved_by=self.request.user,
                resolved_at=timezone.now(),
            )
            return

        serializer.save()

    @action(detail=False, methods=["get"], url_path="my-tickets")
    def my_tickets(self, request):
        """
        GET /api/tickets/my-tickets/
        Explicit employee endpoint: only tickets created by current user.
        """
        tickets = Ticket.objects.filter(
            created_by=request.user
        ).select_related(
            "category",
            "created_by",
            "assigned_to",
            "resolved_by",
        )

        serializer = self.get_serializer(tickets, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="dashboard-stats")
    def dashboard_stats(self, request):
        """
        GET /api/tickets/dashboard-stats/

        IT staff receives full helpdesk data.
        Employees receive statistics for their own tickets only.

        Every response includes all chart arrays. This prevents React
        from failing when it calls .map() on a missing property.
        """
        tickets = self.get_queryset()

        status_distribution = list(
            tickets.values("status")
            .annotate(count=Count("id"))
            .order_by("status")
        )

        priority_distribution = list(
            tickets.values("priority")
            .annotate(count=Count("id"))
            .order_by("priority")
        )

        category_distribution = list(
            tickets.values("category__name")
            .annotate(count=Count("id"))
            .order_by("-count")
        )

        daily_tickets = list(
            tickets.annotate(day=TruncDate("created_at"))
            .values("day")
            .annotate(count=Count("id"))
            .order_by("day")
        )

        # Default must be an empty list, not a missing key.
        technician_distribution = []

        # Only IT users should view performance statistics for other agents.
        if is_it_staff(request.user):
            technician_distribution = list(
                Ticket.objects.filter(
                    status="closed",
                    resolved_by__isnull=False,
                )
                .values("resolved_by__username")
                .annotate(count=Count("id"))
                .order_by("-count")
            )

        return Response({
            "total_tickets": tickets.count(),
            "open_tickets": tickets.filter(status="open").count(),
            "in_progress_tickets": tickets.filter(
                status="in_progress"
            ).count(),
            "closed_tickets": tickets.filter(status="closed").count(),

            # These keys must always be present for Dashboard.jsx.
            "status_distribution": status_distribution,
            "priority_distribution": priority_distribution,
            "category_distribution": category_distribution,
            "technician_distribution": technician_distribution,
            "daily_tickets": daily_tickets,
        })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def current_user(request):
    """
    GET /api/auth/me/
    Used by React to identify the logged-in user and role.
    """
    user = request.user

    return Response({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "is_superuser": user.is_superuser,
        "groups": list(
            user.groups.values_list("name", flat=True)
        ),
        "is_it_staff": is_it_staff(user),
    })