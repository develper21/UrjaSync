# 🧠 Project Memory

### ⚡ UrjaSync – Context, Progress & Important Notes

This document keeps track of the current state of the project, important decisions, and things to remember. It helps maintain continuity across development sessions and helps new contributors get up to speed quickly.

---

| 📅 **Last Updated** | 🔄 **Current Phase** | 🚀 **Status** |
|:---:|:---:|:---:|
| **Oct 3, 2026** | **Phase 8** | **MVP Live** |
| | Polish & Deployment | Netlify + Render |

---

## 🎯 Current Status

> ✅ Project setup completed (Vite, React, TypeScript, Tailwind)
> ✅ Backend API completed (Express, MongoDB, JWT auth, rate limiting)
> ✅ All 6 data models & 7 route groups implemented
> ✅ Authentication (signup, login, protected routes) completed
> ✅ Devices, Energy, Analytics, Billing & Sustainability modules completed
> ✅ Real-time updates via Socket.io working end-to-end
> ✅ Deployed: frontend on Netlify, backend on Render, DB on MongoDB Atlas
> 🔄 Working on custom domain, monitoring & E2E testing

## ✅ Completed Tasks

| # | Task | Completed On |
|---|---|---|
| 1.1 | Initialize Vite + React + TypeScript project | Nov 2025 |
| 1.2 | Configure Tailwind CSS + shadcn/ui | Nov 2025 |
| 1.3 | Set up Git repository | Nov 2025 |
| 2.1 | Create Express server & DB config | Dec 2025 |
| 2.2 | Design MongoDB schemas (6 models) | Dec 2025 |
| 3.1 | JWT access + refresh token auth | Dec 2025 |
| 3.3 | Auth page UI (login + signup) | Dec 2025 |
| 3.4 | AuthContext & ProtectedRoute | Dec 2025 |
| 4.1 | Device CRUD API | Jan 2026 |
| 4.2 | Devices page UI | Jan 2026 |
| 5.1 | Energy readings API | Jan 2026 |
| 5.2 | Socket.io + JWT handshake auth | Jan 2026 |
| 6.2 | Analytics page with Recharts | Feb 2026 |
| 7.2 | Billing page UI + budget tracker | Feb 2026 |
| 7.5 | Sustainability page UI | Feb 2026 |
| 8.3 | Deploy backend on Render | Sep 2026 |
| 8.4 | Deploy frontend on Netlify | Sep 2026 |

## 🔄 In Progress

| # | Task | Notes |
|---|---|---|
| 8.5 | Custom domain & monitoring setup | DNS pointing + uptime checks |
| 8.6 | E2E tests & Lighthouse pass | Not started — next up |

## 🔑 Important Decisions & Things to Remember

- 🔐 **Auth:** JWT access token (7d) + refresh token (30d) stored in `localStorage`; secrets only in `.env` (`JWT_SECRET`, `JWT_REFRESH_SECRET`) — **never commit**.
- 🌐 **API config:** frontend reads `VITE_API_URL` / `VITE_SOCKET_URL` (prod: `https://urjasync-service.onrender.com`, dev: `http://localhost:5000`). Change in `src/services/api.config.ts` only.
- 🧹 **Data lifecycle:** `EnergyReading` has a **TTL index** — readings auto-delete after **2 years**. Don't remove the index.
- 🎨 **Design:** neo-brutalist system (radius 0, hard offset shadows, Space Grotesk). All tokens in `src/index.css`; use Tailwind `energy.*` tokens, not raw hex. See [DESIGN.md](DESIGN.md).
- 📡 **Socket auth:** every socket connection sends JWT in handshake; events are scoped per-user room.
- 🧪 **Demo credentials** (after `npm run seed`): `demo@urjasync.com` / `demo123`.
- 📦 **API response format:** `{ success, message, data, count }` — keep all endpoints consistent.
- 🛡️ **Security:** bcrypt 12 rounds, rate limits 100 req/15 min (global) & 10 req/15 min (auth), helmet + CORS locked to `CLIENT_URL`.

## 🛠️ Key Commands

| Command | What it does |
|---|---|
| `npm run dev` | Frontend dev server (port **8080**) |
| `cd server && npm run dev` | Backend dev server (port **5000**) |
| `cd server && npm run seed` | Seed demo data |
| `npm run build` | Production frontend build (`dist/`) |
| `npm run test` | Vitest suite |
| `npm run lint` | ESLint check |

## 🔗 Quick Links

- 📄 Docs: [PRD](PRD.md) · [ARCHITECTURE](ARCHITECTURE.md) · [RULES](RULES.md) · [DESIGN](DESIGN.md) · [TASKS](TASKS.md)
- 🚀 Deploy guide: [DEPLOY.md](../DEPLOY.md)
- 📮 API testing: `/postman` collection

---

*Update this file after every completed task or phase — it is the single source of truth for project context.*
