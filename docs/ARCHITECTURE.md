# 🏛️ System Architecture

### ⚡ UrjaSync – Smart Home Energy Management Platform

This document describes the overall system architecture, technology stack, folder structure, data flow, and key design decisions for the **UrjaSync** application.

---

## 1. High-Level Architecture

UrjaSync follows a classic **client–server architecture** using React (Vite SPA) and Node.js/Express with MongoDB.

```
┌──────────────┐   HTTPS / JSON   ┌──────────────────┐   REST API + Socket.io   ┌──────────────────┐
│    User      │ ◄──────────────► │  React Frontend  │ ◄──────────────────────► │  Express Backend │
│ (Web Browser)│                  │  (Vite / Client) │                          │ (Server Actions /│
└──────────────┘                  └──────────────────┘                          │  API Routes)     │
                                                                                       └────────┬─────────┘
                                                                                                │
                                                                                                ▼
                                                                                       ┌──────────────────┐
                                                                                       │     MongoDB      │
                                                                                       │ (Mongoose + JWT  │
                                                                                       │      Auth)       │
                                                                                       └──────────────────┘
```

- **Frontend** never talks to the database directly — it only calls the REST API or Socket.io.
- **Backend** owns all business logic, validation (Zod), and data access (Mongoose).
- **Real-time layer** runs on the same Express server via Socket.io (JWT-authenticated).

## 2. Technology Stack

Technologies used in the project and their purpose.

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 18 + Vite 7 | UI framework & dev server |
| Language | TypeScript 5.8 | Type-safe and better developer experience |
| Styling | Tailwind CSS 3.4 + shadcn/ui | Modern and responsive UI, Radix primitives |
| Routing | React Router 6 | SPA navigation & protected routes |
| Server state | TanStack Query 5 | API caching, mutations & refetching |
| Charts | Recharts | Energy usage & cost visualizations |
| Real-time | Socket.io Client | Live energy & device updates |
| Backend | Node.js + Express | REST API & business logic |
| Database | MongoDB + Mongoose | Data models & persistence |
| Authentication | JWT (access + refresh) + bcrypt | Auth, authorization & password hashing |
| Validation | Zod | Request input validation |
| Security | Helmet, express-rate-limit, CORS | Headers, rate limiting & origins |
| Testing | Vitest + Testing Library | Unit & component tests |
| Deployment | Netlify (frontend) · Render (backend) · MongoDB Atlas | Hosting & deployment |
| Version Control | Git + GitHub | Source code management |

## 3. Folder Structure

The project follows a **separated client/server structure** to keep the code organized and scalable.

```text
UrjaSync/
├── docs/                    # Project documentation (PRD, ARCHITECTURE, RULES, DESIGN, TASKS, MEMORY)
├── src/                     # Frontend (React + Vite)
│   ├── components/          # Reusable UI components
│   │   ├── ui/              # shadcn/ui primitives (buttons, cards, dialogs…)
│   │   ├── dashboard/       # Dashboard layout, sidebar, widgets
│   │   └── landing/         # Landing page sections
│   ├── pages/               # Route pages
│   │   ├── Index.tsx        # Landing page
│   │   ├── Auth.tsx         # Login / Signup
│   │   ├── Dashboard.tsx    # Real-time overview
│   │   ├── Devices.tsx      # Device management
│   │   ├── Analytics.tsx    # Usage & cost charts
│   │   ├── Billing.tsx      # Bills, budget & savings
│   │   ├── Sustainability.tsx
│   │   └── SettingsPage.tsx
│   ├── contexts/            # AuthContext (global auth state)
│   ├── services/            # API service layer (auth, device, energy, billing…)
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities (axios client, helpers)
│   └── App.tsx              # Router + providers
├── server/                  # Backend (Node.js + Express)
│   └── src/
│       ├── config/          # DB connection & app config
│       ├── controllers/     # Route handlers
│       ├── middleware/      # Auth, error handling, rate limits
│       ├── models/          # Mongoose schemas (User, Device, EnergyReading…)
│       ├── routes/          # API route definitions
│       ├── socket/          # Socket.io handlers (JWT auth, events)
│       ├── validators/      # Zod request schemas
│       └── utils/           # Helpers & seeders
│   ├── server.js            # Entry point
│   └── seed.js              # Demo data seeder
├── postman/                 # API collection for testing
└── netlify.toml             # Frontend deploy config
```

## 4. Data Models (MongoDB Collections)

| Model | Purpose | Key Fields |
|---|---|---|
| `User` | Accounts & preferences | email, password (hashed), fullName, settings (monthlyBudget, alertThreshold, notifications) |
| `Device` | Smart appliances | name, room, type (AC, Light, Fan…), powerRating, status, intensity, isSmart |
| `EnergyReading` | Usage datapoints | userId, deviceId, timestamp, usage, cost, rate, solarGeneration — **TTL: auto-deleted after 2 years** |
| `Bill` | Monthly bills | month, year, amount, unitsConsumed, solarCredits, status (paid/pending/overdue), dueDate, savings |
| `Sustainability` | Green goals | goals[] (co2_reduction, solar_usage, zero_waste), carbonStats |
| `TariffSchedule` | Tariff slabs | slabs[] (Off-Peak / Mid-Peak / Peak, timeRange, rate, days), isActive |

## 5. Real-time Flow (Socket.io)

```
Client ──energy:subscribe──► Server ──► broadcasts to user room
Client ◄──energy:update───── { usage, cost, timestamp }
Client ◄──device:status───── { deviceId, status, intensity }
Client ◄──alert────────────── { type, message }   (budget / offline alerts)
```

Every socket connection is authenticated with a **JWT token** in the handshake; users only receive events for their own data.

## 6. Deployment Architecture

| Piece | Platform | Notes |
|---|---|---|
| Frontend | Netlify | `npm run build` → `dist/`, SPA redirects via `netlify.toml` |
| Backend | Render | Blueprint from `server/render.yaml`, health check `/health` |
| Database | MongoDB Atlas | Connection string via `MONGODB_URI` env var |

**Environment contract:** frontend reads `VITE_API_URL` + `VITE_SOCKET_URL`; backend reads `MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_URL`. Never hardcode URLs — see [RULES.md](RULES.md).

---

*Related docs: [PRD.md](PRD.md) · [DESIGN.md](DESIGN.md) · [RULES.md](RULES.md) · [TASKS.md](TASKS.md) · [MEMORY.md](MEMORY.md)*
