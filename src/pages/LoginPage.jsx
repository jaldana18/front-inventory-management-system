import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Stack,
  Divider,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Email as EmailIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/useAuth';
import { useLanguage } from '../context/LanguageContext';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().default(false),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      
      const response = await login(data.email, data.password);
      
      toast.success(`${t('welcomeBack')}, ${response.user.firstName}!`);
      
      // Store user info if rememberMe is checked
      if (data.rememberMe) {
        localStorage.setItem('rememberMe', JSON.stringify({
          email: data.email,
        }));
      }
      
      navigate('/inventory');
    } catch (err) {
      console.error('Login error:', err);
      
      let errorMessage = t('loginFailed');
      
      // Check if it's a 401 (Unauthorized) error
      if (err.response?.status === 401) {
        errorMessage = t('invalidCredentials');
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error?.message) {
        errorMessage = err.response.data.error.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast.error(errorMessage, {
        position: 'bottom-center',
        duration: 5000, // Mostrar por 5 segundos
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 2,
            border: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
          }}
        >
          {/* Logo Section */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 700,
                fontSize: '1.75rem',
                mx: 'auto',
                mb: 2,
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
              }}
            >
              IS
            </Box>
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
              InvenStock
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#64748b',
                mb: 3,
              }}
            >
              {t('inventoryManagementSystem')}
            </Typography>
          </Box>

          <Divider sx={{ mb: 4 }} />

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
              {/* Email Field */}
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    color: '#1e293b',
                  }}
                >
                  {t('emailAddress')}
                </Typography>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="email"
                      placeholder="you@example.com"
                      disabled={isLoading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon
                              sx={{
                                color: '#64748b',
                                fontSize: '1.25rem',
                              }}
                            />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1.5,
                        },
                        '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                          borderColor: '#6366f1',
                        },
                      }}
                      error={!!errors.email}
                      helperText={errors.email?.message}
                    />
                  )}
                />
              </Box>

              {/* Password Field */}
              <Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      color: '#1e293b',
                    }}
                  >
                    {t('password')}
                  </Typography>
                  <Typography
                    component="a"
                    href="#forgot"
                    sx={{
                      fontSize: '0.875rem',
                      color: '#6366f1',
                      textDecoration: 'none',
                      fontWeight: 500,
                      '&:hover': {
                        textDecoration: 'underline',
                        color: '#4f46e5',
                      },
                    }}
                  >
                    {t('forgotPassword')}
                  </Typography>
                </Box>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      disabled={isLoading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon
                              sx={{
                                color: '#64748b',
                                fontSize: '1.25rem',
                              }}
                            />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={handleTogglePassword}
                              edge="end"
                              sx={{
                                color: '#64748b',
                              }}
                              disabled={isLoading}
                            >
                              {showPassword ? (
                                <VisibilityOffIcon />
                              ) : (
                                <VisibilityIcon />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1.5,
                        },
                        '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                          borderColor: '#6366f1',
                        },
                      }}
                      error={!!errors.password}
                      helperText={errors.password?.message}
                    />
                  )}
                />
              </Box>

              {/* Remember Me Checkbox */}
              <Controller
                name="rememberMe"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...field}
                        disabled={isLoading}
                        sx={{
                          color: '#cbd5e1',
                          '&.Mui-checked': {
                            color: '#6366f1',
                          },
                        }}
                      />
                    }
                    label={
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#64748b',
                        }}
                      >
                        {t('rememberMe')}
                      </Typography>
                    }
                  />
                )}
              />

              {/* Login Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                sx={{
                  py: 1.5,
                  borderRadius: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)',
                    transform: 'translateY(-2px)',
                  },
                  '&:disabled': {
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {isLoading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} color="inherit" />
                    <span>{t('loginButton')}...</span>
                  </Box>
                ) : (
                  t('loginButton')
                )}
              </Button>

             
            </Stack>
          </form>

          {/* Footer */}
          <Divider sx={{ my: 3 }} />
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              textAlign: 'center',
              color: '#94a3b8',
            }}
          >
            © 2025 InvenStock. All rights reserved.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
