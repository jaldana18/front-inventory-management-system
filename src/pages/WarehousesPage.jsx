import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Chip,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Warehouse as WarehouseIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { warehouseService } from '../services/warehouse.service';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import { DeleteConfirmDialog } from '../components/common/DeleteConfirmDialog';
import WarehouseFormDialog from '../components/warehouse/WarehouseFormDialog';

export default function WarehousesPage() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [warehouseToDelete, setWarehouseToDelete] = useState(null);

  // Fetch warehouses
  const {
    data: warehousesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => warehouseService.getAll(),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data) => warehouseService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['warehouses']);
      toast.success(t('warehouseCreatedSuccessfully') || 'Almacén creado exitosamente');
      setIsFormOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || t('failedToCreateWarehouse') || 'Error al crear almacén');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => warehouseService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['warehouses']);
      toast.success(t('warehouseUpdatedSuccessfully') || 'Almacén actualizado exitosamente');
      setIsFormOpen(false);
      setSelectedWarehouse(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || t('failedToUpdateWarehouse') || 'Error al actualizar almacén');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => warehouseService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['warehouses']);
      toast.success(t('warehouseDeletedSuccessfully') || 'Almacén eliminado exitosamente');
      setIsDeleteDialogOpen(false);
      setWarehouseToDelete(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || t('failedToDeleteWarehouse') || 'Error al eliminar almacén');
    },
  });

  // Extract warehouses
  const warehouses = warehousesData?.data?.items || warehousesData?.data || [];
  const warehousesList = Array.isArray(warehouses) ? warehouses : [];

  // Filter warehouses
  const filteredWarehouses = warehousesList.filter((warehouse) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      warehouse.name?.toLowerCase().includes(search) ||
      warehouse.code?.toLowerCase().includes(search) ||
      warehouse.city?.toLowerCase().includes(search) ||
      warehouse.address?.toLowerCase().includes(search)
    );
  });

  // Stats
  const stats = {
    total: warehousesList.length,
    main: warehousesList.filter((w) => w.isMain).length,
    active: warehousesList.length, // Assuming all are active
  };

  // Handlers
  const handleAdd = () => {
    setSelectedWarehouse(null);
    setIsFormOpen(true);
  };

  const handleEdit = (warehouse) => {
    setSelectedWarehouse(warehouse);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (warehouse) => {
    setWarehouseToDelete(warehouse);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (warehouseToDelete) {
      deleteMutation.mutate(warehouseToDelete.id);
    }
  };

  const handleFormSubmit = (data) => {
    if (selectedWarehouse) {
      updateMutation.mutate({ id: selectedWarehouse.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.success(t('dataRefreshed') || 'Datos actualizados');
  };

  if (error) {
    return (
      <Alert severity="error">
        {t('errorLoadingData') || 'Error al cargar datos'}: {error.message}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 1,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t('warehouseManagement') || 'Gestión de Almacenes'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('manageWarehousesLocations') || 'Administra tus almacenes y ubicaciones'}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Tooltip title={t('refresh') || 'Actualizar'}>
            <IconButton onClick={handleRefresh} disabled={isLoading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5558e3 0%, #7c4de8 100%)',
              },
            }}
          >
            {t('addWarehouse') || 'Agregar Almacén'}
          </Button>
        </Stack>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    bgcolor: 'primary.light',
                    borderRadius: 2,
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <WarehouseIcon sx={{ color: 'primary.main', fontSize: 32 }} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {t('totalWarehouses') || 'Total de Almacenes'}
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {stats.total}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    bgcolor: 'warning.light',
                    borderRadius: 2,
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <StarIcon sx={{ color: 'warning.main', fontSize: 32 }} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {t('mainWarehouses') || 'Almacenes Principales'}
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {stats.main}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    bgcolor: 'success.light',
                    borderRadius: 2,
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <LocationIcon sx={{ color: 'success.main', fontSize: 32 }} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {t('activeLocations') || 'Ubicaciones Activas'}
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {stats.active}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          placeholder={t('searchWarehouses') || 'Buscar almacenes por nombre, código o ciudad...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Table */}
      <Paper>
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : filteredWarehouses.length === 0 ? (
          <Box p={4} textAlign="center">
            <WarehouseIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {searchTerm
                ? t('noWarehousesFound') || 'No se encontraron almacenes'
                : t('noWarehousesYet') || 'Aún no hay almacenes'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {searchTerm
                ? t('tryAdjustingSearch') || 'Intenta ajustar tu búsqueda'
                : t('startByAddingWarehouse') || 'Comienza agregando tu primer almacén'}
            </Typography>
            {!searchTerm && (
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
                {t('addWarehouse') || 'Agregar Almacén'}
              </Button>
            )}
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('code') || 'Código'}</TableCell>
                  <TableCell>{t('name') || 'Nombre'}</TableCell>
                  <TableCell>{t('location') || 'Ubicación'}</TableCell>
                  <TableCell>{t('contact') || 'Contacto'}</TableCell>
                  <TableCell>{t('manager') || 'Responsable'}</TableCell>
                  <TableCell>{t('status') || 'Estado'}</TableCell>
                  <TableCell align="center">{t('actions') || 'Acciones'}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredWarehouses.map((warehouse) => (
                  <TableRow
                    key={warehouse.id}
                    hover
                    sx={{
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" fontWeight="bold">
                          {warehouse.code}
                        </Typography>
                        {warehouse.isMain && (
                          <Tooltip title={t('mainWarehouse') || 'Almacén Principal'}>
                            <StarIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {warehouse.name}
                      </Typography>
                      {warehouse.description && (
                        <Typography variant="caption" color="text.secondary">
                          {warehouse.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="start" gap={0.5}>
                        <LocationIcon sx={{ fontSize: 16, color: 'text.secondary', mt: 0.2 }} />
                        <Box>
                          <Typography variant="body2">{warehouse.address || '—'}</Typography>
                          {warehouse.city && (
                            <Typography variant="caption" color="text.secondary">
                              {warehouse.city}
                              {warehouse.state && `, ${warehouse.state}`}
                              {warehouse.zip && ` ${warehouse.zip}`}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        {warehouse.phone && (
                          <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                            <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="caption">{warehouse.phone}</Typography>
                          </Box>
                        )}
                        {warehouse.email && (
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <EmailIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="caption">{warehouse.email}</Typography>
                          </Box>
                        )}
                        {!warehouse.phone && !warehouse.email && (
                          <Typography variant="caption" color="text.secondary">
                            —
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {warehouse.managerName ? (
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2">{warehouse.managerName}</Typography>
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          {t('notAssigned') || 'No asignado'}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={t('active') || 'Activo'}
                        color="success"
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center" gap={0.5}>
                        <Tooltip title={t('edit') || 'Editar'}>
                          <IconButton size="small" onClick={() => handleEdit(warehouse)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('delete') || 'Eliminar'}>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(warehouse)}
                            disabled={warehouse.isMain}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Form Dialog */}
      <WarehouseFormDialog
        open={isFormOpen}
        warehouse={selectedWarehouse}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedWarehouse(null);
        }}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        title={t('deleteWarehouse') || 'Eliminar Almacén'}
        message={
          warehouseToDelete
            ? `${t('confirmDeleteWarehouse') || '¿Estás seguro de eliminar el almacén'} "${warehouseToDelete.name}"?`
            : ''
        }
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setWarehouseToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        loading={deleteMutation.isPending}
      />
    </Box>
  );
}
