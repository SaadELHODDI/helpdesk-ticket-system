# helpdesk-ticket-system

A full-stack IT helpdesk / support ticket system built with **Django REST Framework** (backend), **React + Vite** (frontend), and **Neon PostgreSQL** (database). Employees submit support tickets with optional screenshots, IT agents and managers track, assign, and resolve them, and a role-aware dashboard visualizes workload and technician performance with Chart.js.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [User Roles and Permissions](#user-roles-and-permissions)
- [Creating Users](#creating-users)
- [API Endpoints](#api-endpoints)
- [Ticket Image Uploads](#ticket-image-uploads)
- [Dashboard and Charts](#dashboard-and-charts)
- [Running the App](#running-the-app)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)

## Features

- JWT authentication (access + refresh tokens) via `djangorestframework-simplejwt`
- Role-based access: **Employee**, **IT Agent**, **IT Manager**, and Django superuser
- Employees can create tickets and view only their own tickets
- IT staff can view, assign, update, and close all tickets
- Ticket priority levels (Low, Medium, High, Urgent) and categories
- Optional screenshot/photo upload per ticket (`ImageField` + Pillow)
- Automatic tracking of who resolved a ticket and when (`resolved_by`, `resolved_at`)
- Resolution notes recorded when a ticket is closed
- Role-aware dashboard with live statistics and Chart.js visualizations:
  - Ticket status distribution (doughnut chart)
  - Priority distribution (bar chart)
  - Tickets closed per IT agent (bar chart)
  - Tickets by category (bar chart)
  - Ticket volume over time (line chart)
- Fully responsive UI (mobile, tablet, desktop) built with plain CSS and CSS Grid/Flexbox
- Protected React routes based on authentication state and role

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Django, Django REST Framework |
| Auth | djangorestframework-simplejwt (JWT) |
| Database | PostgreSQL via [Neon](https://neon.tech) |
| Frontend | React (Vite) |
| Routing | React Router v6 |
| HTTP client | Axios |
| Charts | Chart.js + react-chartjs-2 |
| Image handling | Pillow (Django `ImageField`) |

## Project Structure

```text
helpdesk app/
├── backend/
│   ├── backend/
│   │   ├── settings.py
│   │   └── urls.py
│   ├── api/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── migrations/
│   ├── media/                # uploaded ticket images (dev only)
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   └── Navbar.css
│   │   │   └── tickets/
│   │   │       ├── TicketCard.jsx
│   │   │       ├── TicketList.jsx
│   │   │       └── TicketForm.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Tickets.jsx
│   │   │   ├── TicketDetail.jsx
│   │   │   ├── EmployeePortal.jsx
│   │   │   └── Login.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── vite.config.js
└── venv/                     # Python virtual environment (not committed)
```

## Prerequisites

- Python 3.11+ (project tested on 3.13)
- Node.js 18+ and npm
- A [Neon](https://neon.tech) PostgreSQL database (or any PostgreSQL instance)
- Git

## Backend Setup

```bash
# From the project root
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

cd backend
pip install django djangorestframework django-cors-headers \
            djangorestframework-simplejwt psycopg2-binary \
            python-dotenv dj-database-url Pillow

python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

The API will be available at `http://127.0.0.1:8000/`.

## Frontend Setup

```bash
cd frontend
npm install
npm install axios react-router-dom chart.js react-chartjs-2
npm run dev
```

The app will be available at `http://localhost:5173/`.

Vite's dev server proxies `/api` requests to Django. Confirm `vite.config.js` contains:

```js
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
})
```

## Environment Variables

Create a `.env` file inside `backend/` (never commit this file):

```env
DATABASE_URL=postgresql://username:password@ep-xxxx-xxxx.region.aws.neon.tech/dbname?sslmode=require&channel_binding=require
```

In `backend/backend/settings.py`, the database is configured from this variable:

```python
import os
import dj_database_url
from dotenv import load_dotenv

load_dotenv()

DATABASES = {
    'default': dj_database_url.config(
        default=os.getenv('DATABASE_URL'),
        conn_max_age=600,
        conn_health_checks=True,
    )
}
```

`conn_health_checks=True` avoids stale-connection errors when Neon's serverless compute scales to zero after inactivity.

Add `.env`, `venv/`, `__pycache__/`, `node_modules/`, and `media/` to `.gitignore`.

## User Roles and Permissions

| Role | Assigned via | Can view | Can create | Can close | Can delete | Dashboard access |
|---|---|---|---|---|---|---|
| Employee | Django group `Employee` | Own tickets only | Yes | No | Own open tickets only | No |
| IT Agent | Django group `IT Agent` | All tickets | Yes | Yes | No | Yes |
| IT Manager | Django group `IT Manager` | All tickets | Yes | Yes | Yes | Yes |
| Superuser | `is_superuser=True` | All tickets | Yes | Yes | Yes | Yes |

Role resolution happens in `backend/api/views.py`:

```python
def is_it_staff(user):
    return (
        user.is_superuser
        or user.groups.filter(name__in=["IT Agent", "IT Manager"]).exists()
    )
```

The frontend calls `GET /api/auth/me/` after login to determine which navigation and routes to render. Employees are restricted to `/employee`; IT staff are redirected to `/dashboard`.

## Creating Users

Create groups once (Django shell: `python manage.py shell`):

```python
from django.contrib.auth.models import Group

Group.objects.get_or_create(name="Employee")
Group.objects.get_or_create(name="IT Agent")
Group.objects.get_or_create(name="IT Manager")
```

Create a new employee:

```python
from django.contrib.auth.models import Group, User

employee_group, _ = Group.objects.get_or_create(name="Employee")

employee = User.objects.create_user(
    username="employee1",
    email="employee1@example.com",
    password="EmployeePassword123",
)
employee.groups.add(employee_group)
```

Create an IT agent or manager the same way, adding them to `"IT Agent"` or `"IT Manager"` instead.

Never insert directly into `auth_user` with raw SQL — Django hashes passwords and sets required boolean fields (`is_superuser`, `is_staff`, etc.) that a manual `INSERT` will miss.

## API Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/token/` | Obtain JWT access + refresh tokens | Public |
| POST | `/api/token/refresh/` | Refresh an access token | Public |
| GET | `/api/auth/me/` | Current user profile and role | Authenticated |
| GET | `/api/tickets/` | List tickets (filtered by role) | Authenticated |
| POST | `/api/tickets/` | Create a ticket (multipart for images) | Authenticated |
| GET | `/api/tickets/{id}/` | Retrieve one ticket | Owner or IT staff |
| PATCH | `/api/tickets/{id}/` | Update status/fields | Owner (limited) or IT staff |
| DELETE | `/api/tickets/{id}/` | Delete a ticket | Owner (open only) or IT Manager |
| GET | `/api/tickets/my-tickets/` | Tickets created by the current user | Authenticated |
| GET | `/api/tickets/dashboard-stats/` | Aggregated statistics for charts | IT staff only |

## Ticket Image Uploads

Tickets support an optional screenshot/photo via Django's `ImageField`, which requires Pillow:

```bash
python -m pip install Pillow
```

`MEDIA_URL` / `MEDIA_ROOT` must be configured in `settings.py`, and `urls.py` must serve media in development:

```python
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

React sends the file using `FormData` (not JSON), and Axios must not manually set the `Content-Type` header — the browser sets the correct multipart boundary automatically.

For production, store uploads in object storage (e.g., Cloudinary, Supabase Storage, S3) rather than the local filesystem, and keep only the file path/URL in Neon.

## Dashboard and Charts

The `/api/tickets/dashboard-stats/` endpoint returns aggregated ticket data used by `Dashboard.jsx`:

```json
{
  "total_tickets": 25,
  "open_tickets": 7,
  "in_progress_tickets": 10,
  "closed_tickets": 8,
  "status_distribution": [{ "status": "open", "count": 7 }],
  "priority_distribution": [{ "priority": "high", "count": 5 }],
  "category_distribution": [{ "category__name": "Hardware", "count": 3 }],
  "technician_distribution": [{ "resolved_by__username": "smodz", "count": 5 }],
  "daily_tickets": [{ "day": "2026-09-16", "count": 4 }]
}
```

The response always includes every key as an array (never omitted), which prevents `Cannot read properties of undefined (reading 'map')` errors in React when a category has no data yet.

## Running the App

Two terminals are required during development:

```bash
# Terminal 1 — Django API
cd backend
venv\Scripts\activate   # or source venv/bin/activate
python manage.py runserver

# Terminal 2 — React frontend
cd frontend
npm run dev
```

Open `http://localhost:5173` and log in. Employees land on `/employee`; IT Agents and IT Managers land on `/dashboard`.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `ModuleNotFoundError: No module named 'django'` | Virtual environment not activated | Run `venv\Scripts\activate` before any `python manage.py` command |
| `fields.E210: Cannot use ImageField because Pillow is not installed` | Pillow missing from the active venv | `python -m pip install Pillow` |
| `relation "api_category" already exists` | Table created manually via SQL, migration history out of sync | Drop the manually created tables in Neon, then run `python manage.py migrate` |
| `CommandError: You appear not to have the 'psql' program installed` | `dbshell` needs a local PostgreSQL client | Skip `dbshell`; use `python manage.py migrate` and Neon's SQL editor instead |
| 502 Bad Gateway on `/api/...` from Vite | Django server crashed or isn't running | Check the backend terminal for a traceback and restart `python manage.py runserver` |
| Login always fails with "Invalid username or password" | `/api/token/` route missing, or JWT app not installed | Confirm `djangorestframework-simplejwt` is installed and routed in `urls.py` |
| Employee sees Dashboard / All Tickets | User is missing from the correct Django group, or stale JWT in the browser | Verify group membership in the Django shell, log out, and log back in |
| `Failed to resolve import` in Vite | Referenced file/folder doesn't exist at that exact path | Create the missing file with the exact name and restart `npm run dev` |
| `Cannot read properties of undefined (reading 'map')` on Dashboard | Backend response missing a chart array | Ensure `dashboard-stats` always returns every array key, even empty |

## Roadmap

- Comments and full activity timeline per ticket
- Ticket assignment workflow (IT Manager assigns to a specific agent)
- Search, filtering, and sorting on the Tickets page
- SLA / due-date tracking with overdue indicators
- Multiple file attachments per ticket
- In-app and email notifications
- CSV/PDF export of filtered tickets and reports
- Dark mode theme toggle
