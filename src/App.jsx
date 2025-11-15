import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { theme } from './config/theme.config';
import MainLayout from './components/layout/MainLayout';
import InventoryPage from './pages/InventoryPage';

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
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<InventoryPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route
                path="orders"
                element={
                  <div className="text-center text-gray-500 mt-10">
                    Orders page - Coming soon
                  </div>
                }
              />
              <Route
                path="suppliers"
                element={
                  <div className="text-center text-gray-500 mt-10">
                    Suppliers page - Coming soon
                  </div>
                }
              />
              <Route
                path="reports"
                element={
                  <div className="text-center text-gray-500 mt-10">
                    Reports page - Coming soon
                  </div>
                }
              />
              <Route
                path="settings"
                element={
                  <div className="text-center text-gray-500 mt-10">
                    Settings page - Coming soon
                  </div>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
