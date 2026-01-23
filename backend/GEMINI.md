# AI VTON Lab - Backend

## Project Overview

This is the backend service for the AI Virtual Try-On Lab platform. It provides RESTful APIs for user management, image processing (AI VTON), and system administration.

**Key Technologies:**
- **Framework:** FastAPI
- **Database ORM:** Tortoise ORM (MySQL / SQLite)
- **Migrations:** Aerich
- **Runtime:** Python 3.11+
- **Task Queue:** (Inferred) Internal `Bgtask` or similar.
- **Storage:** Aliyun OSS (`oss2`)

## Directory Structure

```
backend/
├── app/
│   ├── api/            # API Route definitions (v1)
│   ├── core/           # Core application logic (security, dependencies, initialization)
│   ├── models/         # Tortoise ORM database models
│   ├── schemas/        # Pydantic schemas for request/response validation
│   ├── settings/       # Configuration management
│   ├── utils/          # Utility functions (OSS, JWT, Password)
│   └── log/            # Logging configuration
├── deploy/             # Deployment configurations
├── docker/             # Docker resources (e.g., MySQL init)
├── migrations/         # Aerich database migrations
├── run.py              # Application entry point
├── Makefile            # Development shortcuts
├── pyproject.toml      # Project configuration and dependencies
└── requirements.txt    # Frozen dependencies
```

## Getting Started

### Prerequisites

- Python 3.11 or higher
- MySQL (optional, defaults to SQLite for dev)
- Redis (optional, if configured)

### Installation

1.  **Environment Setup:**
    Create a virtual environment (recommended):
    ```bash
    python -m venv .venv
    source .venv/bin/activate  # Linux/macOS
    ```

2.  **Install Dependencies:**
    Using `pip`:
    ```bash
    pip install -r requirements.txt
    ```
    Or using `uv` (if available):
    ```bash
    uv sync
    ```

3.  **Configuration:**
    Copy `.env.example` (if exists) or create `.env` based on `app/settings/config.py`.

### Running the Server

Start the development server with hot reload:

```bash
python run.py
```
Or using Makefile:
```bash
make run
```

Server will be available at `http://0.0.0.0:9999`.

### Database Migrations

Use `aerich` for database schema management:

- **Initialize:** `aerich init -t app.settings.config.TORTOISE_ORM`
- **Create Migration:** `aerich migrate`
- **Apply Migration:** `aerich upgrade`

Make commands:
- `make migrate`
- `make upgrade`

## Development Conventions

- **Code Style:** Black & Isort.
- **Linting:** Ruff.
    ```bash
    make check
    ```
- **API Structure:**
    - Routers are in `app/api/v1/`.
    - Each module (e.g., `users`, `oss`) has its own directory.
    - `__init__.py` in module directories typically exports the router.
- **Dependency Injection:** Used for permissions and authentication (`app.core.dependency`).

## Common Issues

- **Import Errors:** Ensure all new routers are correctly exported in their `__init__.py` and included in `app/api/v1/__init__.py`.
- **Address in Use:** The server defaults to port 9999. If it fails to start, check for lingering processes.
