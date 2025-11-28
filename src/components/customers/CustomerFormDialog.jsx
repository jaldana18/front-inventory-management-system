import { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  Switch,
  Typography,
  Box,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerSchema, customerDefaultValues, documentTypeOptions, customerTypeOptions } from '../../schemas/customer.schema';
import { useCreateCustomer, useUpdateCustomer } from '../../hooks/useCustomers';
import { useSalesStore } from '../../store/salesStore';
import { useLanguage } from '../../context/LanguageContext';

const CustomerFormDialog = () => {
  const { t } = useLanguage();
  const {
    customers: { dialogOpen, selectedCustomer },
    setCustomerDialogOpen,
  } = useSalesStore();

  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: customerDefaultValues,
  });

  const customerType = watch('customerType');
  const isEditMode = Boolean(selectedCustomer);

  useEffect(() => {
    if (dialogOpen && selectedCustomer) {
      reset(selectedCustomer);
    } else if (dialogOpen) {
      reset(customerDefaultValues);
    }
  }, [dialogOpen, selectedCustomer, reset]);

  const onSubmit = async (data) => {
    // Normalize empty strings to null for optional string fields
    const normalize = (val) => (typeof val === 'string' && val.trim() === '' ? null : val);
    const payload = {
      ...data,
      email: normalize(data.email),
      phone: normalize(data.phone),
      address: normalize(data.address),
      city: normalize(data.city),
      state: normalize(data.state),
      zipCode: normalize(data.zipCode),
      notes: normalize(data.notes),
      // Keep country as provided; if empty, send null
      country: normalize(data.country),
    };
    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({
          id: selectedCustomer.id,
          data: payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }
      handleClose();
    } catch (error) {
      console.error('Error saving customer:', error);
    }
  };

  const handleClose = () => {
    setCustomerDialogOpen(false);
    reset(customerDefaultValues);
  };

  return (
    <Dialog
      open={dialogOpen}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
          maxWidth: '890px',
        },
      }}
    >
      <DialogTitle sx={{ pb: 2, pt: 3, px: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, fontSize: '1.5rem', color: '#1a1a1a' }}>
          {isEditMode ? 'Editar Cliente' : 'Agregar Cliente'}
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5, fontSize: '0.875rem', color: '#6b7280' }}>
          {isEditMode ? 'Actualiza la información del cliente' : 'Completa la información del nuevo cliente'}
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ pt: 3, pb: 3, px: 3 }}>
          {/* Basic Information */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                mb: 1.5,
                fontSize: '1rem',
                color: '#1a1a1a'
              }}
            >
              Información Básica
            </Typography>

            <Grid container spacing={1.5}>
              <Grid item xs={12} sm={6} md={3}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      placeholder="Nombre *"
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#f9fafb',
                          '&:hover': {
                            backgroundColor: '#f3f4f6',
                          },
                          '&.Mui-focused': {
                            backgroundColor: '#fff',
                          },
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Controller
                  name="documentType"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      size="small"
                      error={!!errors.documentType}
                      helperText={errors.documentType?.message}
                      placeholder="Tipo de Documento *"
                      InputLabelProps={{ shrink: true }}
                      SelectProps={{
                        displayEmpty: true,
                        renderValue: (value) => {
                          if (!value) return <span style={{ color: '#9ca3af' }}>Tipo de Documento *</span>;
                          const option = documentTypeOptions.find(o => o.value === value);
                          return option?.label || value;
                        }
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#f9fafb',
                          '&:hover': {
                            backgroundColor: '#f3f4f6',
                          },
                          '&.Mui-focused': {
                            backgroundColor: '#fff',
                          },
                        },
                      }}
                    >
                      {documentTypeOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Controller
                  name="documentNumber"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      error={!!errors.documentNumber}
                      helperText={errors.documentNumber?.message}
                      placeholder="Número de Documento *"
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#f9fafb',
                          '&:hover': {
                            backgroundColor: '#f3f4f6',
                          },
                          '&.Mui-focused': {
                            backgroundColor: '#fff',
                          },
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Controller
                  name="customerType"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      size="small"
                      error={!!errors.customerType}
                      helperText={errors.customerType?.message}
                      placeholder="Tipo de Cliente"
                      InputLabelProps={{ shrink: true }}
                      SelectProps={{
                        displayEmpty: true,
                        renderValue: (value) => {
                          if (!value) return <span style={{ color: '#9ca3af' }}>Tipo de Cliente</span>;
                          const option = customerTypeOptions.find(o => o.value === value);
                          return option?.label || value;
                        }
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#f9fafb',
                          '&:hover': {
                            backgroundColor: '#f3f4f6',
                          },
                          '&.Mui-focused': {
                            backgroundColor: '#fff',
                          },
                        },
                      }}
                    >
                      {customerTypeOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Controller
                    name="taxResponsible"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#6366f1',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#6366f1',
                          },
                        }}
                      />
                    )}
                  />
                  <Typography variant="body2" sx={{ fontSize: '0.875rem', color: '#374151' }}>
                    Responsable de IVA
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Contact Information */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                mb: 1.5,
                fontSize: '1rem',
                color: '#1a1a1a'
              }}
            >
              Información de Contacto
            </Typography>

            <Grid container spacing={1.5}>
              <Grid item xs={12} sm={4}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="email"
                      fullWidth
                      size="small"
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      placeholder="Correo electrónico"
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#f9fafb',
                          '&:hover': {
                            backgroundColor: '#f3f4f6',
                          },
                          '&.Mui-focused': {
                            backgroundColor: '#fff',
                          },
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      error={!!errors.phone}
                      helperText={errors.phone?.message}
                      placeholder="Teléfono"
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#f9fafb',
                          '&:hover': {
                            backgroundColor: '#f3f4f6',
                          },
                          '&.Mui-focused': {
                            backgroundColor: '#fff',
                          },
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      error={!!errors.address}
                      helperText={errors.address?.message}
                      placeholder="Dirección"
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#f9fafb',
                          '&:hover': {
                            backgroundColor: '#f3f4f6',
                          },
                          '&.Mui-focused': {
                            backgroundColor: '#fff',
                          },
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Controller
                  name="city"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      error={!!errors.city}
                      helperText={errors.city?.message}
                      placeholder="Ciudad"
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#f9fafb',
                          '&:hover': {
                            backgroundColor: '#f3f4f6',
                          },
                          '&.Mui-focused': {
                            backgroundColor: '#fff',
                          },
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Controller
                  name="state"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      error={!!errors.state}
                      helperText={errors.state?.message}
                      placeholder="Estado/Provincia"
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#f9fafb',
                          '&:hover': {
                            backgroundColor: '#f3f4f6',
                          },
                          '&.Mui-focused': {
                            backgroundColor: '#fff',
                          },
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Controller
                  name="country"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      error={!!errors.country}
                      helperText={errors.country?.message}
                      placeholder="País"
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#f9fafb',
                          '&:hover': {
                            backgroundColor: '#f3f4f6',
                          },
                          '&.Mui-focused': {
                            backgroundColor: '#fff',
                          },
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="zipCode"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      error={!!errors.zipCode}
                      helperText={errors.zipCode?.message}
                      placeholder="Código Postal"
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#f9fafb',
                          '&:hover': {
                            backgroundColor: '#f3f4f6',
                          },
                          '&.Mui-focused': {
                            backgroundColor: '#fff',
                          },
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="creditLimit"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      fullWidth
                      size="small"
                      error={!!errors.creditLimit}
                      helperText={errors.creditLimit?.message}
                      placeholder="Límite de Crédito"
                      InputLabelProps={{ shrink: true }}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#f9fafb',
                          '&:hover': {
                            backgroundColor: '#f3f4f6',
                          },
                          '&.Mui-focused': {
                            backgroundColor: '#fff',
                          },
                        },
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Additional Information */}
          <Box>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                mb: 1.5,
                fontSize: '1rem',
                color: '#1a1a1a'
              }}
            >
              Información Adicional
            </Typography>

            <Grid container spacing={1.5} alignItems="flex-start">
              <Grid item xs={12} sm={9.5}>
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      multiline
                      rows={4}
                      fullWidth
                      size="small"
                      error={!!errors.notes}
                      helperText={errors.notes?.message}
                      placeholder="Notas"
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#f9fafb',
                          '&:hover': {
                            backgroundColor: '#f3f4f6',
                          },
                          '&.Mui-focused': {
                            backgroundColor: '#fff',
                          },
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={2.5} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', pt: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Controller
                    name="isActive"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#6366f1',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#6366f1',
                          },
                        }}
                      />
                    )}
                  />
                  <Typography variant="body2" sx={{ fontSize: '0.875rem', color: '#374151' }}>
                    Activo
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 3, gap: 2, borderTop: '1px solid #f3f4f6' }}>
          <Button
            onClick={handleClose}
            disabled={isSubmitting}
            sx={{
              textTransform: 'none',
              color: '#6b7280',
              fontWeight: 500,
              fontSize: '0.9375rem',
              px: 3,
              py: 1,
              '&:hover': {
                backgroundColor: '#f9fafb',
              },
            }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.9375rem',
              px: 4,
              py: 1,
              backgroundColor: '#6366f1',
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: '#4f46e5',
                boxShadow: 'none',
              },
              '&:disabled': {
                backgroundColor: '#c7d2fe',
                color: '#fff',
              },
            }}
          >
            {isSubmitting ? 'Guardando...' : isEditMode ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CustomerFormDialog;
