# Finix Bank — E-Banking Platform

An e-banking platform automating account management and online banking, built as a modular monolith backend with a decoupled notification service.

## Tech Stack

- **Frontend:** React
- **Backend:** Spring Boot (Java) — modular monolith
- **Notification Service:** .NET Core Web API
- **Database:** PostgreSQL (banking), MySQL/other (notifications)
- **Messaging:** RabbitMQ

## Architecture

```
finix-bank/
├── banking-service/       ← Spring Boot modular monolith (single deployable)
├── notification-service/  ← Separate .NET service, communicates via RabbitMQ
├── frontend/               ← React SPA
├── database/               ← Migrations & seed data
└── docker/                 ← Docker Compose & service configs
```

`banking-service` is organized as a **modulith** — one application, but internally split into isolated feature modules with enforced dependency boundaries. Cross-module communication happens through public service interfaces or Spring application events, never by reaching into another module's entities/repositories directly.

## Team

Anish Warushe, Pranav Patil, Sandesh Waingade and Adarsh Patil

## Getting Started

> Setup instructions (build, run, environment variables) — to be added once the backend is runnable end-to-end.
