# 🚀 Portofio SaaS

SaaS portfolio-website builder. Create, customize, and publish beautiful portfolios effortlessly.

**Live Demo:** [https://portofio-beta.vercel.app/](https://portofio-beta.vercel.app/)

---

## 💻 Tech Stack

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)

---

## ✨ Features

- **Multi-Tenant Architecture**: Users can create multiple workspaces/brands.
- **Dynamic Portfolios**: Choose from various beautifully designed templates.
- **Internationalization (i18n)**: Full bilingual support (English & Bahasa Indonesia).
- **Smooth Animations**: High-end micro-interactions powered by GSAP & Framer Motion.
- **Subdomain Routing**: Publish portfolios to custom subdomains seamlessly.

---

## 🛠️ Prerequisites & Setup

First, clone the repository and install the dependencies:

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the root directory and configure the following variables:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL (used by both client and server).
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key (safe to expose to the browser).
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (strictly for server-side use, bypasses RLS).
- `NEXT_PUBLIC_ROOT_DOMAIN`: The root domain of the application (e.g., `localhost:3000` for local development or your production domain on Vercel). This is required for the middleware to handle subdomain routing properly.

### Running the App

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 📂 Project Structure

- **`src/app`**: Next.js App Router containing pages, layouts, and API routes.
- **`src/components`**: Reusable UI components, separated into domains (e.g., `landing`, `dashboard`, `portfolio`).
- **`src/lib`**: Core logic including Supabase clients, state stores, and Server Actions.
- **`messages`**: i18n translation files (`id.json` and `en.json`).

---

## 📚 Related Documentation

For deeper context on the product and design decisions, please refer to:

- [**Product Requirements Document (PRD)**](./PRD.md): Contains the complete spec, user flows, and database schema.
- [**Design System**](./DESIGN.md): Details the design tokens, component anatomy, and UI guidelines.
