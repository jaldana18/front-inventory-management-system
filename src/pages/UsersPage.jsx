import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/user.service';
import toast from 'react-hot-toast';
import { DataTable } from '../components/common/DataTable';
import { UserFormDialog } from '../components/users/UserFormDialog';
import { DeleteConfirmDialog } from '../components/common/DeleteConfirmDialog';
import { format } from 'date-fns';

const UsersPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');

  // Dialog states
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Build query params
  const queryParams = {
    page,
    limit,
    ...(search && { search }),
    ...(roleFilter !== 'all' && { role: roleFilter }),
    ...(statusFilter !== 'all' && { isActive: statusFilter === 'active' }),
    sortBy,
    sortOrder,
  };

  // Fetch users
  const { data, isLoading, error } = useQuery({
    queryKey: ['users', queryParams],
    queryFn: () => userService.getAll(queryParams),
    keepPreviousData: true,
  });

  // Fetch user stats
  const { data: statsData } = useQuery({
    queryKey: ['users-stats'],
    queryFn: () => userService.getStats(),
  });

  // Create user mutation
  const createMutation = useMutation({
    mutationFn: (userData) => userService.create(userData),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      queryClient.invalidateQueries(['users-stats']);
      toast.success('Usuario creado exitosamente');
      setOpenFormDialog(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Error al crear usuario');
    },
  });

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => userService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      queryClient.invalidateQueries(['users-stats']);
      toast.success('Usuario actualizado exitosamente');
      setOpenFormDialog(false);
      setSelectedUser(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Error al actualizar usuario');
    },
  });

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: (userId) => userService.delete(userId),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      queryClient.invalidateQueries(['users-stats']);
      toast.success('Usuario eliminado exitosamente');
      setOpenDeleteDialog(false);
      setSelectedUser(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Error al eliminar usuario');
    },
  });

  // Handlers
  const handleCreateUser = () => {
    setIsEditMode(false);
    setSelectedUser(null);
    setOpenFormDialog(true);
  };

  const handleEditUser = (user) => {
    setIsEditMode(true);
    setSelectedUser(user);
    setOpenFormDialog(true);
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setOpenDeleteDialog(true);
  };

  const handleFormSubmit = (formData) => {
    if (isEditMode && selectedUser) {
      updateMutation.mutate({ id: selectedUser.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleConfirmDelete = () => {
    if (selectedUser) {
      deleteMutation.mutate(selectedUser.id);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value);
    setPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  // Table columns
  const columns = [
    {
      id: 'user',
      label: 'Usuario',
      render: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              width: 40,
              height: 40,
              fontSize: '0.875rem',
            }}
          >
            {row.firstName?.charAt(0).toUpperCase()}
            {row.lastName?.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              {row.firstName} {row.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.email}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'role',
      label: 'Rol',
      render: (row) => {
        const roleConfig = {
          admin: { label: 'Administrador', color: 'error' },
          manager: { label: 'Gerente', color: 'warning' },
          user: { label: 'Usuario', color: 'info' },
        };
        const config = roleConfig[row.role] || { label: row.role, color: 'default' };
        return (
          <Chip
            label={config.label}
            color={config.color}
            size="small"
            sx={{ textTransform: 'capitalize', fontWeight: 500 }}
          />
        );
      },
    },
    {
      id: 'company',
      label: 'Empresa',
      render: (row) => (
        <Typography variant="body2">{row.company?.name || '-'}</Typography>
      ),
    },
    {
      id: 'status',
      label: 'Estado',
      render: (row) => (
        <Chip
          label={row.isActive ? 'Activo' : 'Inactivo'}
          color={row.isActive ? 'success' : 'default'}
          size="small"
          variant={row.isActive ? 'filled' : 'outlined'}
        />
      ),
    },
    {
      id: 'lastLogin',
      label: 'Último acceso',
      render: (row) => (
        <Typography variant="body2" color="text.secondary">
          {row.lastLogin ? format(new Date(row.lastLogin), 'dd/MM/yyyy HH:mm') : 'Nunca'}
        </Typography>
      ),
    },
    {
      id: 'createdAt',
      label: 'Fecha de creación',
      render: (row) => (
        <Typography variant="body2" color="text.secondary">
          {format(new Date(row.createdAt), 'dd/MM/yyyy')}
        </Typography>
      ),
    },
    {
      id: 'actions',
      label: 'Acciones',
      align: 'right',
      render: (row) => (
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
          <Tooltip title="Editar">
            <IconButton
              size="small"
              onClick={() => handleEditUser(row)}
              sx={{
                color: 'primary.main',
                '&:hover': { bgcolor: 'primary.lighter' },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar">
            <IconButton
              size="small"
              onClick={() => handleDeleteUser(row)}
              sx={{
                color: 'error.main',
                '&:hover': { bgcolor: 'error.lighter' },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // El interceptor de axios ya retorna response.data
  // La estructura es: { success: true, data: { items: [...], pagination: {...} } }
  const users = Array.isArray(data?.data?.items) ? data.data.items : [];
  const pagination = data?.data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Gestión de Usuarios
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Administra los usuarios del sistema
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={handleCreateUser}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
              fontWeight: 600,
            }}
          >
            Nuevo Usuario
          </Button>
        </Stack>

        {/* Stats */}
        {statsData && (
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Paper
              sx={{
                p: 2.5,
                flex: 1,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
              }}
            >
              <Typography variant="h4" fontWeight={700}>
                {statsData.data?.total || 0}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Total de usuarios
              </Typography>
            </Paper>
            <Paper
              sx={{
                p: 2.5,
                flex: 1,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
              }}
            >
              <Typography variant="h4" fontWeight={700}>
                {statsData.data?.active || 0}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Usuarios activos
              </Typography>
            </Paper>
            <Paper
              sx={{
                p: 2.5,
                flex: 1,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
              }}
            >
              <Typography variant="h4" fontWeight={700}>
                {statsData.data?.admins || 0}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Administradores
              </Typography>
            </Paper>
          </Stack>
        )}
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={handleSearchChange}
            size="small"
            sx={{ flex: 1, minWidth: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Rol</InputLabel>
            <Select value={roleFilter} onChange={handleRoleFilterChange} label="Rol">
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="admin">Administrador</MenuItem>
              <MenuItem value="manager">Gerente</MenuItem>
              <MenuItem value="user">Usuario</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Estado</InputLabel>
            <Select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              label="Estado"
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="active">Activos</MenuItem>
              <MenuItem value="inactive">Inactivos</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* Table */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <DataTable
          columns={columns}
          data={users}
          loading={isLoading}
          pagination={{
            page: pagination.page,
            limit: pagination.limit,
            total: pagination.total,
            totalPages: pagination.totalPages,
            onPageChange: setPage,
            onLimitChange: setLimit,
          }}
          emptyMessage="No se encontraron usuarios"
        />
      </Paper>

      {/* Form Dialog */}
      <UserFormDialog
        open={openFormDialog}
        onClose={() => {
          setOpenFormDialog(false);
          setSelectedUser(null);
          setIsEditMode(false);
        }}
        onSubmit={handleFormSubmit}
        user={selectedUser}
        isEditMode={isEditMode}
        loading={createMutation.isLoading || updateMutation.isLoading}
      />

      {/* Delete Dialog */}
      <DeleteConfirmDialog
        open={openDeleteDialog}
        onClose={() => {
          setOpenDeleteDialog(false);
          setSelectedUser(null);
        }}
        onConfirm={handleConfirmDelete}
        loading={deleteMutation.isLoading}
        title="Eliminar Usuario"
        message={`¿Estás seguro de que deseas eliminar al usuario ${selectedUser?.firstName} ${selectedUser?.lastName}? Esta acción no se puede deshacer.`}
      />
    </Box>
  );
};

export default UsersPage;
