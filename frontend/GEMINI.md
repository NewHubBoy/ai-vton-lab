# AI-MS-Frontend Project Context

## Project Overview
This is a modern web frontend application built with **Next.js 16** (App Router) and **React 19**. It serves as the user interface for the AI-MS system, likely communicating with a backend API.

### Key Technologies
- **Framework:** Next.js 16.1.1
- **UI Library:** React 19.2.3
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 (configured via PostCSS)
- **Components:** Headless UI, Heroicons
- **Fonts:** Geist (via `next/font`)

## Building and Running

### Local Development
The project uses `npm` (or `pnpm`/`yarn`) for dependency management.

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```
The application will be available at [http://localhost:3000](http://localhost:3000).

### Production Build
To create a production-ready build:
```bash
npm run build
npm run start
```

### Docker
The project includes a `docker-compose.yml` for containerized development.
```bash
docker-compose up
```
*   **Container Name:** `ai-ms-frontend`
*   **Port:** 3000
*   **Environment:** `NEXT_PUBLIC_API_URL` defaults to `http://localhost:8080`.

## Development Conventions

### File Structure
- **`src/app/`**: Contains the App Router pages and layouts.
- **`src/components/`**: Reusable React components.
- **`public/`**: Static assets (images, SVGs).

### Coding Standards
- **Imports:** Use the `@/` alias to import from the `src` directory (configured in `tsconfig.json`).
- **Styling:** Use Tailwind CSS utility classes. Global styles are defined in `src/app/globals.css`.
- **Linting:** Standard ESLint configuration for Next.js is enforced (`npm run lint`).
- **Strict Mode:** TypeScript `strict` mode is enabled.

### Testing
*Currently, no explicit test runner (like Jest or Vitest) is visible in `package.json`. Verify test setup before running commands.*
