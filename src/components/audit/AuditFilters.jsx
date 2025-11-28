import { useState } from 'react';
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
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { DateRangePicker } from '../common/DateRangePicker';

const OPERATIONS_BY_MODULE = {
  sales: {
    label: '🛒 Ventas',
    operations: [
      { value: 'sale_created', label: 'Venta creada' },
      { value: 'sale_confirmed', label: 'Venta confirmada' },
      { value: 'sale_cancelled', label: 'Venta cancelada' },
      { value: 'credit_note_created', label: 'Nota de crédito' },
      { value: 'quote_converted_to_invoice', label: 'Cotización → Factura' },
      { value: 'remission_created', label: 'Remisión creada' },
      { value: 'sale_dispatched', label: 'Venta despachada' },
      { value: 'sale_delivered', label: 'Venta entregada' },
    ],
  },
  inventory: {
    label: '📦 Inventario',
    operations: [
      { value: 'inventory_transaction_created', label: 'Transacción creada' },
      { value: 'bulk_inventory_upload', label: 'Carga masiva Excel' },
      { value: 'bulk_inbound_created', label: 'Entrada masiva' },
      { value: 'bulk_outbound_created', label: 'Salida masiva' },
      { value: 'warehouse_transfer', label: 'Transferencia' },
      { value: 'product_auto_created', label: 'Producto auto-creado' },
    ],
  },
  payments: {
    label: '💳 Pagos',
    operations: [
      { value: 'payment_created', label: 'Pago registrado' },
      { value: 'payment_refunded', label: 'Pago reembolsado' },
      { value: 'payment_cancelled', label: 'Pago cancelado' },
    ],
  },
  products: {
    label: '📦 Productos',
    operations: [
      { value: 'product_created', label: 'Producto creado' },
      { value: 'product_updated', label: 'Producto actualizado' },
      { value: 'product_deleted', label: 'Producto eliminado' },
    ],
  },
  users: {
    label: '👥 Usuarios',
    operations: [
      { value: 'user_created', label: 'Usuario creado' },
      { value: 'user_updated', label: 'Usuario actualizado' },
      { value: 'user_deleted', label: 'Usuario eliminado' },
    ],
  },
};

/**
 * AuditFilters Component
 * Advanced filters for audit logs
 */
export const AuditFilters = ({ onFilterChange, initialFilters = {} }) => {
  const [startDate, setStartDate] = useState(initialFilters.startDate || '');
  const [endDate, setEndDate] = useState(initialFilters.endDate || '');
  const [selectedOperations, setSelectedOperations] = useState(
    initialFilters.operation || []
  );
  const [search, setSearch] = useState(initialFilters.search || '');

  const handleOperationToggle = (operation) => {
    setSelectedOperations((prev) =>
      prev.includes(operation)
        ? prev.filter((op) => op !== operation)
        : [...prev, operation]
    );
  };

  const handleModuleToggle = (moduleKey) => {
    const moduleOps = OPERATIONS_BY_MODULE[moduleKey].operations.map(
      (op) => op.value
    );
    const allSelected = moduleOps.every((op) =>
      selectedOperations.includes(op)
    );

    if (allSelected) {
      // Deselect all
      setSelectedOperations((prev) =>
        prev.filter((op) => !moduleOps.includes(op))
      );
    } else {
      // Select all
      const newOps = [...selectedOperations];
      moduleOps.forEach((op) => {
        if (!newOps.includes(op)) {
          newOps.push(op);
        }
      });
      setSelectedOperations(newOps);
    }
  };

  const isModuleSelected = (moduleKey) => {
    const moduleOps = OPERATIONS_BY_MODULE[moduleKey].operations.map(
      (op) => op.value
    );
    return moduleOps.every((op) => selectedOperations.includes(op));
  };

  const handleApplyFilters = () => {
    const filters = {
      page: 1,
      limit: 50,
      sortOrder: 'desc',
      type: ['business_operation'],
    };

    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (selectedOperations.length > 0)
      filters.operation = selectedOperations;
    if (search.trim()) filters.search = search.trim();

    onFilterChange(filters);
  };

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedOperations([]);
    setSearch('');
    onFilterChange({
      page: 1,
      limit: 50,
      sortOrder: 'desc',
      type: ['business_operation'],
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

        {/* Search */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Búsqueda de Texto"
            placeholder="Buscar en detalles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
          />
        </Grid>

        {/* Operations by Module */}
        <Grid item xs={12}>
          <Typography
            variant="subtitle2"
            sx={{ mb: 1.5, fontWeight: 600, color: 'text.secondary' }}
          >
            🔧 Operaciones por Módulo
          </Typography>

          {selectedOperations.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {selectedOperations.map((op) => {
                  const module = Object.values(OPERATIONS_BY_MODULE).find((m) =>
                    m.operations.some((o) => o.value === op)
                  );
                  const operation = module?.operations.find(
                    (o) => o.value === op
                  );
                  return (
                    <Chip
                      key={op}
                      label={operation?.label || op}
                      onDelete={() => handleOperationToggle(op)}
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
            {Object.entries(OPERATIONS_BY_MODULE).map(
              ([moduleKey, module]) => (
                <Grid item xs={12} sm={6} md={4} key={moduleKey}>
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
                            checked={isModuleSelected(moduleKey)}
                            onChange={() => handleModuleToggle(moduleKey)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        }
                        label={
                          <Typography variant="body2" fontWeight={600}>
                            {module.label}
                          </Typography>
                        }
                        onClick={(e) => e.stopPropagation()}
                      />
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0 }}>
                      <FormGroup>
                        {module.operations.map((op) => (
                          <FormControlLabel
                            key={op.value}
                            control={
                              <Checkbox
                                checked={selectedOperations.includes(
                                  op.value
                                )}
                                onChange={() =>
                                  handleOperationToggle(op.value)
                                }
                                size="small"
                              />
                            }
                            label={
                              <Typography variant="body2">
                                {op.label}
                              </Typography>
                            }
                          />
                        ))}
                      </FormGroup>
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              )
            )}
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Grid item xs={12}>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={handleResetFilters}
              color="inherit"
            >
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
