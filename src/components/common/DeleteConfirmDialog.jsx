import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';

export const DeleteConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  loading,
  title = 'Confirmar eliminación',
  message = '¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer.',
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: 'error.lighter',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <WarningIcon sx={{ color: 'error.main', fontSize: 24 }}  />
          </Box>
          <Typography variant="h6" fontWeight={600}>
            {title}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined" disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          disabled={loading}
          sx={{ minWidth: 100 }}
        >
          {loading ? 'Eliminando...' : 'Eliminar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
