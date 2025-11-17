import { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Stack,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  ShoppingCart as OrdersIcon,
  Assessment as ReportsIcon,
  Settings as SettingsIcon,
  People as SuppliersIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  Logout as LogoutIcon,
  ManageAccounts as ManageAccountsIcon,
  Warehouse as WarehouseIcon,
  ViewList as StockViewIcon,
} from '@mui/icons-material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { useLanguage } from '../../context/LanguageContext';
import LanguageIcon from '@mui/icons-material/Language';
import { canViewMenuItem } from '../../config/roles.config';

const drawerWidth = 260;

const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [langAnchor, setLangAnchor] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  // Create menu items with translations
  const allMenuItems = [
    { id: 'dashboard', text: t('dashboard'), icon: <DashboardIcon />, path: '/' },
    { id: 'inventory', text: t('inventory'), icon: <InventoryIcon />, path: '/inventory' },
    { id: 'stock-overview', text: t('stockOverview') || 'Stock Overview', icon: <StockViewIcon />, path: '/stock-overview' },
    { id: 'warehouses', text: t('warehouses') || 'Almacenes', icon: <WarehouseIcon />, path: '/warehouses' },
    { id: 'orders', text: t('orders'), icon: <OrdersIcon />, path: '/orders' },
    { id: 'suppliers', text: t('suppliers'), icon: <SuppliersIcon />, path: '/suppliers' },
    { id: 'reports', text: t('reports'), icon: <ReportsIcon />, path: '/reports' },
    { id: 'settings', text: t('settings'), icon: <SettingsIcon />, path: '/settings' },
    { id: 'users', text: 'Usuarios', icon: <ManageAccountsIcon />, path: '/users' },
  ];

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter((item) =>
    canViewMenuItem(user?.role, item.id)
  );

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageOpen = (event) => {
    setLangAnchor(event.currentTarget);
  };

  const handleLanguageClose = () => {
    setLangAnchor(null);
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    handleLanguageClose();
  };

  const handleLogout = () => {
    handleUserMenuClose();
    logout();
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3, pb: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: '1.25rem',
            }}
          >
            IS
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            InvenStock
          </Typography>
        </Stack>
      </Box>

      <Divider sx={{ mx: 2 }} />

      <List sx={{ px: 2, py: 2, flex: 1 }}>
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  px: 2,
                  backgroundColor: active ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                  color: active ? 'primary.main' : 'text.secondary',
                  '&:hover': {
                    backgroundColor: active
                      ? 'rgba(99, 102, 241, 0.12)'
                      : 'rgba(0, 0, 0, 0.04)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: active ? 'primary.main' : 'text.secondary',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: active ? 600 : 500,
                    fontSize: '0.9375rem',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ mx: 2 }} />

      <Box sx={{ p: 2 }}>
        <Box
          onClick={handleUserMenuOpen}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 1.5,
            borderRadius: 2,
            backgroundColor: 'rgba(0, 0, 0, 0.02)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: 'primary.main',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            {user?.firstName?.charAt(0).toUpperCase()}
            {user?.lastName?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                fontSize: '0.875rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: '0.75rem',
                textTransform: 'capitalize',
              }}
            >
              {user?.role || 'User'}
            </Typography>
          </Box>
        </Box>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleUserMenuClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
        >
          <MenuItem disabled>
            <Typography variant="caption">{user?.email}</Typography>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <LogoutIcon sx={{ mr: 1, fontSize: '1.25rem' }} />
            {t('logout')}
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh', backgroundColor: 'background.default' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: 'white',
          color: 'text.primary',
        }}
      >
        <Toolbar sx={{ py: 1, display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              edge="start"
              onClick={handleDrawerToggle}
              sx={{
                mr: 2,
                display: { sm: 'none' },
                color: 'text.primary',
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {t('inventory')}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            <IconButton
              sx={{
                color: 'text.secondary',
                '&:hover': { color: 'primary.main', backgroundColor: 'rgba(99, 102, 241, 0.08)' },
              }}
            >
              <SearchIcon />
            </IconButton>
            <IconButton
              onClick={handleLanguageOpen}
              sx={{
                color: 'text.secondary',
                '&:hover': { color: 'primary.main', backgroundColor: 'rgba(99, 102, 241, 0.08)' },
              }}
              title={language === 'es' ? 'English' : 'Español'}
            >
              <LanguageIcon />
            </IconButton>
            <Menu
              anchorEl={langAnchor}
              open={Boolean(langAnchor)}
              onClose={handleLanguageClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem
                onClick={() => handleLanguageChange('es')}
                selected={language === 'es'}
              >
                {t('spanish')}
              </MenuItem>
              <MenuItem
                onClick={() => handleLanguageChange('en')}
                selected={language === 'en'}
              >
                {t('english')}
              </MenuItem>
            </Menu>
            <IconButton
              sx={{
                color: 'text.secondary',
                '&:hover': { color: 'primary.main', backgroundColor: 'rgba(99, 102, 241, 0.08)' },
              }}
            >
              <NotificationsIcon />
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
          backgroundColor: 'background.default',
          minHeight: '100vh',
          overflow: 'auto',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
