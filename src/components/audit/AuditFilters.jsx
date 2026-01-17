import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  TextField,
  Button,
  Grid,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { DateRangePicker } from '../common/DateRangePicker';
import { auditLogService } from '../../services/auditLog.service';

// Actions grouped by category based on documentation
const ACTIONS_BY_CATEGORY = {
  crud: {
    label: '📝 CRUD Operations',
    actions: [
      { value: 'CREATE', label: 'Create' },
      { value: 'UPDATE', label: 'Update' },
      { value: 'DELETE', label: 'Delete' },
      { value: 'READ', label: 'Read' },
    ],
  },
  status: {
    label: '🔄 Status Changes',
    actions: [
      { value: 'ACTIVATE', label: 'Activate' },
      { value: 'DEACTIVATE', label: 'Deactivate' },
    ],
  },
  auth: {
    label: '🔐 Authentication',
    actions: [
      { value: 'LOGIN', label: 'Login' },
      { value: 'LOGOUT', label: 'Logout' },
      { value: 'LOGIN_FAILED', label: 'Login Failed' },
      { value: 'PASSWORD_RESET', label: 'Password Reset' },
    ],
  },
  inventory: {
    label: '📦 Inventory',
    actions: [
      { value: 'STOCK_IN', label: 'Stock In' },
      { value: 'STOCK_OUT', label: 'Stock Out' },
      { value: 'STOCK_ADJUSTMENT', label: 'Stock Adjustment' },
      { value: 'STOCK_TRANSFER', label: 'Stock Transfer' },
    ],
  },
  sales: {
    label: '💰 Sales & Payments',
    actions: [
      { value: 'SALE_CREATED', label: 'Sale Created' },
      { value: 'SALE_CANCELLED', label: 'Sale Cancelled' },
      { value: 'PAYMENT_RECEIVED', label: 'Payment Received' },
    ],
  },
  bulk: {
    label: '📊 Bulk Operations',
    actions: [
      { value: 'BULK_IMPORT', label: 'Bulk Import' },
      { value: 'BULK_UPDATE', label: 'Bulk Update' },
      { value: 'BULK_DELETE', label: 'Bulk Delete' },
    ],
  },
  config: {
    label: '⚙️ Configuration',
    actions: [
      { value: 'CONFIG_CHANGE', label: 'Config Change' },
    ],
  },
};

// Severity levels
const SEVERITY_LEVELS = [
  { value: 'info', label: 'Info', color: 'info' },
  { value: 'warning', label: 'Warning', color: 'warning' },
  { value: 'critical', label: 'Critical', color: 'error' },
];

/**
 * AuditFilters Component
 * Advanced filters for audit logs based on DOCUMENTACION_AUDIT_LOGS.md
 */
