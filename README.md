# UBU Lite – Freelance Creative Marketplace

UBU Lite is a simplified platform where creatives (designers, painters, musicians, etc.) can create profiles and clients can book them for small gigs.  
Think of it as a scaled-down version of Fiverr or GigSalad, tailored for **quick, localized creative bookings** like mural sessions, live performances, or logo design.

**Author:** Ankrah Bright

---

## Features

This application will allow users to:

- Register as a **Creative** or **Client**
- Create and manage creative profiles (bio, skills, portfolio, pricing)
- Browse available creative services by category (art, music, design, etc.)
- Send and manage booking requests
- Message between clients and creatives (per booking)
- Admin oversight for managing creatives and site data

Optional future features:
- Search creatives by **location**
- Payment integration (Stripe/PayPal)

---

## How It Works

The backend is built with **Django & Django REST Framework (DRF)**.  
It exposes RESTful API endpoints for authentication, profiles, services, bookings, and messaging.  

The goal is to keep the design simple, focusing on **core functionality over aesthetics**, while leaving room for scalability.

---

## Skills Implemented

Building UBU Lite tested and showcased skills in:

- Django project & app structure
- Django REST Framework (serializers, viewsets, routers)
- Designing **models & relationships** (One-to-One, One-to-Many, Many-to-Many)
- RESTful API design
- Authentication & authorization
- Git & GitHub workflows
- Testing with Postman
- API integration (Unsplash API for portfolio images, optional Location API)

---

## Entity Relationship Diagram (ERD)

**Main Entities:**
- **User** → Creative or Client  
- **CreativeProfile** → one per creative  
- **Service** → listed under creative profiles  
- **Booking** → links a client with a service  
- **Message** → linked to bookings for chat  

**Relationships:**
- One User → One CreativeProfile (if creative role)  
- One CreativeProfile → Many Services  
- One Service → Many Bookings  
- One Booking → Many Messages  

---

## API Endpoints

### Authentication
- `POST /auth/register/` → Register as creative or client  
- `POST /auth/login/` → Login with credentials  

### Creatives & Services
- `GET /creatives/` → List all creatives  
- `GET /creatives/<id>/` → View creative profile  
- `GET /services/` → List all services  
- `GET /services/<id>/` → View single service  
- `POST /services/` → Create new service (creative only)  
- `PUT/PATCH /services/<id>/` → Update service (owner only)  
- `DELETE /services/<id>/` → Delete service (owner only)  

### Bookings
- `POST /bookings/` → Create booking request  
- `GET /bookings/<id>/` → View booking details  
- `PUT/PATCH /bookings/<id>/` → Update booking status  
- `DELETE /bookings/<id>/` → Cancel booking  

### Messaging
- `GET /messages/<booking_id>/` → View booking messages  
- `POST /messages/<booking_id>/` → Send message  

### Optional
- `GET /creatives/search/?location=city` → Filter creatives by city/region  

---

## Getting Started

### Prerequisites
- Python 3.10+
- Django & Django REST Framework
- Virtual environment recommended

### Installation
Clone the repository:
```bash
git clone https://github.com/BankrahStudios/Ubu-Lite.git
cd Ubu-Lite