import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardPage from './pages/DashboardPage';
import DashboardLayout from './components/Layout/DashboardLayout';

import InventoryPage from './pages/InventoryPage';
import MarketplacePage from './pages/MarketplacePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import ProfilePage from './pages/ProfilePage';
import AnalyticsPage from './pages/AnalyticsPage';
import LivestockPage from './pages/LivestockPage';
import WastePage from './pages/WastePage';
import ProductionPage from './pages/ProductionPage';
import NotificationsPage from './pages/NotificationsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminSystemPage from './pages/AdminSystemPage';

import MilkProductionPage from './pages/MilkProductionPage';
import BreedingPage from './pages/BreedingPage';
import HealthPage from './pages/HealthPage';
import FeedPage from './pages/FeedPage';
import WorkforcePage from './pages/WorkforcePage';
import FinancePage from './pages/FinancePage';
import ReportsPage from './pages/ReportsPage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/livestock" element={<LivestockPage />} />
            <Route path="/waste" element={<WastePage />} />
            <Route path="/production" element={<ProductionPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/system" element={<AdminSystemPage />} />
            
            <Route path="/gaushala/animals" element={<LivestockPage />} />
            <Route path="/gaushala/milk" element={<MilkProductionPage />} />
            <Route path="/gaushala/breeding" element={<BreedingPage />} />
            <Route path="/gaushala/health" element={<HealthPage />} />
            <Route path="/gaushala/feed" element={<FeedPage />} />
            <Route path="/gaushala/workforce" element={<WorkforcePage />} />
            <Route path="/gaushala/finance" element={<FinancePage />} />
            <Route path="/gaushala/reports" element={<ReportsPage />} />
            {/* Add more protected routes here */}
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
