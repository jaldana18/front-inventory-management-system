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
import InvoicingPage from './pages/InvoicingPage';
import CustomersPage from './pages/CustomersPage';
import SalesPage from './pages/SalesPage';
import AuditLogsPage from './pages/AuditLogsPage';
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
                    path="sales"
                    element={
                      <RoleBasedRoute path="/sales">
                        <SalesPage />
                      </RoleBasedRoute>
                    }
                  />
                  <Route
                    path="customers"
                    element={
                      <RoleBasedRoute path="/customers">
                        <CustomersPage />
                      </RoleBasedRoute>
                    }
                  />
                  <Route
                    path="invoicing"
                    element={<Navigate to="/sales?tab=invoice" replace />}
                  />
                  <Route
                    path="orders"
                    element={<Navigate to="/sales?tab=quote" replace />}
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
                  <Route
                    path="audit-logs"
                    element={
                      <RoleBasedRoute path="/audit-logs">
                        <AuditLogsPage />
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
