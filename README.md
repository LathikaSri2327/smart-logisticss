# 🚚 Smart Logistics & Shipment Tracking System

A production-ready, enterprise-grade full-stack logistics management platform built with **Next.js**, **TypeScript**, **GraphQL (Apollo)**, **Node.js**, **Express**, **MongoDB**, and **Tailwind CSS**.

---

## ✨ Features

### 🔐 Authentication
- JWT-based login/signup with role-based access control
- Roles: **Admin**, **Client**, **Driver**
- Protected routes, bcrypt password hashing, session persistence

### 👨‍💼 Admin Portal
- Analytics dashboard with charts (revenue, shipments, status breakdown)
- Full shipment CRUD — create, assign drivers, update status, delete
- Driver & vehicle fleet management
- Warehouse inventory management with low stock alerts
- Client management
- Reports with CSV export
- Settings & profile management

### 📦 Client Portal
- Shipment tracking with visual timeline
- Order history and invoices
- Real-time notifications
- QR code display per shipment

### 🚛 Driver Portal
- Assigned deliveries list
- Route details with live location sharing
- Delivery status updates
- Proof of delivery upload

### 📡 Real-Time Features
- GraphQL Subscriptions for live shipment status
- Driver location broadcasting via pubsub
- Notification push via subscriptions

---

## 🗂 Project Structure

```
smart-logistics/
├── client/                    # Next.js 14 App Router frontend
│   ├── app/
│   │   ├── (auth)/            # Login, Signup, Forgot Password
│   │   ├── (dashboard)/
│   │   │   ├── admin/         # Admin portal pages
│   │   │   ├── client/        # Client portal pages
│   │   │   └── driver/        # Driver portal pages
│   │   ├── pricing/
│   │   └── page.tsx           # Public landing page
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   ├── layout/            # Sidebar, Navbar, DashboardLayout
│   │   └── charts/            # Recharts chart components
│   ├── graphql/
│   │   ├── queries/
│   │   ├── mutations/
│   │   └── subscriptions/
│   ├── hooks/                 # useAuth, useTheme
│   ├── services/              # Apollo Client setup
│   ├── types/                 # TypeScript definitions
│   └── utils/                 # Helper functions
│
└── server/                    # Node.js + Express + Apollo Server backend
    ├── config/                # MongoDB connection
    ├── graphql/
    │   ├── typeDefs/          # GraphQL schema
    │   ├── resolvers/         # Query, Mutation, Subscription resolvers
    │   └── subscriptions/     # PubSub instance
    ├── middleware/            # JWT auth middleware
    ├── models/                # Mongoose models
    └── utils/                 # Seed script
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### 1. Clone / Setup

```bash
cd C:\smart-logistics
```

### 2. Configure Environment Variables

**Server** — edit `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/smart-logistics
JWT_SECRET=your_32_char_secret_key_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

**Client** — edit `client/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/graphql
NEXT_PUBLIC_WS_URL=ws://localhost:5000/graphql
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_google_maps_api_key
```

### 3. Install Dependencies

```bash
# Server
cd server && npm install

# Client
cd ../client && npm install
```

### 4. Seed the Database

```bash
cd server && npm run seed
```

This creates:
| Role   | Email                     | Password    |
|--------|---------------------------|-------------|
| Admin  | admin@logistics.com       | password123 |
| Client | alice@techcorp.com        | password123 |
| Client | bob@globalexport.com      | password123 |
| Driver | david@logistics.com       | password123 |
| Driver | emma@logistics.com        | password123 |

### 5. Run the Application

**Terminal 1 — Start backend:**
```bash
cd server && npm run dev
```
Server runs at: `http://localhost:5000/graphql`

**Terminal 2 — Start frontend:**
```bash
cd client && npm run dev
```
Client runs at: `http://localhost:3000`

---

## 🌐 Pages Overview

| Path | Description |
|------|-------------|
| `/` | Public landing page |
| `/login` | Sign in |
| `/signup` | Create account |
| `/pricing` | Pricing plans |
| `/admin` | Admin dashboard |
| `/admin/shipments` | Shipment management |
| `/admin/drivers` | Driver management |
| `/admin/vehicles` | Vehicle fleet |
| `/admin/warehouse` | Warehouse inventory |
| `/admin/clients` | Client management |
| `/admin/analytics` | Analytics & charts |
| `/admin/reports` | Reports & CSV export |
| `/admin/settings` | Account settings |
| `/client` | Client dashboard |
| `/client/orders` | Order history |
| `/client/track` | Shipment tracking |
| `/client/invoices` | Invoice downloads |
| `/client/notifications` | Notification center |
| `/driver` | Driver dashboard |
| `/driver/deliveries` | Assigned deliveries |
| `/driver/route` | Route tracking |
| `/driver/update` | Update delivery status |

---

## 🔌 GraphQL API

The GraphQL playground is available at: `http://localhost:5000/graphql`

### Example Login Query
```graphql
mutation {
  login(input: { email: "admin@logistics.com", password: "password123" }) {
    token
    user { id name role email }
  }
}
```

### Example Get Shipments
```graphql
query {
  shipments(filter: { page: 1, limit: 10 }) {
    totalCount
    shipments {
      id shipmentId shipmentStatus
      client { name company }
      source { city country }
      destination { city country }
    }
  }
}
```

---

## 🚀 Deployment

### Frontend (Vercel)
1. Push `client/` to GitHub
2. Import to [vercel.com](https://vercel.com)
3. Set environment variables in Vercel dashboard

### Backend (Railway / Render)
1. Push `server/` to GitHub
2. Connect to [railway.app](https://railway.app) or [render.com](https://render.com)
3. Set environment variables
4. Deploy

### Database (MongoDB Atlas)
1. Create cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create database user
3. Whitelist IPs (0.0.0.0/0 for dev)
4. Copy connection string to `MONGODB_URI`

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, TypeScript |
| Styling | Tailwind CSS, Framer Motion |
| Icons | Lucide React |
| Charts | Recharts |
| GraphQL Client | Apollo Client 3 |
| Backend | Node.js, Express.js |
| GraphQL Server | Apollo Server Express |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| Real-time | GraphQL Subscriptions, graphql-ws |
| QR Codes | qrcode |

---

## 📄 License

MIT License — free for personal and commercial use.
