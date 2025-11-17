import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Popover,
  Paper,
  IconButton,
  Typography,
  Grid,
  Button,
  Stack,
  Chip,
  Divider,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Close as CloseIcon,
  CalendarMonth as CalendarIcon,
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
  addMonths,
  subMonths,
  subDays,
  subYears,
  startOfDay,
  endOfDay,
  isWithinInterval,
  isBefore,
  isAfter,
} from 'date-fns';
import { es } from 'date-fns/locale';

const QUICK_PRESETS = [
  { label: 'Hoy', value: 'today' },
  { label: 'Ayer', value: 'yesterday' },
  { label: 'Últimos 7 días', value: '7days' },
  { label: 'Últimos 30 días', value: '30days' },
  { label: 'Últimos 90 días', value: '90days' },
  { label: 'Último año', value: '1year' },
  { label: 'Este mes', value: 'thisMonth' },
  { label: 'Mes pasado', value: 'lastMonth' },
];

const DateRangePicker = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  label = 'Seleccionar rango de fechas',
  size = 'small'
}) => {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoverDate, setHoverDate] = useState(null);
  const [selectingStart, setSelectingStart] = useState(true);

  const startDateObj = startDate ? parse(startDate, 'yyyy-MM-dd', new Date()) : null;
  const endDateObj = endDate ? parse(endDate, 'yyyy-MM-dd', new Date()) : null;

  useEffect(() => {
    if (startDateObj && !endDateObj) {
      setSelectingStart(false);
    } else if (startDateObj && endDateObj) {
      setSelectingStart(true);
    }
  }, [startDateObj, endDateObj]);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setAnchorEl(null);
    setHoverDate(null);
    setSelectingStart(true);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
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

  const handleDateClick = (date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');

    if (selectingStart) {
      // Selecting start date
      onStartDateChange({ target: { value: formattedDate } });
      onEndDateChange({ target: { value: '' } }); // Reset end date
      setSelectingStart(false);
    } else {
      // Selecting end date
      if (isBefore(date, startDateObj)) {
        // If selected date is before start, swap them
        onEndDateChange({ target: { value: startDate } });
        onStartDateChange({ target: { value: formattedDate } });
      } else {
        onEndDateChange({ target: { value: formattedDate } });
      }
      setSelectingStart(true);
      handleClose();
    }
  };

  const handlePresetClick = (preset) => {
    const today = new Date();
    let start, end;

    switch (preset) {
      case 'today':
        start = end = today;
        break;
      case 'yesterday':
        start = end = subDays(today, 1);
        break;
      case '7days':
        start = subDays(today, 6);
        end = today;
        break;
      case '30days':
        start = subDays(today, 29);
        end = today;
        break;
      case '90days':
        start = subDays(today, 89);
        end = today;
        break;
      case '1year':
        start = subYears(today, 1);
        end = today;
        break;
      case 'thisMonth':
        start = startOfMonth(today);
        end = today;
        break;
      case 'lastMonth':
        const lastMonth = subMonths(today, 1);
        start = startOfMonth(lastMonth);
        end = endOfMonth(lastMonth);
        break;
      default:
        return;
    }

    onStartDateChange({ target: { value: format(start, 'yyyy-MM-dd') } });
    onEndDateChange({ target: { value: format(end, 'yyyy-MM-dd') } });
    setSelectingStart(true);
    handleClose();
  };

  const isInRange = (date) => {
    if (!startDateObj || !endDateObj) return false;
    try {
      return isWithinInterval(date, { start: startOfDay(startDateObj), end: endOfDay(endDateObj) });
    } catch {
      return false;
    }
  };

  const isInHoverRange = (date) => {
    if (!startDateObj || !hoverDate || endDateObj) return false;
    const start = isBefore(startDateObj, hoverDate) ? startDateObj : hoverDate;
    const end = isAfter(startDateObj, hoverDate) ? startDateObj : hoverDate;
    try {
      return isWithinInterval(date, { start: startOfDay(start), end: endOfDay(end) });
    } catch {
      return false;
    }
  };

  const days = getDaysInMonth();
  const weekDays = ['DO', 'LU', 'MA', 'MI', 'JU', 'VI', 'SÁ'];

  const displayValue = () => {
    if (!startDate && !endDate) return '';
    if (startDate && !endDate) return `${startDate} - ...`;
    if (startDate && endDate) {
      if (startDate === endDate) return startDate;
      return `${startDate} → ${endDate}`;
    }
    return '';
  };

  return (
    <Box>
      <TextField
        label={label}
        type="text"
        value={displayValue()}
        onClick={handleOpen}
        readOnly
        fullWidth
        size={size}
        placeholder="Seleccione un rango"
        InputLabelProps={{ shrink: true }}
        InputProps={{
          endAdornment: (
            <IconButton
              size="small"
              onClick={handleOpen}
              sx={{
                p: 0.5,
                '&:hover': { backgroundColor: 'rgba(99, 102, 241, 0.08)' },
              }}
            >
              <CalendarIcon sx={{ fontSize: 18, color: '#6366f1' }} />
            </IconButton>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 1.5,
            backgroundColor: 'transparent',
            '&:hover': {
              backgroundColor: '#f9fafb',
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
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
          }}
        >
          <Stack direction="row" sx={{ minWidth: 500 }}>
            {/* Quick Presets Sidebar */}
            <Box
              sx={{
                width: 140,
                backgroundColor: '#fafbfc',
                borderRight: '1px solid #e5e7eb',
                p: 1.5,
              }}
            >
              <Typography
                sx={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.3px',
                  mb: 1,
                }}
              >
                Rangos rápidos
              </Typography>
              <Stack spacing={0.25}>
                {QUICK_PRESETS.map((preset) => (
                  <Button
                    key={preset.value}
                    onClick={() => handlePresetClick(preset.value)}
                    variant="text"
                    fullWidth
                    sx={{
                      justifyContent: 'flex-start',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '11px',
                      fontWeight: 500,
                      color: '#6b7280',
                      textTransform: 'none',
                      minHeight: 28,
                      '&:hover': {
                        backgroundColor: '#e0e7ff',
                        color: '#6366f1',
                      },
                    }}
                  >
                    {preset.label}
                  </Button>
                ))}
              </Stack>
            </Box>

            {/* Calendar */}
            <Box sx={{ p: 2, flex: 1 }}>
              {/* Header */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1.5,
                }}
              >
                <IconButton size="small" onClick={handlePrevMonth} sx={{ p: 0.5 }}>
                  <ChevronLeftIcon sx={{ fontSize: 18 }} />
                </IconButton>
                <Typography
                  sx={{
                    fontSize: '13px',
                    fontWeight: 700,
                    textTransform: 'capitalize',
                    flex: 1,
                    textAlign: 'center',
                    color: '#1e293b',
                  }}
                >
                  {format(currentMonth, 'MMMM yyyy', { locale: es })}
                </Typography>
                <IconButton size="small" onClick={handleNextMonth} sx={{ p: 0.5 }}>
                  <ChevronRightIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>

              {/* Selection Status */}
              <Box sx={{ mb: 1.5, textAlign: 'center' }}>
                <Typography variant="caption" sx={{ fontSize: '10px', color: '#6b7280' }}>
                  {startDate && endDate ? `${startDate} - ${endDate}` : selectingStart ? 'Seleccione fecha inicio' : 'Seleccione fecha fin'}
                </Typography>
              </Box>

              {/* Weekdays header */}
              <Box 
                sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: 0.5,
                  mb: 1,
                  pb: 1,
                  borderBottom: '1px solid #e5e7eb'
                }}
              >
                {weekDays.map((day) => (
                  <Box key={day} sx={{ textAlign: 'center' }}>
                    <Typography
                      sx={{
                        fontSize: '10px',
                        fontWeight: 700,
                        color: '#6b7280',
                        letterSpacing: '0.3px',
                      }}
                    >
                      {day}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Calendar days - organized by weeks */}
              <Box 
                sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: 0.5,
                }}
              >
                {days.map((day, idx) => {
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isStart = startDateObj && isSameDay(day, startDateObj);
                  const isEnd = endDateObj && isSameDay(day, endDateObj);
                  const inRange = isInRange(day);
                  const inHover = isInHoverRange(day);
                  const isToday = isSameDay(day, new Date());

                  return (
                    <Box
                      key={idx}
                      onClick={() => isCurrentMonth && handleDateClick(day)}
                      onMouseEnter={() => isCurrentMonth && setHoverDate(day)}
                      onMouseLeave={() => setHoverDate(null)}
                      sx={{
                        width: '100%',
                        height: 32,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: (isStart || isEnd) ? 1 : 0.5,
                        fontSize: '12px',
                        fontWeight: (isStart || isEnd) ? 600 : 500,
                        cursor: isCurrentMonth ? 'pointer' : 'default',
                        backgroundColor: (isStart || isEnd)
                          ? '#6366f1'
                          : (inRange || inHover)
                          ? '#e0e7ff'
                          : isToday
                          ? '#fef3c7'
                          : 'transparent',
                        color: (isStart || isEnd)
                          ? '#ffffff'
                          : isCurrentMonth
                          ? '#1e293b'
                          : '#d1d5db',
                        border: isToday && !isStart && !isEnd ? '1px solid #f59e0b' : 'none',
                        opacity: isCurrentMonth ? 1 : 0.5,
                        transition: 'all 0.15s ease',
                        '&:hover': isCurrentMonth
                          ? {
                              backgroundColor: (isStart || isEnd) ? '#4f46e5' : '#c7d2fe',
                              transform: 'scale(1.05)',
                            }
                          : {},
                      }}
                    >
                      {format(day, 'd')}
                    </Box>
                  );
                })}
              </Box>

              {/* Footer with instructions */}
              <Box
                sx={{
                  mt: 1.5,
                  pt: 1.5,
                  borderTop: '1px solid #e5e7eb',
                }}
              >
                <Typography
                  sx={{
                    fontSize: '10px',
                    color: '#6b7280',
                    textAlign: 'center',
                  }}
                >
                  {selectingStart
                    ? 'Haga clic para seleccionar la fecha de inicio'
                    : 'Haga clic para seleccionar la fecha de fin'}
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Paper>
      </Popover>
    </Box>
  );
};

export default DateRangePicker;
