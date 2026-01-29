# Gemini Context File

## Project Overview

**ai-vton-lab** is a monorepo-style project containing multiple frontend applications and a Python backend for an AI Virtual Try-On and Image Generation Platform.

**Current Date:** January 23, 2026

## Directory Structure & Sub-Projects

The project is divided into several distinct applications:

| Directory | Type | Stack | Description |
| :--- | :--- | :--- | :--- |
| **`admin/`** | Frontend | Next.js 16 (App Router), React 19, Tailwind v4, Shadcn/ui | Modern Admin Dashboard. |
| **`client/`** | Frontend | Next.js 16 (App Router), React 19, Tailwind v4, Zustand | Main user-facing client application (replaces the Vue 3 mention in README). |
| **`backend/`** | Backend | FastAPI, Tortoise ORM, MySQL/SQLite | Core API service. |
| **`backend/web/`** | Frontend | Vue 3, Vite, Naive UI | Legacy or backend-bundled Admin UI (likely the "Vue 3" app mentioned in root README). |

## Key Technologies

### Frontend Common Stack (admin, client)
- **Framework:** Next.js 16+ (App Router)
- **Language:** TypeScript
- **UI Lib:** React 19
- **Styling:** Tailwind CSS v4
- **Package Manager:** pnpm

### Backend Stack
- **Framework:** FastAPI 0.111.0
- **Database:** MySQL / SQLite (via Tortoise ORM)
- **Runtime:** Python 3.11+
- **Package Manager:** `uv` or `poetry` (pyproject.toml present)

## Getting Started

### 1. Backend

```bash
cd backend

# Install dependencies
# If using Makefile:
make install

# OR using pip/uv:
pip install -r requirements.txt
# or
uv sync

# Run the server
python run.py
# Server starts at http://localhost:9999
```

### 2. Admin (Next.js)

```bash
cd admin
pnpm install
pnpm dev
# Server starts at http://localhost:3000
```

### 3. Client (Next.js)

```bash
cd client
pnpm install
pnpm dev
# Server starts at http://localhost:3000 (check port if running alongside admin)
```

## Development Conventions

- **Monorepo-ish:** Treat each subdirectory as an independent project with its own configuration.
- **Next.js Projects:**
  - use `pnpm` for package management.
  - Follow `src/` or `app/` directory structures.
  - Styling uses Tailwind CSS v4.
- **Backend:**
  - Follows FastAPI patterns (`app/api`, `app/core`, `app/models`).
  - Uses `aerich` for migrations (`make migrate`, `make upgrade`).

## Important Notes

- **README Discrepancy:** The root `README.md` mentions `client` is Vue 3. This is **outdated**. The actual Vue 3 app is located in `backend/web`. The `client` directory is now a Next.js application.
- **Language:** The user prefers Chinese (Simplified) for communication.
