import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControlLabel,
  Checkbox,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import { useLanguage } from '../../context/LanguageContext';

export default function WarehouseFormDialog({ open, warehouse, onClose, onSubmit, isLoading }) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    phone: '',
    email: '',
    managerName: '',
    isMain: false,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (warehouse) {
      setFormData({
        code: warehouse.code || '',
        name: warehouse.name || '',
        description: warehouse.description || '',
        address: warehouse.address || '',
        city: warehouse.city || '',
        state: warehouse.state || '',
        zip: warehouse.zip || '',
        country: warehouse.country || '',
        phone: warehouse.phone || '',
        email: warehouse.email || '',
        managerName: warehouse.managerName || '',
        isMain: warehouse.isMain || false,
      });
    } else {
      setFormData({
        code: '',
        name: '',
        description: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        phone: '',
        email: '',
        managerName: '',
        isMain: false,
      });
    }
    setErrors({});
  }, [warehouse, open]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.code.trim()) {
      newErrors.code = t('codeRequired') || 'El código es requerido';
    }

    if (!formData.name.trim()) {
      newErrors.name = t('nameRequired') || 'El nombre es requerido';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('invalidEmail') || 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // Remove empty strings and convert to appropriate types
      const cleanedData = Object.entries(formData).reduce((acc, [key, value]) => {
        if (typeof value === 'string' && value.trim() === '') {
          return acc;
        }
        acc[key] = value;
        return acc;
      }, {});

      onSubmit(cleanedData);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {warehouse
            ? t('editWarehouse') || 'Editar Almacén'
            : t('addWarehouse') || 'Agregar Almacén'}
        </DialogTitle>

        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {/* Basic Information */}
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t('basicInformation') || 'Información Básica'}
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label={t('code') || 'Código'}
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  error={!!errors.code}
                  helperText={errors.code}
                  required
                  autoFocus
                  placeholder="WH-001"
                />
              </Grid>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label={t('name') || 'Nombre'}
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                  placeholder={t('warehouseNamePlaceholder') || 'Almacén Central'}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('description') || 'Descripción'}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={2}
                  placeholder={t('warehouseDescriptionPlaceholder') || 'Descripción del almacén...'}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* Location Information */}
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t('locationInformation') || 'Información de Ubicación'}
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('address') || 'Dirección'}
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder={t('addressPlaceholder') || 'Calle Principal 123'}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('city') || 'Ciudad'}
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder={t('cityPlaceholder') || 'Ciudad'}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('state') || 'Estado/Provincia'}
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder={t('statePlaceholder') || 'Estado'}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('zipCode') || 'Código Postal'}
                  name="zip"
                  value={formData.zip}
                  onChange={handleChange}
                  placeholder="12345"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('country') || 'País'}
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder={t('countryPlaceholder') || 'País'}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* Contact Information */}
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t('contactInformation') || 'Información de Contacto'}
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('phone') || 'Teléfono'}
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 234 567 8900"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('email') || 'Email'}
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  placeholder="almacen@empresa.com"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('manager') || 'Responsable'}
                  name="managerName"
                  value={formData.managerName}
                  onChange={handleChange}
                  placeholder={t('managerNamePlaceholder') || 'Nombre del responsable'}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* Settings */}
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t('settings') || 'Configuración'}
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  name="isMain"
                  checked={formData.isMain}
                  onChange={handleChange}
                />
              }
              label={
                <Box>
                  <Typography variant="body2">
                    {t('mainWarehouse') || 'Almacén Principal'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('mainWarehouseDescription') || 'Marca este almacén como principal'}
                  </Typography>
                </Box>
              }
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={isLoading}>
            {t('cancel') || 'Cancelar'}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5558e3 0%, #7c4de8 100%)',
              },
            }}
          >
            {isLoading
              ? t('saving') || 'Guardando...'
              : warehouse
              ? t('update') || 'Actualizar'
              : t('create') || 'Crear'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
