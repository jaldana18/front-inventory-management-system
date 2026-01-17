import { Box, CircularProgress, Typography, Stack } from '@mui/material';

const LoadingSpinner = ({ message = 'Cargando...' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
      }}
    >
      <Stack alignItems="center" spacing={2}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      </Stack>
    </Box>
  );
};

export default LoadingSpinner;
