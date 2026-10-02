# ✅ Project Tasks

### ⚡ UrjaSync – Task Breakdown & Development Plan

This document contains the complete list of tasks for building the **UrjaSync** application. Tasks are divided into phases with clear deliverables, priorities and status tracking.

---

## 📊 Progress Overview

| 📋 Total Tasks | ✅ Completed | 🔄 In Progress | ⬜ Pending |
|:---:|:---:|:---:|:---:|
| **33** | **31** | **1** | **1** |
| `██████████████████░░ 100%` | `█████████████████░░ 94%` | `█░░░░░░░░░░░░░░░░░░ 3%` | `█░░░░░░░░░░░░░░░░░░ 3%` |

> Priority: 🔴 High · 🟡 Medium · 🟢 Low &nbsp;&nbsp;|&nbsp;&nbsp; Status: ✅ Completed · 🔄 In Progress · ⬜ Pending

---

## ✅ Phase 1: Project Setup

*Set up the development environment, repository and core configuration.*

| # | Task | Priority | Status | Notes |
|---|---|---|---|---|
| 1.1 | Initialize Vite + React + TypeScript project | 🔴 High | ✅ Completed | Vite 7 + SWC, path alias `@/` |
| 1.2 | Configure Tailwind CSS + shadcn/ui | 🔴 High | ✅ Completed | Tailwind 3.4, Radix primitives |
| 1.3 | Set up Git repository | 🔴 High | ✅ Completed | GitHub |
| 1.4 | Configure ESLint & Vitest | 🟡 Medium | ✅ Completed | eslint 9, vitest 3 |

## ✅ Phase 2: Backend & Database

*Build the Express server, MongoDB models and shared middleware.*

| # | Task | Priority | Status | Notes |
|---|---|---|---|---|
| 2.1 | Create Express server & DB config | 🔴 High | ✅ Completed | `server/`, Mongoose connection |
| 2.2 | Design MongoDB schemas (6 models) | 🔴 High | ✅ Completed | User, Device, EnergyReading, Bill, Sustainability, TariffSchedule |
| 2.3 | Auth, error & rate-limit middleware | 🔴 High | ✅ Completed | helmet, express-rate-limit, CORS |
| 2.4 | Input validation with Zod | 🟡 Medium | ✅ Completed | `server/src/validators` |
| 2.5 | Seed script with demo data | 🟢 Low | ✅ Completed | `npm run seed` |

## ✅ Phase 3: Authentication

*Implement user authentication and protected routes.*

| # | Task | Priority | Status | Notes |
|---|---|---|---|---|
| 3.1 | JWT access + refresh tokens | 🔴 High | ✅ Completed | 7d / 30d, bcrypt 12 rounds |
| 3.2 | Register / login / logout APIs | 🔴 High | ✅ Completed | `/api/auth` |
| 3.3 | Auth page UI (login + signup) | 🔴 High | ✅ Completed | `src/pages/Auth.tsx` |
| 3.4 | AuthContext & ProtectedRoute | 🔴 High | ✅ Completed | Global auth state + route guard |

## ✅ Phase 4: Device Management

*Allow users to add, control and organize their smart devices.*

| # | Task | Priority | Status | Notes |
|---|---|---|---|---|
| 4.1 | Device CRUD API | 🔴 High | ✅ Completed | `/api/devices` |
| 4.2 | Devices page UI | 🔴 High | ✅ Completed | Cards, room filters, add/edit dialogs |
| 4.3 | Toggle & intensity control | 🔴 High | ✅ Completed | Optimistic UI updates |
| 4.4 | Device stats endpoint | 🟡 Medium | ✅ Completed | `GET /:id/stats?days=7` |

## ✅ Phase 5: Energy & Real-time

*Track usage live and stream updates to the dashboard.*

| # | Task | Priority | Status | Notes |
|---|---|---|---|---|
| 5.1 | Energy readings API (realtime/today/weekly/monthly) | 🔴 High | ✅ Completed | `/api/energy` |
| 5.2 | Socket.io server + JWT handshake auth | 🔴 High | ✅ Completed | `energy:update`, `device:status`, `alert` |
| 5.3 | Real-time dashboard updates | 🔴 High | ✅ Completed | `src/services/socket.service.ts` |

## ✅ Phase 6: Analytics

*Turn raw readings into insights users can act on.*

| # | Task | Priority | Status | Notes |
|---|---|---|---|---|
| 6.1 | Analytics API (trend, cost, breakdown, carbon) | 🟡 Medium | ✅ Completed | `/api/analytics` |
| 6.2 | Analytics page with Recharts | 🟡 Medium | ✅ Completed | Usage, cost & device charts |

## ✅ Phase 7: Billing & Sustainability

*Give users bill visibility, budget control and green tracking.*

| # | Task | Priority | Status | Notes |
|---|---|---|---|---|
| 7.1 | Billing API (current, history, budget, savings) | 🔴 High | ✅ Completed | `/api/billing` |
| 7.2 | Billing page UI | 🔴 High | ✅ Completed | Bills, budget tracker |
| 7.3 | Budget threshold alerts | 🟡 Medium | ✅ Completed | Uses user settings + socket `alert` |
| 7.4 | Sustainability goals API | 🟡 Medium | ✅ Completed | CO₂, solar, zero-waste goals |
| 7.5 | Sustainability page UI | 🟡 Medium | ✅ Completed | Trees equivalent, water saved |

## 🔄 Phase 8: Polish & Deployment

*Ship the MVP and keep it healthy in production.*

| # | Task | Priority | Status | Notes |
|---|---|---|---|---|
| 8.1 | Landing page & marketing sections | 🟡 Medium | ✅ Completed | Hero, features, CTA |
| 8.2 | Settings page (profile, budget, notifications) | 🟡 Medium | ✅ Completed | `/dashboard/settings` |
| 8.3 | Deploy backend on Render | 🔴 High | ✅ Completed | `render.yaml` blueprint |
| 8.4 | Deploy frontend on Netlify | 🔴 High | ✅ Completed | `netlify.toml` SPA redirects |
| 8.5 | Custom domain & monitoring setup | 🟡 Medium | 🔄 In Progress | DNS + uptime checks |
| 8.6 | E2E tests & Lighthouse pass | 🟢 Low | ⬜ Pending | Critical flows + perf audit |

---

*Related docs: [PRD.md](PRD.md) · [ARCHITECTURE.md](ARCHITECTURE.md) · [RULES.md](RULES.md) · [DESIGN.md](DESIGN.md) · [MEMORY.md](MEMORY.md)*
