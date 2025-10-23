 UBU Lite – Freelance Creative Marketplace

UBU Lite is a simplified platform where creatives (designers, painters, musicians, etc.) can create profiles and clients can book them for small gigs.  
Think of it as a scaled-down version of Fiverr or GigSalad, tailored for quick, localized creative bookings like mural sessions, live performances, or logo design.

Author: Ankrah Bright

---

 Features

This application will allow users to:

- Register as a Creative or Client
- Create and manage creative profiles (bio, skills, portfolio, pricing)
- Browse available creative services by category (art, music, design, etc.)
- Send and manage booking requests
- Message between clients and creatives (per booking)
- Admin oversight for managing creatives and site data

Optional future features:
- Search creatives by location
- Payment integration (Stripe/PayPal)

---

 How It Works

The backend is built with Django & Django REST Framework (DRF).  
It exposes RESTful API endpoints for authentication, profiles, services, bookings, and messaging.  

The goal is to keep the design simple, focusing on core functionality over aesthetics, while leaving room for scalability.

---

 Skills Implemented

Building UBU Lite tested and showcased skills in:

- Django project & app structure
- Django REST Framework (serializers, viewsets, routers)
- Designing models & relationships (One-to-One, One-to-Many, Many-to-Many)
- RESTful API design
- Authentication & authorization
- Git & GitHub workflows
- Testing with Postman
- API integration (Unsplash API for portfolio images, optional Location API)

---

 Entity Relationship Diagram (ERD)

Main Entities:
- User → Creative or Client  
- CreativeProfile → one per creative  
- Service → listed under creative profiles  
- Booking → links a client with a service  
- Message → linked to bookings for chat  

Relationships:
- One User → One CreativeProfile (if creative role)  
- One CreativeProfile → Many Services  
- One Service → Many Bookings  
- One Booking → Many Messages  

---

 API Endpoints

 Authentication
- `POST /auth/register/` → Register as creative or client  
- `POST /auth/login/` → Login with credentials  

 Creatives & Services
- `GET /creatives/` → List all creatives  
- `GET /creatives/<id>/` → View creative profile  
- `GET /services/` → List all services  
- `GET /services/<id>/` → View single service  
- `POST /services/` → Create new service (creative only)  
- `PUT/PATCH /services/<id>/` → Update service (owner only)  
- `DELETE /services/<id>/` → Delete service (owner only)  

 Bookings
- `POST /bookings/` → Create booking request  
- `GET /bookings/<id>/` → View booking details  
- `PUT/PATCH /bookings/<id>/` → Update booking status  
- `DELETE /bookings/<id>/` → Cancel booking  

 Messaging
- `GET /messages/<booking_id>/` → View booking messages  
- `POST /messages/<booking_id>/` → Send message  

 Optional
- `GET /creatives/search/?location=city` → Filter creatives by city/region  

---

 Getting Started

 Prerequisites
- Python 3.10+
- Django & Django REST Framework
- Virtual environment recommended

 Installation
Clone the repository:
```bash
git clone https://github.com/BankrahStudios/Ubu-Lite.git
cd Ubu-Lite
set up a virtual environment.
Run migrations, and
Start the development server

---

Serving the React homepage from Django
-------------------------------------

This project includes a React TypeScript homepage scaffold under `templates/ubu-lite-homepage`.
To build and serve the React app from Django (so you don't need a separate dev server):

1. Build the React app (this creates `build/` inside `templates/ubu-lite-homepage`):

```bash
cd templates/ubu-lite-homepage
npm install
npm run build
```

2. (Optional) Collect static files into `staticfiles/` so Django can serve them via `STATIC_ROOT`:

```bash
python manage.py collectstatic --noinput
```

3. Open the built app served by Django at:

```
http://localhost:8000/react-app/
```

If the build directory is missing, Django will fall back to a simple informational page at `/react/`.

---

Quick demo data and flows
-------------------------

This project includes management commands to quickly simulate end‑to‑end flows without external services:

- Seed + simulate escrow lifecycle:

  ```bash
  python manage.py simulate_escrow
  ```

  Creates demo users `demo_client` and `demo_creative` (password `demo12345`), a service, an order, simulates a payment, and releases escrow after dual fulfillment. Prints wallet balances and JWT tokens for quick API testing.

- API walkthrough using real API endpoints (JWT auth, create order, fund escrow, fulfill):

  ```bash
  python manage.py api_walkthrough
  ```

  Uses DRF’s test client with JWT to hit `/api/...` routes and prints the results. You can copy the printed `Authorization: Bearer <token>` to test endpoints via curl or Postman.

- Seed multiple creatives and services for richer UI testing:

  ```bash
  python manage.py seed_demo
  ```

  Creates several creative users (password `demo12345`), profiles and services across categories like Art, Music, Design, Photography, and Video.

Admin and server
----------------

- Create a superuser and launch the server:

  ```bash
  python manage.py createsuperuser
  python manage.py runserver
  ```

- Useful URLs:
  - `/` React SPA (served from `templates/ubu-lite-homepage/build`)
  - `/api/` core API (JWT protected; many endpoints allow anonymous reads)
  - `/admin/` Django admin
  - `/login/` and `/register/` templates (receive `GOOGLE_CLIENT_ID` if set in `.env`)
