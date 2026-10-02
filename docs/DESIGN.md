# 🎨 Design System

### ⚡ UrjaSync – Clean. Smart. Sustainable.

This document defines the visual design system, UI components, and user experience guidelines for **UrjaSync**. The goal is to create a modern, minimal, energy-themed interface with a consistent **neo-brutalist** personality — sharp corners, strong borders, and confident color.

---

## 1. Design Principles

| | | |
|:---:|:---:|:---:|
| 👥 **User-Centered** | 🌿 **Minimal & Clean** | 📚 **Consistent** |
| Simple and intuitive for everyday homeowners. | Reduce clutter and focus on the numbers that matter. | Follow a unified design system across all pages. |

## 2. Color Palette

Primary colors used across the application. All tokens live in `src/index.css` (HSL CSS variables) and `tailwind.config.ts` under the `energy.*` namespace.

| Color | Hex | Usage |
|---|---|---|
| ⬛ **Primary** | `#000000` | Text, borders, primary buttons (inverts to white in dark mode) |
| ⬜ **Background** | `#FFFFFF` | Page background (inverts to black in dark mode) |
| 🔲 **Surface / Muted** | `#F5F5F5` | Cards, chips, secondary backgrounds |
| 🟩 **Energy Green** | `#2BAB70` | Savings, low usage, success states, solar |
| 🟨 **Energy Yellow** | `#F8C630` | Moderate usage, caution states |
| 🟧 **Energy Orange** | `#F99A15` | High usage, approaching budget limit |
| 🟥 **Energy Red** | `#DC2828` | Over budget, critical alerts, destructive actions |
| 🟦 **Energy Blue** | `#0080FF` | Info, links, electricity metrics, charts |
| 🩵 **Energy Cyan** | `#17BFCF` | Accents, gradient text (`gradient-text` utility) |

> 💡 Full light **and** dark mode token sets are defined in `src/index.css` — always use the Tailwind token (`bg-primary`, `text-energy-green`) instead of raw hex values.

## 3. Typography

We use **Space Grotesk** as the primary font for a clean, technical, modern feel — with Space Mono for data and Lora for serif accents.

| | Role | Font | Weight |
|---|---|---|---|
| **Aa** | Display / Headings | `Space Grotesk` (`font-display`) | 600–700 |
| | Body text | `Space Grotesk` (fallback: Inter, system-ui) | 400–500 |
| | Numbers / Code / Metrics | `Space Mono` (`font-mono`) | 400–700 |
| | Serif accents | `Lora` | 400–600 |

**Type scale (Tailwind defaults):**

| Element | Class | Size |
|---|---|---|
| Hero / H1 | `text-4xl md:text-5xl` | 36–48 px |
| H2 | `text-3xl` | 30 px |
| H3 | `text-2xl` | 24 px |
| Section title | `text-xl` | 20 px |
| Body | `text-base` | 16 px |
| Small / captions | `text-sm` / `text-xs` | 14 / 12 px |

## 4. UI Components

Standard components to be used throughout the app — all built on **shadcn/ui** (Radix) in `src/components/ui`.

**Buttons**
| Variant | Style |
|---|---|
| Primary | Black background, white text, hard shadow on hover |
| Secondary / Outline | White background, 1px black border |
| Destructive | Red (`destructive`) background, white text |

**Cards** — white surface, 1px solid black border, **hard offset shadow** (`5px 5px 0px #000`), radius **0** (sharp corners). Glass variant: `glass-card` utility (backdrop blur).

**Badges & Status** — energy-color chips: 🟩 low/active, 🟨 moderate, 🟧 high, 🟥 over-budget/critical.

**Forms** — inputs with 1px black border, radius 0, focus ring = primary. Validation errors via react-hook-form + Zod, surfaced with toasts (Sonner).

**Charts** — Recharts with the energy palette (`--chart-1…5` + `energy.*`), gridless backgrounds, rounded line joins.

**Feedback** — toasts (`sonner` + shadcn toaster), dialogs/sheets for confirmations, skeleton loaders during TanStack Query fetches.

## 5. Signature Styling (Neo-Brutalism)

| Token | Value | Notes |
|---|---|---|
| Radius | `--radius: 0rem` | Everything is sharp-cornered |
| Shadows | `--shadow-sm` → `--shadow-2xl` | Hard offset shadows: `1px 1px 0 #000` → `24px 24px 0 #000` (white in dark mode) |
| Backgrounds | `bg-grid-boxes`, `bg-grid-boxes-dense` | Subtle 32px / 20px grid patterns |
| Gradient text | `gradient-text` | Primary → Energy Cyan for hero headlines |
| Glow | `energy-glow`, `animate-pulse-glow` | Soft primary glow for live/energy elements |
| Motion | Framer Motion | `animate-count-up` for stats, 0.2s ease transitions |

## 6. Layout & UX Rules

- ✅ Dashboard pages use the shared `DashboardLayout` (sidebar + topbar) — never rebuild navigation.
- ✅ Max content width via centered container (`2xl: 1400px`), 2rem padding.
- ✅ Every stat card answers one question at a glance: value + delta + spark.
- ✅ Destructive actions (delete device, logout) always require a confirmation dialog.
- ✅ Loading, empty, and error states are mandatory for every data view.
- ✅ Support light **and** dark mode (`darkMode: ["class"]`) — no hardcoded colors.

---

*Related docs: [PRD.md](PRD.md) · [ARCHITECTURE.md](ARCHITECTURE.md) · [RULES.md](RULES.md) · [TASKS.md](TASKS.md) · [MEMORY.md](MEMORY.md)*
