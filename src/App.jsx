import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { theme } from './config/theme.config';
import MainLayout from './components/layout/MainLayout';
import DashboardPage from './pages/DashboardPage';
import InventoryPage from './pages/InventoryPage';
import ReportsPage from './pages/ReportsPage';
import LoginPage from './pages/LoginPage';
import UsersPage from './pages/UsersPage';
import StockOverviewPage from './pages/StockOverviewPage';
import WarehousesPage from './pages/WarehousesPage';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleBasedRoute } from './components/RoleBasedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LanguageProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <MainLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route
                    index
                    element={
                      <RoleBasedRoute path="/">
                        <DashboardPage />
                      </RoleBasedRoute>
                    }
                  />
                  <Route
                    path="inventory"
                    element={
                      <RoleBasedRoute path="/inventory">
                        <InventoryPage />
                      </RoleBasedRoute>
                    }
                  />
                  <Route
                    path="stock-overview"
                    element={
                      <RoleBasedRoute path="/stock-overview">
                        <StockOverviewPage />
                      </RoleBasedRoute>
                    }
                  />
                  <Route
                    path="warehouses"
                    element={
                      <RoleBasedRoute path="/warehouses">
                        <WarehousesPage />
                      </RoleBasedRoute>
                    }
                  />
                  <Route
                    path="reports"
                    element={
                      <RoleBasedRoute path="/reports">
                        <ReportsPage />
                      </RoleBasedRoute>
                    }
                  />
                  <Route
                    path="orders"
                    element={
                      <RoleBasedRoute path="/orders">
                        <div className="text-center text-gray-500 mt-10">
                          Página de órdenes/facturas - Próximamente
                        </div>
                      </RoleBasedRoute>
                    }
                  />
                  <Route
                    path="suppliers"
                    element={
                      <RoleBasedRoute path="/suppliers">
                        <div className="text-center text-gray-500 mt-10">
                          Página de proveedores - Próximamente
                        </div>
                      </RoleBasedRoute>
                    }
                  />
                  <Route
                    path="settings"
                    element={
                      <RoleBasedRoute path="/settings">
                        <div className="text-center text-gray-500 mt-10">
                          Página de configuración - Próximamente
                        </div>
                      </RoleBasedRoute>
                    }
                  />
                  <Route
                    path="users"
                    element={
                      <RoleBasedRoute path="/users">
                        <UsersPage />
                      </RoleBasedRoute>
                    }
                  />
                </Route>
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </LanguageProvider>
        <Toaster position="bottom-center" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
