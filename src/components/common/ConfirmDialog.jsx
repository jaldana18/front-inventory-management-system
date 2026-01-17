import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';
import { useLanguage } from '../../context/LanguageContext';

const ConfirmDialog = ({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  isLoading = false,
  color = 'primary',
}) => {
  const { t } = useLanguage();

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 600 }}>
        {title}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={onCancel}
          variant="outlined"
          color="inherit"
          disabled={isLoading}
          sx={{
            borderColor: 'divider',
            color: 'text.secondary',
            '&:hover': {
              borderColor: 'text.secondary',
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          {t('cancel')}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={color}
          disabled={isLoading}
          sx={{
            px: 3,
            boxShadow: `0 4px 12px rgba(99, 102, 241, 0.25)`,
            '&:hover': {
              boxShadow: `0 6px 16px rgba(99, 102, 241, 0.35)`,
            },
          }}
        >
          {t('delete')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
