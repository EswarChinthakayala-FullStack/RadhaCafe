# RADHACAFE — MASTER PROJECT CONTEXT

Baseline engineering specification for the RadhaCafe web application.

---

## 1. PROJECT IDENTITY
- **Name**: RadhaCafe
- **Type**: Professional Cafe Order Management and Business Analytics Web Application with a public-facing cafe website.
- **Two Major Areas**:
  1. Public Website (Brand experience, about, opening hours, menu highlights, gallery, approved reviews, contact)
  2. Protected Admin / Cafe POS Application (Order management, POS item selection, receipt generation, printer integration, analytics, menu management, review moderation)

---

## 2. CORE BUSINESS MODEL
- Single-Admin System (One cafe owner/admin account).
- No public admin registration, customer account system, or public login/signup.
- Public customer review submissions must be moderated (`is_approved = true`) before displaying.

---

## 3. PRIMARY BUSINESS WORKFLOW
Admin Login → Admin Dashboard → New Order → Browse/Search Menu → Add Items to Cart → Adjust Quantities → Calculate Totals → Create Order in Supabase (Atomic RPC `create_order_with_items`) → Generate ESC/POS Receipt → Print via Bluetooth Thermal Printer → Order Saved in History & Analytics Updated.

> [!IMPORTANT]
> The database order is the source of truth. Printer failure must never delete or roll back a saved order. Allow retry/reprint.

---

## 4. TECHNOLOGY STACK
- **Frontend**: React 18 (or 19), TypeScript, Vite
- **Styling**: Tailwind CSS v4, ShadCN UI (RadhaCafe Coffee Theme)
- **Icons**: HugeIcons (`@hugeicons/react`, `@hugeicons/core-free-icons`)
- **Routing**: React Router v6
- **State Management**: Zustand (Client state / Cart), TanStack Query (Server state / Supabase)
- **Forms & Validation**: React Hook Form, Zod
- **Backend & Auth**: Supabase (PostgreSQL, Row Level Security, Auth, Storage, Realtime, RPCs)
- **Charts**: Recharts (ShadCN chart wrappers)
- **Printer**: Web Bluetooth API, ESC/POS commands

---

## 5. ARCHITECTURE & SECURITY
- **Layered Architecture**: UI → React Components → Custom Hooks → TanStack Query → Typed Supabase Queries → Supabase.
- **Data Access Standard**: TanStack Query (`useQuery`, `useMutation`, key invalidation, pagination, date-range filtering). No unbounded queries.
- **Order Preservation**: Historical order items preserve purchase-time unit prices.
- **Order Numbers**: Database generated (format: `RC-YYYYMMDD-XXXX`).
- **Security**: Row Level Security (RLS) enabled on all Supabase tables. No service-role keys in frontend. Environment variables via `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

---

## 6. DESIGN SYSTEM
- **Palette**:
  - Primary / Coffee Bean: `#6F4E37`
  - Dark Roast: `#3E2723`
  - Espresso: `#8B5A2B`
  - Cinnamon CTA: `#B85C1E`
  - Cream: `#F5E6D3`
  - Latte Background: `#FFF8F0`
  - Surface: `#FFFFFF`
  - Text: `#2C1810`
  - Success: `#4CAF50` | Warning: `#FFA726` | Danger: `#E53935`
- **Typography**:
  - Headings / Brand: `Fraunces`
  - UI / Body: `Inter`
  - Monospace / Thermal Receipt: `JetBrains Mono`
