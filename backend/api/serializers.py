from rest_framework import serializers
from .models import Ticket


class TicketSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(
        source="created_by.username",
        read_only=True
    )

    assigned_to_username = serializers.CharField(
        source="assigned_to.username",
        read_only=True
    )

    resolved_by_username = serializers.CharField(
        source="resolved_by.username",
        read_only=True
    )

    category_name = serializers.CharField(
        source="category.name",
        read_only=True
    )

    class Meta:
        model = Ticket
        fields = [
            "id",
            "title",
            "description",
            "status",
            "priority",
            "category",
            "category_name",
            "image",
            "created_by",
            "created_by_username",
            "assigned_to",
            "assigned_to_username",
            "resolved_by",
            "resolved_by_username",
            "resolution_notes",
            "resolved_at",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "created_by",
            "resolved_by",
            "resolved_at",
        ]