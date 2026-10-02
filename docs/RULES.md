# 📄 Development Rules

### ⚡ UrjaSync – Project Guidelines for AI & Human Collaboration

This document defines the development rules, coding standards, and best practices for the **UrjaSync** application. These rules ensure consistency, maintainability, security, and quality. **Both AI assistants and human contributors must follow these guidelines.**

---

## 1️⃣ General Principles

These rules apply to the entire project.

- ✅ Follow the project documentation (PRD, ARCHITECTURE, DESIGN) before making changes.
- ✅ Keep the code clean, readable and well-structured.
- ✅ Prioritize simplicity and maintainability.
- ✅ Do not duplicate logic. Reuse existing components, utilities or services.
- ✅ Make small, focused changes instead of large, risky edits.
- ✅ Do not modify unrelated files.
- ✅ Write self-explanatory code with meaningful variable and function names.

## 2️⃣ Technology & Coding Standards

Rules related to the tech stack and coding style.

| | Standard | Rule |
|---|---|---|
| 🌐 | **Language** | Use **TypeScript** in the frontend. Avoid `any` unless absolutely necessary. Backend stays in JavaScript (CommonJS/ESM as configured). |
| ⚛️ | **Framework** | Follow **React + Vite** best practices. Functional components + hooks only. |
| 🎨 | **Styling** | Use **Tailwind CSS** and follow the design system in [DESIGN.md](DESIGN.md). Never use inline styles or raw CSS for new UI. |
| 🧩 | **Components** | Build on **shadcn/ui** primitives in `src/components/ui`. Do not reinvent buttons, dialogs, or toasts. |
| 🗄️ | **Server state** | Use **TanStack Query** for API data. Do not fetch with raw `useEffect` in new code. |
| 🌍 | **Global state** | Only authentication lives in `AuthContext`. Everything else stays server-side. |
| 🛣️ | **Routing** | All routes defined in `src/App.tsx`; protected pages wrapped in `ProtectedRoute`. |
| 📡 | **API calls** | Always go through `src/services/*` (service layer), never `fetch`/`axios` directly inside components. |
| 🧹 | **Linting** | Follow ESLint config (`npm run lint`); zero errors before commit. |
| 📦 | **Dependencies** | Use stable, well-maintained packages. No new dependency without a clear reason. |
| 📁 | **File Naming** | Components/Pages in `PascalCase.tsx`, services in `kebab-case.service.ts`, utilities in `camelCase.ts`. |

## 3️⃣ Project Structure

Follow the defined folder structure in [ARCHITECTURE.md](ARCHITECTURE.md) to keep the codebase organized.

- ✅ Reusable UI components go in `/src/components` (primitives in `components/ui`).
- ✅ Route pages live in `/src/pages` — one page, one file.
- ✅ All backend logic stays in `/server/src` (controllers, models, routes, validators).
- ✅ API services must be in `/src/services`; common utilities in `/src/lib`.
- ✅ Types and interfaces live next to their feature or in the service that owns them.
- ✅ Do not create new folders without a clear structural reason.

## 4️⃣ Backend & Security Rules

Non-negotiable rules for `server/`.

- ✅ **Never** commit `.env`, secrets, or API keys. Use `.env.example` as the template.
- ✅ All routes under `/api` (except `/api/auth/*` login/register) require JWT auth middleware.
- ✅ Validate every request body/query with **Zod** validators in `server/src/validators`.
- ✅ Hash passwords with **bcrypt (12 rounds)**; never store or return raw passwords.
- ✅ Every API response follows the standard format:
  ```json
  { "success": true, "message": "optional", "data": { }, "count": 10 }
  ```
- ✅ Scope **every** DB query by `userId` — a user must never read another user's data.
- ✅ Keep helmet, CORS (`CLIENT_URL`), and rate limits (100 req/15 min global, 10 req/15 min auth) enabled in production.
- ✅ MongoDB indexes defined in models are part of the schema — don't remove them.

## 5️⃣ Git & Workflow Rules

- ✅ Branch naming: `feature/…`, `fix/…`, `chore/…`.
- ✅ Commits: small, atomic, imperative message (e.g. `feat: add budget alerts`).
- ✅ Never push directly to `main` for risky changes.
- ✅ Update [TASKS.md](TASKS.md) and [MEMORY.md](MEMORY.md) status after completing a phase.
- ✅ Run `npm run lint` + `npm run test` (and backend `npm run dev` smoke test) before raising a PR.

## 6️⃣ Testing Rules

- ✅ New utility functions and services get Vitest unit tests (`src/test`).
- ✅ Backend endpoints are smoke-tested via the Postman collection in `/postman`.
- ✅ Do not skip or weaken failing tests to make CI green — fix the cause.

---

*Related docs: [PRD.md](PRD.md) · [ARCHITECTURE.md](ARCHITECTURE.md) · [DESIGN.md](DESIGN.md) · [TASKS.md](TASKS.md) · [MEMORY.md](MEMORY.md)*
