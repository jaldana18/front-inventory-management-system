import { Card, CardContent, Typography, Box, Avatar } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

const StatsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  color = 'primary',
}) => {
  const colors = {
    primary: {
      bg: 'rgba(99, 102, 241, 0.08)',
      main: '#6366f1',
      gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    },
    success: {
      bg: 'rgba(16, 185, 129, 0.08)',
      main: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    },
    warning: {
      bg: 'rgba(245, 158, 11, 0.08)',
      main: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    },
    error: {
      bg: 'rgba(239, 68, 68, 0.08)',
      main: '#ef4444',
      gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    },
    info: {
      bg: 'rgba(59, 130, 246, 0.08)',
      main: '#3b82f6',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    },
  };

  const colorScheme = colors[color] || colors.primary;

  return (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            sx={{
              width: 36,
              height: 36,
              background: colorScheme.gradient,
            }}
          >
            {Icon && <Icon sx={{ fontSize: 18 }} />}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '0.7rem',
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: colorScheme.main,
                lineHeight: 1.2,
              }}
            >
              {value}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
