# RADHACAFE — SYSTEM ARCHITECTURE AND DATA FLOW CONTEXT

Authoritative system architecture and application data flow specification for RadhaCafe.

---

## 1. HIGH-LEVEL ARCHITECTURE LAYERS
```
Public Website (Marketing / Brand)
       │
RadhaCafe React SPA (React 18 + TS + Vite)
       │
┌──────┴───────────────────────────────────────┐
│ React Router v6                               │
├──────────────────────┬───────────────────────┤
│ Public Routes        │ Protected Admin Routes│
│ (/)                  │ (/admin/*)            │
└──────────────────────┴───────────────────────┘
       │
┌──────┴───────────────────────────────────────┐
│ Application State Layer                      │
├──────────────────────┬───────────────────────┤
│ Server State         │ Client State          │
│ (TanStack Query)     │ (Zustand)             │
└──────────┬───────────┴───────────┬───────────┘
           │                       │
     Supabase Backend        Local UI / Device State
(Auth, PostgreSQL, Storage,   (Order Cart, Printer Connection)
 Realtime, RPCs)                   │
                                   │
                         Web Bluetooth API
                                   │
                         BLE GATT ESC/POS Printer
```

---

## 2. ROUTING & ACCESS CONTROL
- **Public Route**: `/` (No auth required, brand landing, menu highlights, approved gallery, approved reviews).
- **Authentication Route**: `/login` (Only entry point; no public signup/registration).
- **Protected Admin Routes**: `/admin/dashboard`, `/admin/orders`, `/admin/orders/new`, `/admin/menu`, `/admin/analytics`, `/admin/gallery`, `/admin/discussions`, `/admin/settings`, `/admin/printer`.
- **Enforcement**: Mandatory `ProtectedRoute` wrapper checking Supabase session state before rendering any `/admin/*` sub-tree.

---

## 3. DATA & STATE MANAGEMENT BOUNDARIES
- **Server State (TanStack Query)**:
  - Orders, Menu items, Categories, Analytics, Gallery, Reviews/Discussions, Cafe Settings.
  - Queries flow: `Supabase API Module` → `TanStack Query` → `Custom Hook` → `Component`.
- **Client State (Zustand)**:
  - Temporary order cart (items, quantity adjustments, derived subtotal/tax/discount/total).
  - Printer connection state, status, device reference, print progress.
  - Local UI toggles.

---

## 4. ATOMIC ORDER CREATION & PRINTING PIPELINE
1. Admin selects items in Zustand Cart.
2. Form submit triggers `ordersApi.createOrder()` → Supabase RPC `create_order_with_items(...)`.
3. Database executes atomic transaction (`orders` row + `order_items` rows + database order number `RC-YYYYMMDD-XXXX`).
4. On RPC success:
   - Order is safely persisted in PostgreSQL.
   - TanStack Query caches for orders, dashboard, and daily analytics are invalidated.
   - Cart is cleared.
5. Printer pipeline is initiated independently:
   - `Persisted Order` → `receiptFormatter.ts` → `escpos.ts` (command byte array) → `bluetoothPrinter.ts` (chunked BLE GATT writes).
6. **Failure Rule**: If printing fails, order remains saved in database. UI displays print failure banner with **Retry / Reprint** button.

---

## 5. NON-NEGOTIABLE ARCHITECTURAL RULES
1. Supabase is the backend source of truth.
2. TanStack Query manages all server-side data.
3. Zustand manages client-side cart and printer state.
4. Database order persistence precedes printing.
5. Printer failure never cancels or deletes a saved order.
6. Order creation is atomic (`create_order_with_items` RPC) and protected against double-click/duplicate execution.
7. Web Bluetooth requires feature detection and explicit user gestures.
8. BLE writes use safe chunking to prevent MTU buffer overruns.
9. All production traffic uses HTTPS.
10. Supabase RLS is always enabled.
