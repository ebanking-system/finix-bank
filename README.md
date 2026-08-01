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
>
> # Transaction Module

## Overview

The Transaction Module is responsible for handling all financial transactions performed by customers.

### Supported Transaction Types

- **TRANSFER** - Transfer money between two bank accounts.
- **DEPOSIT** - Deposit money into an account.
- **WITHDRAWAL** - Withdraw money from an account.

### Transaction Nature

Transaction Nature is determined from the perspective of the logged-in customer.

- **CREDIT** - Money received into the customer's account.
- **DEBIT** - Money sent from the customer's account.

> Note: `TransactionNature` is **not stored in the database**. It is calculated while preparing the response based on the logged-in customer's account.

---

# APIs

## 1. Transfer Money

### Endpoint

```
POST /api/transactions/transfer
```

### Description

Transfers money from the logged-in customer's account to another account.

### Request Body

```json
{
  "toAccount": "123456789012",
  "amount": 5000,
  "remarks": "Rent Payment"
}
```

### Success Response

```json
{
  "message": "Money transferred successfully."
}
```

### Failure Cases

- Receiver account not found
- Sender account inactive
- Receiver account inactive
- Insufficient balance
- Invalid amount

A failed transaction is also stored in the database with status `FAILED`.

---

## 2. Get Transactions

### Endpoint

```
GET /api/transactions
```

Returns the transaction history of the logged-in customer.

---

# Query Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| page | Page number | 0 |
| size | Records per page | 10 |
| sortBy | Field to sort | transactionDateTime |
| direction | asc / desc | desc |
| nature | CREDIT / DEBIT | DEBIT |
| status | SUCCESS / FAILED | SUCCESS |
| fromDate | Start date | 2026-08-01 |
| toDate | End date | 2026-08-31 |

All parameters are optional.

---

## Example Requests

### Get all transactions

```
GET /api/transactions
```

---

### Debit transactions

```
GET /api/transactions?nature=DEBIT
```

---

### Credit transactions

```
GET /api/transactions?nature=CREDIT
```

---

### Successful transactions

```
GET /api/transactions?status=SUCCESS
```

---

### Failed transactions

```
GET /api/transactions?status=FAILED
```

---

### Transactions between two dates

```
GET /api/transactions?fromDate=2026-08-01&toDate=2026-08-31
```

---

### Pagination

```
GET /api/transactions?page=0&size=10
```

---

### Sorting

```
GET /api/transactions?sortBy=amount&direction=asc
```

---

### Combined Filters

```
GET /api/transactions?page=0&size=10&nature=DEBIT&status=SUCCESS&fromDate=2026-08-01&toDate=2026-08-31&sortBy=transactionDateTime&direction=desc
```

---

# Response DTO

```json
{
  "counterPartyName": "Rahul Sharma",
  "counterPartyAccountNumber": "123456789012",
  "transactionType": "TRANSFER",
  "nature": "DEBIT",
  "amount": 5000,
  "transactionStatus": "SUCCESS",
  "referenceNumber": "TXN202608010001",
  "transactionDateTime": "2026-08-01T10:30:15",
  "remarks": "Rent Payment"
}
```

---

# Transaction Flow

```
Client
    │
    ▼
Controller
    │
    ▼
Service
    │
    ├── Validate Accounts
    ├── Validate Amount
    ├── Validate Balance
    ├── Debit Sender
    ├── Credit Receiver
    ├── Save Transaction
    └── Return Response
```

---

# Database Design

The `transactions` table stores a single record for each financial operation.

| Transaction Type | From Account | To Account |
|-----------------|-------------|-----------|
| TRANSFER | Sender | Receiver |
| DEPOSIT | NULL | Receiver |
| WITHDRAWAL | Sender | NULL |

---

# Notes

- All money calculations use `BigDecimal`.
- Money transfer operations are executed within a single database transaction using `@Transactional`.
- If an unexpected exception occurs, Spring rolls back all database changes.
- Failed validation attempts are stored with transaction status `FAILED`.
- Pagination and sorting are performed at the database level.
- Filtering is handled in the backend to avoid loading unnecessary records into the frontend.
- Transaction Nature (`CREDIT`/`DEBIT`) is derived dynamically based on the logged-in customer's account and is not persisted in the database.
