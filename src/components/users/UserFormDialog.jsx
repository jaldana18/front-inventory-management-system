import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  IconButton,
  Stack,
  InputAdornment,
  FormControlLabel,
  Switch,
  Typography,
} from '@mui/material';
import { Close as CloseIcon, Visibility, VisibilityOff } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';

export const UserFormDialog = ({ open, onClose, onSubmit, user, isEditMode, loading }) => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: 'user',
      isActive: true,
    },
  });

  useEffect(() => {
    if (user && isEditMode) {
      reset({
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        role: user.role || 'user',
        isActive: user.isActive !== undefined ? user.isActive : true,
      });
    } else {
      reset({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'user',
        isActive: true,
      });
    }
  }, [user, isEditMode, reset, open]);

  const handleFormSubmit = (data) => {
    // En modo edición, no enviamos password si está vacío
    if (isEditMode) {
      const { password, ...updateData } = data;
      onSubmit(updateData);
    } else {
      onSubmit(data);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          {isEditMode ? 'Editar Usuario' : 'Nuevo Usuario'}
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent dividers>
          <Stack spacing={3}>
            {/* Email */}
            <Controller
              name="email"
              control={control}
              rules={{
                required: 'El email es requerido',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email inválido',
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email"
                  type="email"
                  fullWidth
                  required
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  placeholder="usuario@empresa.com"
                />
              )}
            />

            {/* Password - Solo en modo creación */}
            {!isEditMode && (
              <Controller
                name="password"
                control={control}
                rules={{
                  required: 'La contraseña es requerida',
                  minLength: {
                    value: 8,
                    message: 'La contraseña debe tener al menos 8 caracteres',
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                    message:
                      'Debe contener al menos una mayúscula, una minúscula y un número',
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Contraseña"
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    required
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    placeholder="Mínimo 8 caracteres"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            size="small"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            )}

            <Stack direction="row" spacing={2}>
              {/* First Name */}
              <Controller
                name="firstName"
                control={control}
                rules={{ required: 'El nombre es requerido' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nombre"
                    fullWidth
                    required
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                    placeholder="Juan"
                  />
                )}
              />

              {/* Last Name */}
              <Controller
                name="lastName"
                control={control}
                rules={{ required: 'El apellido es requerido' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Apellido"
                    fullWidth
                    required
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                    placeholder="Pérez"
                  />
                )}
              />
            </Stack>

            {/* Role */}
            <Controller
              name="role"
              control={control}
              rules={{ required: 'El rol es requerido' }}
              render={({ field }) => (
                <FormControl fullWidth required error={!!errors.role}>
                  <InputLabel>Rol</InputLabel>
                  <Select {...field} label="Rol">
                    <MenuItem value="admin">Administrador</MenuItem>
                    <MenuItem value="manager">Gerente</MenuItem>
                    <MenuItem value="user">Usuario</MenuItem>
                  </Select>
                  {errors.role && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                      {errors.role.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />

            {/* Active Status - Solo en modo edición */}
            {isEditMode && (
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        {...field}
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          Usuario Activo
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Los usuarios inactivos no pueden iniciar sesión
                        </Typography>
                      </Box>
                    }
                  />
                )}
              />
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} variant="outlined" disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ minWidth: 100 }}
          >
            {loading ? 'Guardando...' : isEditMode ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
