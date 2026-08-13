import { Routes, Route } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

import { LandingPage } from '../pages/landing/LandingPage';
import { PublicGalleryPage } from '../pages/public/PublicGalleryPage';
import { PublicDiscussionPage } from '../pages/public/PublicDiscussionPage';
import { PublicMenuPage } from '../pages/public/PublicMenuPage';
import { PublicContactPage } from '../pages/public/PublicContactPage';
import { PublicWaterPage } from '../pages/public/PublicWaterPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { AdminLayout } from '../components/admin/layout/AdminLayout';

import { DashboardPage } from '../pages/admin/DashboardPage';
import { OrdersPage } from '../pages/admin/OrdersPage';
import { NewOrderPage } from '../pages/admin/NewOrderPage';
import { CustomersPage } from '../pages/admin/customers/CustomersPage';
import { CustomerDetailsPage } from '../pages/admin/customers/CustomerDetailsPage';
import { MenuPage } from '../pages/admin/MenuPage';
import { AnalyticsPage } from '../pages/admin/AnalyticsPage';
import { GalleryPage } from '../pages/admin/GalleryPage';
import { DiscussionPage } from '../pages/admin/DiscussionPage';
import { PrinterPage } from '../pages/admin/PrinterPage';
import { SettingsPage } from '../pages/admin/SettingsPage';
import { NotFoundPage } from '../pages/NotFoundPage';

// RadhaWater Admin Modules
import { WaterDashboardPage } from '../pages/admin/water/WaterDashboardPage';
import { NewWaterOrderPage } from '../pages/admin/water/NewWaterOrderPage';
import { WaterOrdersPage } from '../pages/admin/water/WaterOrdersPage';
import { WaterProductsPage } from '../pages/admin/water/WaterProductsPage';
import { WaterCustomersPage } from '../pages/admin/water/WaterCustomersPage';
import { WaterCustomerDetailsPage } from '../pages/admin/water/WaterCustomerDetailsPage';
import { WaterPaymentsPage } from '../pages/admin/water/WaterPaymentsPage';
import { WaterEventsPage } from '../pages/admin/water/WaterEventsPage';
import { WaterAnalyticsPage } from '../pages/admin/water/WaterAnalyticsPage';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path={ROUTES.PUBLIC.HOME} element={<LandingPage />} />
      <Route path={ROUTES.PUBLIC.GALLERY} element={<PublicGalleryPage />} />
      <Route path={ROUTES.PUBLIC.DISCUSSIONS} element={<PublicDiscussionPage />} />
      <Route path={ROUTES.PUBLIC.MENU} element={<PublicMenuPage />} />
      <Route path={ROUTES.PUBLIC.CONTACT} element={<PublicContactPage />} />
      <Route path={ROUTES.PUBLIC.WATER} element={<PublicWaterPage />} />
      <Route path={ROUTES.PUBLIC.LOGIN} element={<LoginPage />} />

      {/* Protected Admin POS Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Routes>
                {/* Cafe Admin Routes */}
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="orders/new" element={<NewOrderPage />} />
                <Route path="customers" element={<CustomersPage />} />
                <Route path="customers/:id" element={<CustomerDetailsPage />} />
                <Route path="menu" element={<MenuPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="gallery" element={<GalleryPage />} />
                <Route path="discussion" element={<DiscussionPage />} />
                <Route path="discussions" element={<DiscussionPage />} />
                <Route path="printer" element={<PrinterPage />} />
                <Route path="settings" element={<SettingsPage />} />

                {/* RadhaWater Independent Admin Routes */}
                <Route path="water" element={<WaterDashboardPage />} />
                <Route path="water/orders/new" element={<NewWaterOrderPage />} />
                <Route path="water/orders" element={<WaterOrdersPage />} />
                <Route path="water/products" element={<WaterProductsPage />} />
                <Route path="water/customers" element={<WaterCustomersPage />} />
                <Route path="water/customers/:id" element={<WaterCustomerDetailsPage />} />
                <Route path="water/payments" element={<WaterPaymentsPage />} />
                <Route path="water/events" element={<WaterEventsPage />} />
                <Route path="water/analytics" element={<WaterAnalyticsPage />} />

                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
