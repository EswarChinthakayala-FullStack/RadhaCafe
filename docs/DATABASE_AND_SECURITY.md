# RADHACAFE — SUPABASE DATABASE, SECURITY AND DATA MODEL CONTEXT

Baseline database architecture, security policies, data model, and persistence rules for RadhaCafe.

---

## 1. ENTITY RELATIONSHIP MODEL
- `categories (1) ───< (Many) menu_items`
- `menu_items (1) ───< (Many) order_items`
- `orders (1) ───< (Many) order_items`
- Standalone Entities: `gallery_images`, `discussions`, `cafe_settings`, `printer_settings`.
- Derived Analytics View: `daily_summary` (Read-only view from completed orders).

---

## 2. CRITICAL BUSINESS RULES & DATA INTEGRITY
1. **Historical Order Snapshot Rule**:
   - `order_items.item_name` and `order_items.unit_price` preserve exact purchase-time values.
   - Changing current menu item prices will **never** mutate historical orders or historical receipts.
2. **Atomic Order RPC Creation**:
   - `create_order_with_items(p_customer_name, p_items, p_tax_amount, p_discount_amount, p_payment_method)` executes inside a single PostgreSQL transaction (`SECURITY DEFINER`).
   - Order numbers are generated database-side using sequence `order_number_seq` (`RC-YYYYMMDD-XXXX`). Client-side order number generation is prohibited.
3. **Menu Availability Rule**:
   - Items with `is_available = false` are excluded from public menus and POS item selection.
4. **Review Moderation Rule**:
   - Public review submissions default to `is_approved = false`.
   - Only approved reviews (`is_approved = true`) are visible on the public website.
5. **Daily Summary & Analytics Rule**:
   - Only `completed` orders contribute to `daily_summary` sales revenue and average order value.

---

## 3. ROW LEVEL SECURITY (RLS) & ACCESS CONTROL
- **RLS Enabled**: Mandatory on all 8 tables (`categories`, `menu_items`, `orders`, `order_items`, `cafe_settings`, `gallery_images`, `discussions`, `printer_settings`).
- **Public (Anon) Access**:
  - `categories` (Read all)
  - `menu_items` (Read `is_available = true` only)
  - `gallery_images` (Read all)
  - `cafe_settings` (Read all)
  - `discussions` (Read `is_approved = true` only; insert with `is_approved = false` default)
- **Admin (Authenticated) Access**:
  - Full CRUD write access across all tables via `auth.role() = 'authenticated'`.

---

## 4. STORAGE BUCKETS
- `menu-images`: Public read, authenticated admin write.
- `gallery-images`: Public read, authenticated admin write.
- `cafe-assets`: Public read, authenticated admin write.
- Image binaries are stored in Supabase Storage, and public URLs are referenced in database tables (`menu_items.image_url`, `gallery_images.image_url`, `cafe_settings.logo_url`). Service-role key is never exposed to the client.
