import { Navigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { Lock as LockIcon, Home as HomeIcon } from '@mui/icons-material';
import { useAuth } from '../context/useAuth';
import { hasRoutePermission } from '../config/roles.config';

/**
 * Route wrapper that checks role-based permissions
 * Renders children if user has permission, otherwise shows access denied
 */
export function RoleBasedRoute({ children, path }) {
  const { user, isAuthenticated } = useAuth();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has permission to access this route
  const hasPermission = hasRoutePermission(user?.role, path);

  if (!hasPermission) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          px: 3,
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: 'error.light',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
          }}
        >
          <LockIcon sx={{ fontSize: 40, color: 'error.dark' }} />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
          Acceso Denegado
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500 }}>
          No tienes permisos para acceder a esta página. Por favor contacta al administrador si
          crees que esto es un error.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<HomeIcon />}
            onClick={() => window.history.back()}
          >
            Volver
          </Button>
          <Button variant="outlined" onClick={() => (window.location.href = '/')}>
            Ir al Inicio
          </Button>
        </Box>
        <Box
          sx={{
            mt: 4,
            p: 2,
            borderRadius: 2,
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Usuario: {user?.email}
          </Typography>
          <br />
          <Typography variant="caption" color="text.secondary">
            Rol: <strong style={{ textTransform: 'capitalize' }}>{user?.role}</strong>
          </Typography>
        </Box>
      </Box>
    );
  }

  return children;
}
