# 📋 Product Requirements Document (PRD)

### ⚡ UrjaSync – Your Smart Home Energy Companion

| | |
|---|---|
| **Version:** | 1.0 |
| **Date:** | Oct 3, 2026 |
| **Author:** | Team UrjaSync |
| **Status:** | MVP (v1.0) |
| **Target Launch:** | MVP (v1.0) |

---

## 1. Product Overview

UrjaSync is a web application designed to help homeowners **monitor, control, and optimize** their home electricity consumption. It brings real-time energy monitoring, smart device control, analytics, billing insights, and sustainability tracking into one clean dashboard — all in one place.

## 2. Problem Statement

Households have no easy way to see **where their electricity units actually go**. Bills arrive once a month with a single number, appliances run unnoticed, and there is no visibility into which device is burning money. Existing smart-home apps are complex, fragmented, or utility-locked — leaving users without a centralized, easy-to-use solution.

## 3. Goals

- Provide **real-time visibility** into home energy usage and cost
- Help users **reduce electricity bills** through insights and budget alerts
- Enable **effortless smart device control** (on/off, intensity) from one screen
- Promote **sustainable habits** with carbon-footprint tracking and goals
- Offer a **clean, modern, distraction-free** user experience

## 4. Target Users

- 🏠 Urban homeowners & tenants with smart appliances / meters
- 👨‍👩‍👧 Age group 18–55, budget-conscious, tech-savvy
- ☀️ Rooftop solar owners who want to track generation & credits
- 🌱 Environmentally conscious users tracking their carbon footprint
- ⚡ Need: one simple, reliable tool for everyday energy management

## 5. Core Features (MVP)

1. **User Authentication** (Sign up / Login, JWT sessions, protected routes)
2. **Dashboard** (real-time usage, cost, active devices, budget status, alerts)
3. **Device Management** (Add, edit, delete, on/off, intensity, room filters)
4. **Energy Analytics** (Today / weekly / monthly trends, device breakdown, carbon trend)
5. **Billing & Budget** (Monthly bills, budget tracker, threshold alerts, savings)
6. **Sustainability** (Goals, CO₂ saved, trees equivalent, water saved)
7. **Real-time Updates** (Socket.io live usage, device status, push alerts)

## 6. Out of Scope (Future Scope)

- Peer-to-peer energy marketplace & community trading
- Voice assistant integration (Alexa / Google Home)
- Native mobile apps (iOS / Android)
- ML-based predictive maintenance & appliance failure alerts
- Direct utility-provider API integration & auto tariff fetch

## 7. Success Metrics

| Metric | Target |
|---|---|
| Weekly active users | 60% of signups |
| Users with a monthly budget set | > 70% |
| Average measured bill savings | 10–15% in 3 months |
| Device control actions / user / week | > 20 |
| Dashboard p95 load time | < 2s |

---

*Related docs: [ARCHITECTURE.md](ARCHITECTURE.md) · [DESIGN.md](DESIGN.md) · [RULES.md](RULES.md) · [TASKS.md](TASKS.md) · [MEMORY.md](MEMORY.md)*
