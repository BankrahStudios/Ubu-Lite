# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

UBU Lite is a Django REST Framework-based freelance creative marketplace where creatives (designers, painters, musicians, etc.) can create profiles and clients can book them for gigs. It's a scaled-down version of platforms like Fiverr, focusing on quick, localized creative bookings.

## Development Commands

### Environment Setup
```powershell
# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Database setup (SQLite)
python manage.py makemigrations marketplace
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

### Running the Application
```powershell
# Start development server
python manage.py runserver

# Run on specific port
python manage.py runserver 8080
```

### Development Utilities
```powershell
# Reset development database completely
.\scripts\dev_reset.sh  # On Unix-like systems
# Or manually:
# Remove db.sqlite3, clear marketplace/migrations (keep __init__.py), then makemigrations + migrate

# API demonstration script
.\scripts\api_demo.ps1  # Comprehensive API flow demo with logging

# Debug booking script
python scripts\debug_booking.py
```

### Testing
```powershell
# Run all tests
python manage.py test

# Run specific app tests
python manage.py test marketplace

# Run with verbosity
python manage.py test marketplace -v 2
```

### Database Operations
```powershell
# Make new migrations after model changes
python manage.py makemigrations marketplace

# Apply migrations
python manage.py migrate

# Access Django shell
python manage.py shell

# Database shell (SQLite)
python manage.py dbshell
```

## Architecture Overview

### Core Models & Relationships
- **User** (extends AbstractUser): Has role field ("creative" or "client")
- **CreativeProfile**: One-to-one with User (for creatives only), contains bio, skills, portfolio, location
- **Service**: Belongs to CreativeProfile, represents offered services with pricing
- **Booking**: Links Client (User) with Service, has status workflow (pending → approved/declined)
- **Message**: Scoped to Booking, enables communication between booking participants

### Key Design Patterns

**Authentication**: JWT-based using `djangorestframework-simplejwt`
- Login endpoint: `/api/auth/login/` returns JWT tokens
- Register endpoint: `/api/auth/register/` creates users with roles

**Permission System**:
- Custom permission `IsServiceOwnerOrReadOnly` for service modifications
- Booking status updates restricted to service owner (creative)
- Message creation/reading restricted to booking participants

**API Structure**: RESTful endpoints using DRF ViewSets
- Creatives: `/api/creatives/` (read-only with location search)
- Services: `/api/services/` (CRUD with owner restrictions)
- Bookings: `/api/bookings/` (with status update actions)
- Messages: `/api/messages/` and `/api/bookings/{id}/messages/`

### URL Routing
- Root URL returns API fingerprint JSON
- All API endpoints under `/api/` prefix
- Django admin available at `/admin/`
- ViewSet routing handled by DRF DefaultRouter

### Testing Strategy
- Comprehensive test suite in `marketplace/tests.py`
- Tests cover authentication, permissions, CRUD operations, and business logic
- Uses DRF's APITestCase with JWT token authentication
- Tests booking workflow and messaging permissions

## Key Files & Components

### Core Application Files
- `marketplace/models.py`: All data models and relationships
- `marketplace/views.py`: API viewsets with business logic
- `marketplace/serializers.py`: DRF serializers for API responses
- `marketplace/permissions.py`: Custom permission classes
- `marketplace/urls.py`: API URL routing
- `ubu_lite/settings.py`: Django configuration with DRF and JWT setup

### Development Scripts
- `scripts/api_demo.ps1`: PowerShell script demonstrating complete API workflow
- `scripts/dev_reset.sh`: Database reset utility for development
- `scripts/debug_booking.py`: Booking-specific debugging tools

### Configuration
- `requirements.txt`: Python dependencies (Django, DRF, JWT)
- `.env.example`: Environment variable template
- `db.sqlite3`: SQLite database (development only)

## Development Notes

### Custom User Model
The project uses a custom User model (`marketplace.User`) that extends AbstractUser with a role field. Always reference this model, not Django's default User model.

### JWT Authentication Flow
All authenticated endpoints require Bearer token in Authorization header. Use the login endpoint to obtain tokens, which are valid for the configured JWT lifetime.

### Booking Workflow
Bookings start as "pending" status. Only the creative (service owner) can approve/decline bookings through the status update endpoints. Both participants can message within the booking context.

### Location Search
Creative profiles support location-based search through the `/api/creatives/search/?location=city` endpoint, which searches both city and region fields.

### Service Ownership
Services can only be created, updated, or deleted by their owner (the creative who created them). This is enforced through the `IsServiceOwnerOrReadOnly` permission class.