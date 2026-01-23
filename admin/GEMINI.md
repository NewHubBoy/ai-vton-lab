# Gemini Context File

## special rules

- 请用中文回答
- 请不要回答与问题无关的内容

## Project Overview

**admin** is a modern admin dashboard application built with **Next.js 16 (App Router)** and **React 19**.
It utilizes **Tailwind CSS v4** for styling and **shadcn/ui** (Radix Nova style) for UI components.
The project manages global state/theme with `next-themes` and data fetching with **TanStack React Query v5**.

## Tech Stack

- **Framework**: Next.js 16.1.4 (App Router)
- **Language**: TypeScript 5
- **UI Library**: React 19.2.3, shadcn/ui (Radix Nova style), Lucide React (Icons)
- **Styling**: Tailwind CSS v4, tw-animate-css
- **State/Data**: TanStack React Query v5, next-themes (Dark mode)
- **Package Manager**: pnpm

## Building and Running

### Key Commands

- `pnpm dev`: Start the development server at http://localhost:3000.
- `pnpm build`: Build the application for production.
- `pnpm start`: Start the production server.
- `pnpm lint`: Run ESLint to check for code quality issues.

## Project Structure

```
admin/
├── app/                      # Next.js App Router directory
│   ├── layout.tsx            # Root layout (Fonts, Metadata)
│   ├── page.tsx              # Landing page
│   ├── login/                # Login page
│   ├── dashboard/            # Admin dashboard area
│   │   ├── layout.tsx        # Dashboard layout (Sidebar, Breadcrumbs)
│   │   ├── users/            # User management
│   │   ├── roles/            # Role management
│   │   ├── menus/            # Menu management
│   │   ├── depts/            # Department management
│   │   ├── apis/             # API management
│   │   └── auditlogs/        # Audit logs
│   └── globals.css           # Global styles (Tailwind + CSS Variables)
├── components/               # React components
│   ├── ui/                   # shadcn/ui primitive components
│   ├── app-sidebar.tsx       # Sidebar implementation
│   ├── auth-provider.tsx     # Authentication context provider
│   ├── login-form.tsx        # Login form component
│   └── ...
├── lib/                      # Utilities and libraries
│   ├── api/                  # API Layer
│   │   ├── client.ts         # HTTP Client (Axios-like wrapper using fetch or similar)
│   │   ├── hooks.ts          # React Query Hooks
│   │   ├── index.ts          # API Endpoint definitions
│   │   └── config.ts         # API Configuration
│   └── utils.ts              # cn() utility for class merging
└── public/                   # Static assets
```

## Architecture & Patterns

### API Layer (`lib/api`)

- **Client (`client.ts`)**: Handles HTTP requests, token management (localStorage), interceptors, and 401/403 redirects.
- **Hooks (`hooks.ts`)**: Custom React Query hooks. Use `useQuery` for fetching lists and `useMutation` for mutations (create/update/delete).
- **Endpoints (`index.ts`)**: API definitions grouped by module.
- **Error Handling**: API errors are thrown via an `ApiError` class.

### Authentication

- **`components/auth-provider.tsx`**: Provides global auth context (`useAuth`). Handles login state and automatic redirection on 401/403 errors.
- **Route Protection**: The Dashboard layout checks for authentication and redirects to login if necessary.

### Styling & UI

- **Tailwind v4**: Uses the new v4 engine.
- **Shadcn/ui**: Components located in `components/ui`.
- **Class Merging**: Always use the `cn()` utility (from `lib/utils.ts`) when applying conditional or override classes to components.
- **Themes**: Dark mode supported via `next-themes`.

### Development Conventions

- **Path Aliases**: `@/*` maps to `./*` (e.g., `@/components`, `@/lib`).
- **Server vs Client**: This uses Next.js App Router. Components are Server Components by default. Add `'use client'` at the top of files requiring interactivity (hooks, event listeners).
- **Data Fetching**: Prefer `useQuery` for data and `useMutation` for actions. Invalidate queries after successful mutations to refresh data.

## Language Preference

**The user prefers to communicate in Chinese (Simplified).** While this context file is in English for system clarity, please respond to the user in Chinese unless requested otherwise.
