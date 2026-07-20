# Role-Based Access Control (RBAC) Design
**Date**: 2026-07-20
**Project**: Portofio SaaS

## 1. Overview
The platform currently has three roles defined in the `profiles` database table: `user`, `designer`, and `admin`. This design outlines the specific authorities (permissions) for each role and the technical approach for enforcing them in the backend (Next.js App Router + Supabase).

## 2. Role Permissions Matrix

### 🧑‍💻 `user` (End-User / Portfolio Creator)
- **Workspace & Project:** Create, read, update, and delete their own workspaces and projects.
- **Assets:** Upload and delete files/images within their own workspaces.
- **Publishing:** Deploy projects to a subdomain, unpublish, and manage templates for their projects.
- **Billing:** Subscribe, view invoices, and cancel their own subscriptions.
- **Restrictions:** Cannot access other users' data (workspaces, projects, profiles). Cannot access admin or designer interfaces.

### 🎨 `designer` (Template Creator - Phase 2)
- **Base Permissions:** Inherits all `user` permissions.
- **Template Submission:** Submit new template designs for review (`template_submissions`).
- **Submission Tracking:** View the status of their submitted templates (pending, approved, rejected) and edit their draft submissions.
- **Restrictions:** Cannot publish templates directly to the public registry without admin approval. Cannot view other designers' submissions.

### 🛡️ `admin` (System Administrator)
- **Moderation:** View user list, block/suspend user accounts, and manage subdomain blocklists.
- **Read-Only Access:** View all workspaces and projects across the system (strictly read-only).
- **Template Curation:** Approve or reject `template_submissions` from designers.
- **Billing:** View transaction history and subscription status for all users (read-only).
- **Restrictions (Strict Privacy):** Cannot edit (update/delete) user profiles, workspaces, or projects directly.

## 3. Backend Implementation Strategy

We will use a combination of Next.js Route Middleware, Server Action utilities, and Supabase Row Level Security (RLS) to enforce these permissions. 

### A. Next.js Middleware (Route Protection)
- Read the JWT token from cookies/Supabase session. The role is injected into `app_metadata.role` via a database trigger (`sync_role_to_auth_metadata`).
- Protect routes based on role:
  - `/admin/:path*` -> Only accessible if `role === 'admin'`. Otherwise, redirect to `/dashboard`.
  - `/designer/:path*` -> Only accessible if `role === 'designer'` or `'admin'`. Otherwise, redirect to `/dashboard`.

### B. Server Actions Guard (API Protection)
- Create a utility function (e.g., `requireRole(allowedRoles: string[])`) in `src/lib/auth.ts` or similar.
- Inside any secure Server Action, call this utility first to verify the user's role before performing any database mutation.
- Example: `await requireRole(['admin'])` before calling a function to ban a user.

### C. Supabase RLS (Data Layer Protection)
- Ensure all tables have strict RLS policies enabled.
- `profiles` table already has admin select policies.
- Ensure `projects`, `workspaces`, and `template_submissions` also have appropriate policies mapping to the permissions matrix above (e.g., admin can SELECT all projects, but only UPDATE their own).

## 4. Next Steps
- Implement `requireRole` server utility.
- Add route protection in `middleware.ts`.
- Update/verify RLS policies in Supabase migrations to align with the read-only admin rule and designer permissions.
