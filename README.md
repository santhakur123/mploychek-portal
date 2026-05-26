# MPloyChek Background Verification Portal
* THis is the live host url **https://mploychek-portal.onrender.com**.*

Welcome to **MPloyChek**, a digital background verification portal built as a Single Page Application (SPA). This repository is constructed for the NSQTech Software Engineer Intern coding challenge.

It features an **Angular 17** frontend client and a **Node.js Express** backend API.

---

##  Quick Start Guide

### Prerequisites
- **Node.js**: `v20.x` or higher (tested on `v20.15.1`)
- **NPM**: `v10.x` or higher

---

### Step 1: Run the Backend API Server
1. Open a terminal and navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Express API server:
   ```bash
   npm start
   ```
   *The server will initialize a local JSON file-based database in `backend/data/` if it does not exist, and starts listening on **http://localhost:5000**.*

---

### Step 2: Run the Frontend Angular Application
1. Open a second terminal window and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Angular local dev server:
   ```bash
   npm start
   ```
   *The application will compile and serve on **http://localhost:4200**.*

---

## The demo credentials  Seeding Credentials

The local database is automatically pre-seeded with the following credentials. You can select either role on the login page:

| User ID | Password | Role | Description |
| :--- | :--- | :--- | :--- |
| **admin123** | `admin@123` | **Admin** | Full system access. Can view all verification checks and manage (CRUD) users. |
| **harsh_thakur** | `harsh@123` | **General User** | Restricted view. Can only view their own background checks (Harsh Thakur). |
| **user123** | `user@123` | **General User** | Restricted view. Can only view their own background checks (John Doe). |

---

## The  Key  Features of this project

### 1. Asynchronous Delay Simulation (`?delay=x` parameter)
To showcase the frontend loading experience:
- The backend features a custom **delay middleware** (`backend/middleware/delay.js`) that intercepts requests and pauses execution if a `delay` parameter is detected.
- The frontend features a global **HTTP interceptor** (`frontend/src/app/interceptors/loading.interceptor.ts`) that automatically appends `?delay=1200` to backend API requests (unless a component requests a custom delay).
- When APIs are in-flight, the frontend displays **loading skeleton screens** and a global **glassmorphic spinner overlay** to prevent double clicks and showcase responsive asynchronous states.

### 2. Role Based Access Controls
- **JWT Authentication**: Users receive a signed JWT token on login.
- **Route Guards**:
  - `AuthGuard`: Blocks anonymous users from accessing dashboard pages.
  - `AdminGuard`: Restricts the user management dashboard strictly to users with the `Admin` role.
- **API Level Security**: The backend filters checks based on the requesting user's identity and throws `403 Forbidden` if a general user attempts to access user administration routes.

### 3. Modular Code Design
- Fully modularized Angular services:
  - `AuthService`: Manages sessions, logins, and localStorage.
  - `UserService`: Manages Admin CRUD requests.
  - `RecordService`: Handles background check case queries.
  - `LoadingService`: Broadcasts loading states via RxJS subjects.
- Clean component encapsulation with dedicated HTML/CSS.
- High-fidelity Glassmorphic styling system using CSS custom variables.
