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
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '120px',
          height: '120px',
          background: colorScheme.bg,
          borderRadius: '0 0 0 100%',
        }}
      />

      <CardContent sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}
          >
            {title}
          </Typography>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              background: colorScheme.gradient,
              boxShadow: `0 4px 12px ${colorScheme.main}40`,
            }}
          >
            {Icon && <Icon sx={{ fontSize: 24 }} />}
          </Avatar>
        </Box>

        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            mb: 0.5,
            background: colorScheme.gradient,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {value}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}

          {trendValue && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1,
                py: 0.25,
                borderRadius: 1,
                bgcolor: trend === 'up' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                color: trend === 'up' ? '#10b981' : '#ef4444',
              }}
            >
              {trend === 'up' ? (
                <TrendingUp fontSize="small" />
              ) : (
                <TrendingDown fontSize="small" />
              )}
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {trendValue}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
