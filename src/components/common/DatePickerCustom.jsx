import { useState } from 'react';
import {
  Box,
  TextField,
  Popover,
  Paper,
  IconButton,
  Typography,
  Grid,
  Button,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Close as CloseIcon,
  Today as TodayIcon,
} from '@mui/icons-material';
import {
  format,
  parse,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  subMonths,
  addMonths,
  isToday as checkIsToday,
} from 'date-fns';
import { es } from 'date-fns/locale';

const DatePickerCustom = ({ label, value, onChange, maxDate = null, minDate = null, size = 'small' }) => {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (value) {
      try {
        return parse(value, 'yyyy-MM-dd', new Date());
      } catch {
        return new Date();
      }
    }
    return new Date();
  });

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setAnchorEl(null);
  };

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const getDaysInMonth = () => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    const days = [];
    let current = new Date(start);

    while (current <= end) {
      days.push(new Date(current));
      current = addDays(current, 1);
    }
    return days;
  };

  const handleDateSelect = (date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    onChange({ target: { value: formattedDate } });
    handleClose();
  };

  const isDateDisabled = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    if (minDate && dateStr < minDate) return true;
    if (maxDate && dateStr > maxDate) return true;
    return false;
  };

  const days = getDaysInMonth();
  const weekDays = ['DO', 'LU', 'MA', 'MI', 'JU', 'VI', 'SA'];

  return (
    <Box>
      <TextField
        label={label}
        type="text"
        value={value}
        onClick={handleOpen}
        readOnly
        fullWidth
        size={size}
        InputLabelProps={{ shrink: true }}
        InputProps={{
          endAdornment: (
            <IconButton
              size="small"
              onClick={handleOpen}
              sx={{
                cursor: 'pointer',
                '&:hover': { backgroundColor: 'rgba(99, 102, 241, 0.1)' },
              }}
            >
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 0.5,
                  border: '2px solid #6366f1',
                  fontSize: '12px',
                }}
              >
                📅
              </Box>
            </IconButton>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            backgroundColor: '#f8fafc',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: '#f1f5f9',
              borderColor: '#6366f1',
            },
            '&.Mui-focused': {
              backgroundColor: '#ffffff',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
            },
          },
          cursor: 'pointer',
        }}
      />

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Paper
          sx={{
            p: 2,
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            minWidth: 280,
          }}
        >
          {/* Header with month navigation */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2,
            }}
          >
            <IconButton size="small" onClick={handlePrevMonth}>
              <ChevronLeftIcon />
            </IconButton>
            <Typography
              sx={{
                fontSize: '14px',
                fontWeight: 600,
                textTransform: 'capitalize',
                flex: 1,
                textAlign: 'center',
              }}
            >
              {format(currentMonth, 'MMMM yyyy')}
            </Typography>
            <IconButton size="small" onClick={handleNextMonth}>
              <ChevronRightIcon />
            </IconButton>
            <IconButton size="small" onClick={handleClose}>
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          {/* Weekdays header */}
          <Grid container spacing={0.5} sx={{ mb: 1 }}>
            {weekDays.map((day) => (
              <Grid item xs={12 / 7} key={day}>
                <Typography
                  sx={{
                    textAlign: 'center',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#64748b',
                    py: 0.5,
                  }}
                >
                  {day}
                </Typography>
              </Grid>
            ))}
          </Grid>

          {/* Calendar days */}
          <Grid container spacing={0.5}>
            {days.map((day, idx) => {
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isSelected = value && isSameDay(day, parse(value, 'yyyy-MM-dd', new Date()));
              const isDisabled = isDateDisabled(day);
              const isToday = isSameDay(day, new Date());

              return (
                <Grid item xs={12 / 7} key={idx}>
                  <Box
                    onClick={() => !isDisabled && handleDateSelect(day)}
                    sx={{
                      width: '100%',
                      aspectRatio: '1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 1.5,
                      fontSize: '13px',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      backgroundColor: isSelected
                        ? '#6366f1'
                        : isToday
                        ? '#e0e7ff'
                        : isCurrentMonth
                        ? 'transparent'
                        : '#f8fafc',
                      color: isSelected
                        ? '#ffffff'
                        : isDisabled
                        ? '#cbd5e1'
                        : isCurrentMonth
                        ? '#1e293b'
                        : '#94a3b8',
                      border: isToday && !isSelected ? '2px solid #6366f1' : 'none',
                      opacity: isDisabled ? 0.5 : 1,
                      transition: 'all 0.2s ease',
                      '&:hover': isDisabled
                        ? {}
                        : {
                            backgroundColor: isSelected ? '#4f46e5' : '#f1f5f9',
                            transform: 'scale(1.05)',
                          },
                    }}
                  >
                    {format(day, 'd')}
                  </Box>
                </Grid>
              );
            })}
          </Grid>

          {/* Footer with shortcuts */}
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              mt: 2,
              pt: 2,
              borderTop: '1px solid #e2e8f0',
              justifyContent: 'space-between',
            }}
          >
            <Typography
              onClick={() => {
                handleDateSelect(new Date());
              }}
              sx={{
                fontSize: '12px',
                color: '#6366f1',
                cursor: 'pointer',
                fontWeight: 500,
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Hoy
            </Typography>
            <Typography
              onClick={() => {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                handleDateSelect(yesterday);
              }}
              sx={{
                fontSize: '12px',
                color: '#6366f1',
                cursor: 'pointer',
                fontWeight: 500,
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Ayer
            </Typography>
          </Box>
        </Paper>
      </Popover>
    </Box>
  );
};

export default DatePickerCustom;
