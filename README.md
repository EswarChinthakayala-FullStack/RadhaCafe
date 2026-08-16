# ☕ RadhaCafe — Modern POS & Cafe Management System

> A state-of-the-art Point of Sale (POS), Operations, and Customer Engagement platform built for modern cafes and restaurants.

---

## 🌟 Features

### 🛒 Point of Sale & Order Management
- **Interactive POS System**: Quick menu item selection, category filtering, search, and real-time cart calculation.
- **Order History & Tracking**: Manage pending, in-progress, completed, and cancelled orders with status indicators.
- **Tax & Currency Configuration**: Customizable sales tax rates and operating currency settings.

### 📜 Menu & Category Management
- **Dynamic Menu Catalog**: Create, edit, and organize menu items with rich descriptions, pricing, and availability tags.
- **Category Organization**: Reorder, add, or toggle food & beverage categories effortlessly.

### 💬 Community & Discussion Moderation
- **Customer Reviews**: Interactive customer review & feedback hub.
- **Admin Moderation**: Approve, highlight, or hide discussions and reviews with standardized height & filter controls.

### 🖨️ Thermal Printer Support
- **Bluetooth ESC/POS Integration**: Connect directly to wireless thermal receipt printers.
- **Customizable Printer Settings**: Paper size options, auto-cut configurations, and connection status monitoring.

### 📊 Analytics & Reporting
- **Revenue & Sales Insights**: Real-time sales analytics, top-selling items, and daily performance metrics.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling & UI Components**: Tailwind CSS, ShadCN UI, Radix Primitives
- **Iconography**: HugeIcons React
- **State & Router**: React Router v7
- **Backend & Database**: Supabase (PostgreSQL, Auth, Realtime)
- **Receipt Printing**: Web Bluetooth ESC/POS API

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **yarn** or **pnpm**

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/EswarChinthakayala-FullStack/RadhaCafe.git
   cd RadhaCafe
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

5. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 📝 Changelog Commit Guidelines

RadhaCafe automatically generates a polished, human-readable release timeline for the admin at `/admin/changelog` from the project's Git commit history.

### Commit Format

Use Conventional Commits for all user-facing changes:

```
feat(scope): meaningful feature subject
fix(scope): clear bugfix description
```

### Optional Commit Body Metadata

For enhanced changelog clarity, you can provide metadata in the commit body:

```
feat(printer): improve connection lifecycle

changelog-title: Reliable Bluetooth Printer Auto-Connect
changelog-description: RadhaCafe now keeps the saved thermal printer connected and recovers automatically from interruptions.
changelog-area: Printer
changelog-group: printer-reliability
```

- `[skip-changelog]`: Excludes an internal commit from the visible release notes.
- `[changelog]`: Forces inclusion of a refactoring/performance commit.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