export const AuditFilters = ({ onFilterChange, initialFilters = {} }) => {
  const [startDate, setStartDate] = useState(initialFilters.startDate || '');
  const [endDate, setEndDate] = useState(initialFilters.endDate || '');
  const [selectedActions, setSelectedActions] = useState(initialFilters.action || []);
  const [selectedEntityTypes, setSelectedEntityTypes] = useState(initialFilters.entityType || []);
  const [selectedModules, setSelectedModules] = useState(initialFilters.module || []);
  const [selectedSeverity, setSelectedSeverity] = useState(initialFilters.severity || []);
  const [search, setSearch] = useState(initialFilters.search || '');
  const [userId, setUserId] = useState(initialFilters.userId || '');

  // Dynamic options from backend
  const [availableEntityTypes, setAvailableEntityTypes] = useState([]);
  const [availableModules, setAvailableModules] = useState([]);

  useEffect(() => {
    // Fetch available entity types and modules from backend
    const fetchFilters = async () => {
      try {
        const [entityTypes, modules] = await Promise.all([
          auditLogService.getAvailableEntityTypes(),
          auditLogService.getAvailableModules(),
        ]);
        setAvailableEntityTypes(entityTypes);
        setAvailableModules(modules);
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };

    fetchFilters();
  }, []);

  const handleActionToggle = (action) => {
    setSelectedActions((prev) =>
      prev.includes(action)
        ? prev.filter((a) => a !== action)
        : [...prev, action]
    );
  };

  const handleCategoryToggle = (categoryKey) => {
    const categoryActions = ACTIONS_BY_CATEGORY[categoryKey].actions.map(
      (a) => a.value
    );
    const allSelected = categoryActions.every((a) =>
      selectedActions.includes(a)
    );

    if (allSelected) {
      setSelectedActions((prev) =>
        prev.filter((a) => !categoryActions.includes(a))
      );
    } else {
      const newActions = [...selectedActions];
      categoryActions.forEach((a) => {
        if (!newActions.includes(a)) {
          newActions.push(a);
        }
      });
      setSelectedActions(newActions);
    }
  };

  const isCategorySelected = (categoryKey) => {
    const categoryActions = ACTIONS_BY_CATEGORY[categoryKey].actions.map(
      (a) => a.value
    );
    return categoryActions.every((a) => selectedActions.includes(a));
  };

  const handleEntityTypeToggle = (entityType) => {
    setSelectedEntityTypes((prev) =>
      prev.includes(entityType)
        ? prev.filter((et) => et !== entityType)
        : [...prev, entityType]
    );
  };

  const handleModuleToggle = (module) => {
    setSelectedModules((prev) =>
      prev.includes(module)
        ? prev.filter((m) => m !== module)
        : [...prev, module]
    );
  };

  const handleSeverityToggle = (severity) => {
    setSelectedSeverity((prev) =>
      prev.includes(severity)
        ? prev.filter((s) => s !== severity)
        : [...prev, severity]
    );
  };

  const handleApplyFilters = () => {
    const filters = {
      page: 1,
      limit: 50,
      sortOrder: 'DESC',
    };

    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (selectedActions.length > 0) filters.action = selectedActions.join(',');
    if (selectedEntityTypes.length > 0) filters.entityType = selectedEntityTypes.join(',');
    if (selectedModules.length > 0) filters.module = selectedModules.join(',');
    if (selectedSeverity.length > 0) filters.severity = selectedSeverity.join(',');
    if (search.trim()) filters.search = search.trim();
    if (userId) filters.userId = parseInt(userId);

    onFilterChange(filters);
  };

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedActions([]);
    setSelectedEntityTypes([]);
    setSelectedModules([]);
    setSelectedSeverity([]);
    setSearch('');
    setUserId('');
    onFilterChange({
      page: 1,
      limit: 50,
      sortOrder: 'DESC',
    });
  };

  return (
    <Card sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        🔍 Filtros Avanzados
      </Typography>

      <Grid container spacing={3}>
        {/* Date Range */}
        <Grid item xs={12} md={6}>
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={(e) => setStartDate(e.target.value)}
            onEndDateChange={(e) => setEndDate(e.target.value)}
            label="Rango de Fechas"
          />
        </Grid>

        {/* User ID Filter */}
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="ID de Usuario"
            placeholder="Ej: 5"
            type="number"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            size="small"
          />
        </Grid>

        {/* Search */}
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Búsqueda de Texto"
            placeholder="Buscar en descripción..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
          />
        </Grid>

        {/* Severity Levels */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
            ⚠️ Nivel de Severidad
          </Typography>
          <Stack direction="row" spacing={1}>
            {SEVERITY_LEVELS.map((severity) => (
              <Chip
                key={severity.value}
                label={severity.label}
                color={selectedSeverity.includes(severity.value) ? severity.color : 'default'}
                onClick={() => handleSeverityToggle(severity.value)}
                variant={selectedSeverity.includes(severity.value) ? 'filled' : 'outlined'}
              />
            ))}
          </Stack>
        </Grid>

        {/* Modules */}
        {availableModules.length > 0 && (
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
              📂 Módulos del Sistema
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {availableModules.map((module) => (
                <Chip
                  key={module}
                  label={module}
                  color={selectedModules.includes(module) ? 'primary' : 'default'}
                  onClick={() => handleModuleToggle(module)}
                  variant={selectedModules.includes(module) ? 'filled' : 'outlined'}
                />
              ))}
            </Stack>
          </Grid>
        )}

        {/* Entity Types */}
        {availableEntityTypes.length > 0 && (
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
              📋 Tipos de Entidad
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {availableEntityTypes.map((entityType) => (
                <Chip
                  key={entityType}
                  label={entityType}
                  color={selectedEntityTypes.includes(entityType) ? 'secondary' : 'default'}
                  onClick={() => handleEntityTypeToggle(entityType)}
                  variant={selectedEntityTypes.includes(entityType) ? 'filled' : 'outlined'}
                />
              ))}
            </Stack>
          </Grid>
        )}

        {/* Actions by Category */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
            🔧 Acciones
          </Typography>

          {selectedActions.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {selectedActions.map((action) => {
                  const category = Object.values(ACTIONS_BY_CATEGORY).find((c) =>
                    c.actions.some((a) => a.value === action)
                  );
                  const actionObj = category?.actions.find((a) => a.value === action);
                  return (
                    <Chip
                      key={action}
                      label={actionObj?.label || action}
                      onDelete={() => handleActionToggle(action)}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  );
                })}
              </Stack>
            </Box>
          )}

          <Grid container spacing={2}>
            {Object.entries(ACTIONS_BY_CATEGORY).map(([categoryKey, category]) => (
              <Grid item xs={12} sm={6} md={4} key={categoryKey}>
                <Accordion
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:before': { display: 'none' },
                    boxShadow: 'none',
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isCategorySelected(categoryKey)}
                          onChange={() => handleCategoryToggle(categoryKey)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      }
                      label={
                        <Typography variant="body2" fontWeight={600}>
                          {category.label}
                        </Typography>
                      }
                      onClick={(e) => e.stopPropagation()}
                    />
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0 }}>
                    <FormGroup>
                      {category.actions.map((action) => (
                        <FormControlLabel
                          key={action.value}
                          control={
                            <Checkbox
                              checked={selectedActions.includes(action.value)}
                              onChange={() => handleActionToggle(action.value)}
                              size="small"
                            />
                          }
                          label={
                            <Typography variant="body2">{action.label}</Typography>
                          }
                        />
                      ))}
                    </FormGroup>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Grid item xs={12}>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" onClick={handleResetFilters} color="inherit">
              Limpiar Filtros
            </Button>
            <Button variant="contained" onClick={handleApplyFilters}>
              Aplicar Filtros
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Card>
  );
};
