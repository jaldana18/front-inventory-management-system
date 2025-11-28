import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  Typography,
  Box,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Autocomplete,
  Alert,
  Stack,
  InputAdornment,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/es";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Inventory2Outlined as InventoryIcon,
  Search as SearchIcon,
  InfoOutlined as InfoIcon,
} from "@mui/icons-material";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  saleSchema,
  saleDefaultValues,
  saleTypeOptions,
  calculateSaleTotals,
} from "../../schemas/sale.schema";
import { useCreateSale } from "../../hooks/useSales";
import { useSearchCustomers } from "../../hooks/useCustomers";
import { useWarehouses } from "../../hooks/useWarehouses";
import { useProducts } from "../../hooks/useProducts";
import { useSalesStore } from "../../store/salesStore";
import { useLanguage } from "../../context/LanguageContext";

const SaleFormDialog = () => {
  const { t } = useLanguage();
  const [customerSearch, setCustomerSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");

  const {
    sales: { dialogOpen },
    setSaleDialogOpen,
  } = useSalesStore();

  const createMutation = useCreateSale();

  // Queries
  const { data: customersData } = useSearchCustomers(customerSearch);
  const { data: warehousesData } = useWarehouses();
  const { data: productsData } = useProducts({ search: productSearch });

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(saleSchema),
    defaultValues: saleDefaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const items = watch("items");

  // Recalculate totals when items change
  const handleItemsChange = () => {
    if (items && items.length > 0) {
      const totals = calculateSaleTotals(items);
      setValue("subtotal", totals.subtotal);
      setValue("totalTax", totals.totalTax);
      setValue("totalDiscount", totals.totalDiscount);
      setValue("total", totals.total);
    }
  };

  const onSubmit = async (data) => {
    try {
      await createMutation.mutateAsync(data);
      handleClose();
    } catch (error) {
      console.error("Error creating sale:", error);
    }
  };

  const handleClose = () => {
    setSaleDialogOpen(false);
    reset(saleDefaultValues);
  };

  const handleAddProduct = (product) => {
    if (!product) return;

    const existingIndex = items.findIndex(
      (item) => item.productId === product.id
    );

    if (existingIndex >= 0) {
      // Increment quantity if product already exists
      const currentQty = items[existingIndex].quantity || 1;
      setValue(`items.${existingIndex}.quantity`, currentQty + 1);
    } else {
      // Add new product
      append({
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: product.salePrice || product.price || 0,
        tax: 0,
        discount: 0,
        subtotal: product.salePrice || product.price || 0,
      });
    }

    handleItemsChange();
    setProductSearch("");
  };

  const handleQuantityChange = (index, quantity) => {
    const item = items[index];
    const subtotal =
      quantity *
      item.price *
      (1 + (item.tax || 0) / 100) *
      (1 - (item.discount || 0) / 100);
    setValue(`items.${index}.quantity`, quantity);
    setValue(`items.${index}.subtotal`, subtotal);
    handleItemsChange();
  };

  const handlePriceChange = (index, price) => {
    const item = items[index];
    const subtotal =
      item.quantity *
      price *
      (1 + (item.tax || 0) / 100) *
      (1 - (item.discount || 0) / 100);
    setValue(`items.${index}.price`, price);
    setValue(`items.${index}.subtotal`, subtotal);
    handleItemsChange();
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  return (
    <Dialog
      open={dialogOpen}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, maxHeight: "90vh" },
      }}
    >
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Nueva Venta
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Completa la información de la venta
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers sx={{ px: 3, py: 3 }}>
          {/* Información General */}
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: "text.primary" }}>
            Información General
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, width: '100%', mb: 3 }}>
            {/* Columna Izquierda */}
            <Box sx={{ flex: 1 }}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" sx={{ mb: 0.5, color: "text.secondary" }}>
                    Almacén *
                  </Typography>
                  <Controller
                    name="warehouseId"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        fullWidth
                        required
                        placeholder="Seleccionar almacén"
                        error={!!errors.warehouseId}
                        helperText={errors.warehouseId?.message}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        InputLabelProps={{ shrink: false }}
                        SelectProps={{
                          displayEmpty: true,
                          renderValue: (value) => {
                            const warehouse = warehousesData?.data?.items?.find(w => w.id === value);
                            return warehouse?.name || "Seleccionar almacén";
                          }
                        }}
                      >
                        {warehousesData?.data?.items?.map((warehouse) => (
                          <MenuItem key={warehouse.id} value={warehouse.id}>
                            {warehouse.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </Box>

                <Box>
                  <Typography variant="body2" sx={{ mb: 0.5, color: "text.secondary" }}>
                    Tipo de Documento
                  </Typography>
                  <Controller
                    name="saleType"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        fullWidth
                        required
                        placeholder="Seleccionar tipo"
                        error={!!errors.saleType}
                        helperText={errors.saleType?.message}
                        InputLabelProps={{ shrink: false }}
                        SelectProps={{
                          displayEmpty: true,
                          renderValue: (value) => {
                            const option = saleTypeOptions.find(o => o.value === value);
                            return option?.label || "Seleccionar tipo";
                          }
                        }}
                      >
                        {saleTypeOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </Box>
              </Stack>
            </Box>

            {/* Columna Derecha */}
            <Box sx={{ flex: 1 }}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" sx={{ mb: 0.5, color: "text.secondary" }}>
                    Cliente *
                  </Typography>
                  <Controller
                    name="customerId"
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                        options={customersData?.data || []}
                        getOptionLabel={(option) => option.name || ""}
                        onChange={(e, value) => field.onChange(value?.id || null)}
                        onInputChange={(e, value) => setCustomerSearch(value)}
                        fullWidth
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            required
                            placeholder="Seleccionar cliente"
                            error={!!errors.customerId}
                            helperText={errors.customerId?.message}
                            InputLabelProps={{ shrink: false }}
                          />
                        )}
                      />
                    )}
                  />
                </Box>

                <Box>
                  <Typography variant="body2" sx={{ mb: 0.5, color: "text.secondary" }}>
                    Fecha de Venta *
                  </Typography>
                  <Controller
                    name="saleDate"
                    control={control}
                    render={({ field }) => (
                      <LocalizationProvider
                        dateAdapter={AdapterDayjs}
                        adapterLocale="es"
                      >
                        <DatePicker
                          value={field.value ? dayjs(field.value) : null}
                          onChange={(date) =>
                            field.onChange(date ? date.format("YYYY-MM-DD") : "")
                          }
                          format="DD/MM/YYYY"
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              required: true,
                              error: !!errors.saleDate,
                              helperText: errors.saleDate?.message,
                              InputLabelProps: { shrink: false },
                            },
                          }}
                        />
                      </LocalizationProvider>
                    )}
                  />
                </Box>

                <Box>
                  <Typography variant="body2" sx={{ mb: 0.5, color: "text.secondary" }}>
                    Fecha de Vencimiento
                  </Typography>
                  <Controller
                    name="dueDate"
                    control={control}
                    render={({ field }) => (
                      <LocalizationProvider
                        dateAdapter={AdapterDayjs}
                        adapterLocale="es"
                      >
                        <DatePicker
                          value={field.value ? dayjs(field.value) : null}
                          onChange={(date) =>
                            field.onChange(date ? date.format("YYYY-MM-DD") : "")
                          }
                          format="DD/MM/YYYY"
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error: !!errors.dueDate,
                              helperText: errors.dueDate?.message,
                              placeholder: "Seleccionar fecha",
                              InputLabelProps: { shrink: false },
                            },
                          }}
                        />
                      </LocalizationProvider>
                    )}
                  />
                </Box>
              </Stack>
            </Box>
          </Box>

          {/* Products Section */}
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: "text.primary" }}>
            Productos
          </Typography>

          {/* Product Search */}
          <Box sx={{ mb: 2 }}>
            <Autocomplete
              options={productsData?.data?.items || []}
              getOptionLabel={(option) =>
                `${option.name} - ${formatCurrency(
                  option.salePrice || option.price
                )}`
              }
              onChange={(e, value) => handleAddProduct(value)}
              onInputChange={(e, value) => setProductSearch(value)}
              value={null}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Buscar y agregar producto"
                  InputLabelProps={{ shrink: false }}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: "text.secondary" }} />
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Box>

          {/* Items Table or Empty State */}
          {fields.length > 0 ? (
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Producto</TableCell>
                    <TableCell align="right" width={100}>
                      Cantidad
                    </TableCell>
                    <TableCell align="right" width={120}>
                      Precio
                    </TableCell>
                    <TableCell align="right" width={120}>
                      Subtotal
                    </TableCell>
                    <TableCell align="center" width={60}>
                      Acción
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {items[index]?.productName}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <TextField
                          type="number"
                          size="small"
                          value={items[index]?.quantity || 1}
                          onChange={(e) =>
                            handleQuantityChange(
                              index,
                              parseInt(e.target.value) || 1
                            )
                          }
                          inputProps={{ min: 1, style: { textAlign: "right" } }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <TextField
                          type="number"
                          size="small"
                          value={items[index]?.price || 0}
                          onChange={(e) =>
                            handlePriceChange(
                              index,
                              parseFloat(e.target.value) || 0
                            )
                          }
                          inputProps={{ min: 0, style: { textAlign: "right" } }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatCurrency(items[index]?.subtotal || 0)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => remove(index)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert
              severity="info"
              icon={<InfoIcon />}
              sx={{
                mb: 2,
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                '& .MuiAlert-icon': {
                  color: 'info.main'
                }
              }}
            >
              No hay productos agregados. Busca y agrega productos para continuar.
            </Alert>
          )}

          {/* Notas y Totales */}
          <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
            {/* Columna Izquierda: Notas (más pequeña ~42%) */}
            <Box sx={{ flex: '0 0 42%' }}>
              <Typography variant="body2" sx={{ mb: 0.5, color: "text.secondary" }}>
                Notas
              </Typography>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    multiline
                    rows={4}
                    fullWidth
                    placeholder="Añade notas adicionales..."
                    error={!!errors.notes}
                    helperText={errors.notes?.message}
                    InputLabelProps={{ shrink: false }}
                  />
                )}
              />
            </Box>

            {/* Columna Derecha: Totales (más grande ~58%) */}
            <Box sx={{ flex: '1' }}>
              <Stack spacing={1}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">
                    Subtotal
                  </Typography>
                  <Typography variant="body2">
                    {formatCurrency(watch("subtotal") || 0)}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">
                    Impuestos
                  </Typography>
                  <Typography variant="body2">
                    {formatCurrency(watch("totalTax") || 0)}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">
                    Descuentos
                  </Typography>
                  <Typography variant="body2" sx={{ color: "error.main" }}>
                    - {formatCurrency(watch("totalDiscount") || 0)}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Total:
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: "primary.main" }}
                  >
                    {formatCurrency(watch("total") || 0)}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Box>

        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || fields.length === 0}
          >
            {isSubmitting ? "Guardando..." : "Crear Venta"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default SaleFormDialog;
