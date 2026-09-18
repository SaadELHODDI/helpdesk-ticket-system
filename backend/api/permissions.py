from rest_framework.permissions import BasePermission, SAFE_METHODS


def is_it_staff(user):
    return (
        user.is_superuser
        or user.groups.filter(
            name__in=["IT Agent", "IT Manager"]
        ).exists()
    )


def is_it_manager(user):
    return (
        user.is_superuser
        or user.groups.filter(name="IT Manager").exists()
    )


class TicketPermission(BasePermission):
    """
    Employee:
    - Can create a ticket.
    - Can list/retrieve only tickets they created.
    - Cannot close tickets.
    - Can edit/delete only their own open ticket.

    IT Agent:
    - Can list/retrieve all tickets.
    - Can update tickets and close tickets.
    - Cannot delete tickets.

    IT Manager / superuser:
    - Full access.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.method == "POST":
            return True

        return True

    def has_object_permission(self, request, view, obj):
        user = request.user

        if is_it_manager(user):
            return True

        if is_it_staff(user):
            if request.method == "DELETE":
                return False

            return True

        # Normal employee rules
        if obj.created_by_id != user.id:
            return False

        if request.method in SAFE_METHODS:
            return True

        if request.method == "DELETE":
            return obj.status == "open"

        if request.method in ["PUT", "PATCH"]:
            if obj.status != "open":
                return False

            # Employee cannot set the ticket to closed.
            requested_status = request.data.get("status")
            return requested_status in (None, "open")

        return False