# API Design & Usage Guide

## Overview
The PHC Platform Commons API is a microservices-based system designed for multi-tenant hospital management. It uses a **Gateway Pattern**, meaning all requests should be routed through the API Gateway (default port: `3000`).

    "password": "securepassword",
    "name": "Dr. Admin",
    "role": "HOSPITAL_ADMIN",
    "tenantId": "uuid-of-tenant" // Optional if not yet linked
  }
  ```

### Login
Returns a JWT token.
- **POST** `/login`
- **Body**:
  ```json
  {
    "email": "admin@hospital.com",
    "password": "securepassword"
  }
  ```
- **Response**:
  ```json
  {
    "token": "eyJhbGci...",
    "user": { ... }
  }
  ```

---

## 2. Tenant Service
**Base Path**: `/tenants`

### Register New Hospital (Tenant)
Onboards a new hospital and **automatically creates a dedicated database schema**.
- **POST** `/`
- **Body**:
  ```json
  {
    "name": "Rural PHC Center 1",
    "slug": "phc_center_1", // Must be unique, used for schema name
    "address": "Village X, District Y",
    "adminEmail": "admin@phc1.com",
    "adminPassword": "password123",
    "adminName": "Dr. Superintendent"
  }
  ```

### List Tenants (Super Admin)
- **GET** `/`
- **Headers**: `Authorization: Bearer <token>`

---

## 3. Patient Service
**Base Path**: `/patients`
**Headers Required**: `Authorization`, `x-tenant-slug`

### Register Patient
- **POST** `/`
- **Body**:
  ```json
  {
    "firstName": "Ramesh",
    "lastName": "Kumar",
    "dateOfBirth": "1985-06-15",
    "gender": "MALE",
    "phone": "9876543210",
    "address": "House 12, Village X"
  }
  ```

### Record Vitals
- **POST** `/:patientId/vitals`
- **Body**:
  ```json
  {
    "temperature": 98.6,
    "bloodPressure": "120/80",
    "pulse": 72,
    "weight": 65,
    "height": 170
  }
  ```

### List Patients
- **GET** `/`

---

## 4. Consultation Service
**Base Path**: `/consultations`
**Headers Required**: `Authorization`, `x-tenant-slug`

### Book Appointment / Create Consultation
- **POST** `/`
- **Body**:
  ```json
  {
    "patientId": "uuid-of-patient",
    "doctorId": "uuid-of-doctor" // Optional, defaults to logged-in user
  }
  ```

### Update Diagnosis & Prescription
- **PUT** `/:id/diagnosis`
- **Body**:
  ```json
  {
    "diagnosis": "Viral Fever",
    "prescription": "Paracetamol 500mg BD for 3 days",
    "status": "COMPLETED"
  }
  ```

### List Consultations
- **GET** `/`
- **Query Params**: `?patientId=...` or `?doctorId=...`
