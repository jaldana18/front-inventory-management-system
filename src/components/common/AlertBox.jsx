import { Alert, Box, Typography, Stack, Collapse } from '@mui/material';
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
} from '@mui/icons-material';

const AlertBox = ({
  open = true,
  severity = 'info',
  title,
  message,
  onClose,
  children,
  sx = {},
}) => {
  if (!open && onClose) {
    return null;
  }

  const iconMap = {
    error: <ErrorIcon />,
    warning: <WarningIcon />,
    info: <InfoIcon />,
    success: <SuccessIcon />,
  };

  return (
    <Collapse in={open} sx={{ mb: 2, ...sx }}>
      <Alert
        severity={severity}
        icon={iconMap[severity]}
        onClose={onClose}
        sx={{
          borderRadius: 2,
          '& .MuiAlert-message': {
            width: '100%',
          },
        }}
      >
        {title && (
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {title}
          </Typography>
        )}
        {message && (
          <Typography variant="body2">
            {message}
          </Typography>
        )}
        {children && (
          <Box>
            {children}
          </Box>
        )}
      </Alert>
    </Collapse>
  );
};

export default AlertBox;
