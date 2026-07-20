# RBAC Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement backend Role-Based Access Control (RBAC) via Next.js Route Middleware, Server Actions guards, and Supabase RLS.

**Architecture:** Middleware protects `/admin` and `/designer` routes based on JWT claims. Server actions use a `requireRole` utility to verify roles before mutating data. Supabase RLS policies are added to allow admins read-only access to workspaces, projects, and billing data.

**Tech Stack:** Next.js (App Router), Supabase SSR, PostgreSQL

## Global Constraints

- Valid roles: `user`, `designer`, `admin`
- Admin is strictly read-only for user data (workspaces, projects).

---

### Task 1: Server Action Utility (`requireRole`)

**Files:**
- Create: `src/lib/auth/roles.ts`

**Interfaces:**
- Consumes: `@supabase/ssr` to get the session token.
- Produces: `requireRole(allowedRoles: string[])` returning a boolean or throwing an error. `getUserRole()` returning the role string.

- [ ] **Step 1: Write the implementation**

```typescript
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function getUserRole(): Promise<string> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 'user'; // default fallback
  return user.app_metadata?.role || 'user';
}

export async function requireRole(allowedRoles: string[]): Promise<void> {
  const role = await getUserRole();
  if (!allowedRoles.includes(role)) {
    throw new Error(`Unauthorized: requires one of ${allowedRoles.join(', ')}`);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/auth/roles.ts
git commit -m "feat: add requireRole utility for server actions"
```

### Task 2: Route Protection via Middleware

**Files:**
- Modify: `src/proxy.ts` (rename to `src/middleware.ts`)

- [ ] **Step 1: Rename proxy.ts to middleware.ts**

```bash
mv src/proxy.ts src/middleware.ts
```

- [ ] **Step 2: Add role checks to middleware**

Modify `src/middleware.ts`. Add this role checking logic right after `await supabase.auth.getUser();` in the `refreshSupabaseSession` function:

```typescript
  const { data: { user } } = await supabase.auth.getUser();
  
  // ROLE CHECK
  const pathname = request.nextUrl.pathname;
  const isDashboard = pathname.includes('/dashboard');
  
  if (pathname.includes('/admin')) {
    const role = user?.app_metadata?.role || 'user';
    if (role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  if (pathname.includes('/designer')) {
    const role = user?.app_metadata?.role || 'user';
    if (role !== 'designer' && role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return response;
```

- [ ] **Step 3: Commit**

```bash
git add src/middleware.ts src/proxy.ts
git commit -m "fix: rename proxy to middleware and add route RBAC protection"
```

### Task 3: Admin Read-Only RLS Policies

**Files:**
- Create: `supabase/migrations/20260720000001_add_admin_read_policies.sql`

- [ ] **Step 1: Write migration for Admin Select All**

```sql
-- Admin read-only access to workspaces
create policy "workspaces_admin_select_all"
  on public.workspaces for select to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Admin read-only access to workspace_profile
create policy "workspace_profile_admin_select_all"
  on public.workspace_profile for select to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Admin read-only access to projects
create policy "projects_admin_select_all"
  on public.projects for select to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Admin read-only access to subscriptions
create policy "subscriptions_admin_select_all"
  on public.subscriptions for select to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Admin read-only access to billing_events
create policy "billing_events_admin_select_all"
  on public.billing_events for select to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260720000001_add_admin_read_policies.sql
git commit -m "feat: add admin read-only RLS policies for all resources"
```
