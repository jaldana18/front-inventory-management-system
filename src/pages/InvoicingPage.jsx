import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Divider,
  MenuItem,
  Stack,
  Alert,
  IconButton,
} from '@mui/material';
import {
  Save as SaveIcon,
  Print as PrintIcon,
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { invoiceService } from '../services/invoice.service';
import { warehouseService } from '../services/warehouse.service';
import ProductSelector from '../components/invoicing/ProductSelector';
import toast from 'react-hot-toast';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const InvoicingPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [stockData, setStockData] = useState({});
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    warehouseId: '',
    notes: '',
    dueDate: dayjs().add(30, 'day'),
    paymentStatus: 'PENDING',
  });

  const formatCurrency = (value) => {
    if (!value && value !== 0) return '$0';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  useEffect(() => {
    loadWarehouses();
  }, []);

  useEffect(() => {
    const loadStockData = async () => {
      if (!formData.warehouseId || selectedProducts.length === 0) return;

      try {
        const { inventoryService } = await import('../services/inventory.service');
        const productIds = selectedProducts.map((p) => p.productId);
        const stockPromises = productIds.map((id) =>
          inventoryService.getProductStockInWarehouse(id, formData.warehouseId).catch(() => null)
        );

        const stockResults = await Promise.all(stockPromises);
        const stockMap = {};

        stockResults.forEach((result, index) => {
          if (result?.data) {
            stockMap[productIds[index]] = result.data.quantity || 0;
          }
        });

        setStockData(stockMap);
      } catch (error) {
        console.error('Error loading stock:', error);
      }
    };

    loadStockData();
  }, [formData.warehouseId, selectedProducts]);

  const loadWarehouses = async () => {
    try {
      const response = await warehouseService.getAll();
      const warehousesData = response?.data?.items || response?.items || response?.data || [];
      setWarehouses(Array.isArray(warehousesData) ? warehousesData : []);
    } catch (error) {
      console.error('Error loading warehouses:', error);
      toast.error('Error al cargar almacenes');
    }
  };

  const productsWithoutStock = useMemo(() => {
    if (!formData.warehouseId || selectedProducts.length === 0) return [];
    
    return selectedProducts.filter((product) => {
      const availableStock = stockData[product.productId] || 0;
      return product.quantity > availableStock;
    });
  }, [selectedProducts, stockData, formData.warehouseId]);

  const totals = useMemo(() => {
    const subtotal = selectedProducts.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const totalDiscount = selectedProducts.reduce((sum, item) => {
      const itemSubtotal = item.unitPrice * item.quantity;
      return sum + (itemSubtotal * item.discount) / 100;
    }, 0);
    const taxableAmount = subtotal - totalDiscount;
    const totalTax = selectedProducts.reduce((sum, item) => {
      const itemSubtotal = item.unitPrice * item.quantity;
      const itemDiscount = (itemSubtotal * item.discount) / 100;
      const itemTaxable = itemSubtotal - itemDiscount;
      return sum + (itemTaxable * item.tax) / 100;
    }, 0);
    const total = taxableAmount + totalTax;
    return { subtotal, totalDiscount, totalTax, total };
  }, [selectedProducts]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleWarehouseChange = (e) => {
    setFormData((prev) => ({ ...prev, warehouseId: e.target.value }));
  };

  const handleDateChange = (newDate) => {
    setFormData((prev) => ({ ...prev, dueDate: newDate }));
  };

  const validateForm = () => {
    if (!formData.customerName.trim()) {
      toast.error('El nombre del cliente es requerido');
      return false;
    }
    if (!formData.warehouseId) {
      toast.error('Seleccione un almacén');
      return false;
    }
    if (selectedProducts.length === 0) {
      toast.error('Agregue al menos un producto a la factura');
      return false;
    }
    return true;
  };

  const handleSaveInvoice = async (sendEmail = false) => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const invoiceData = {
        customerName: formData.customerName,
        customerEmail: formData.customerEmail || undefined,
        customerPhone: formData.customerPhone || undefined,
        customerAddress: formData.customerAddress || undefined,
        warehouseId: formData.warehouseId,
        items: selectedProducts.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          tax: item.tax,
        })),
        subtotal: totals.subtotal,
        totalDiscount: totals.totalDiscount,
        totalTax: totals.totalTax,
        total: totals.total,
        notes: formData.notes || undefined,
        dueDate: formData.dueDate ? formData.dueDate.format('YYYY-MM-DD') : undefined,
        paymentStatus: formData.paymentStatus,
      };

      const response = await invoiceService.create(invoiceData);
      toast.success('Factura creada exitosamente');

      if (sendEmail && formData.customerEmail) {
        try {
          await invoiceService.sendEmail(response.data.id);
          toast.success('Factura enviada por correo electrónico');
        } catch (emailError) {
          console.error('Error sending email:', emailError);
          toast.error('Factura creada pero no se pudo enviar el correo');
        }
      }

      setFormData({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        customerAddress: '',
        warehouseId: '',
        notes: '',
        dueDate: dayjs().add(30, 'day'),
        paymentStatus: 'PENDING',
      });
      setSelectedProducts([]);
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error(error.response?.data?.message || 'Error al crear la factura');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintInvoice = () => {
    toast.info('Función de impresión en desarrollo');
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
        {/* Compact Header */}
        <Box sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', py: 2, px: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, maxWidth: 1400, mx: 'auto' }}>
            <IconButton onClick={() => navigate(-1)} size="small" sx={{ color: 'white' }}>
              <ArrowBackIcon />
            </IconButton>
            <ReceiptIcon sx={{ fontSize: 28, color: 'white' }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'white' }}>Nueva Factura</Typography>
            </Box>
          </Box>
        </Box>

        {/* Compact Content */}
        <Box sx={{ maxWidth: 1400, mx: 'auto', p: 2, display: 'flex', gap: 2, alignItems: 'flex-start', flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Left Column */}
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 66%' }, width: { xs: '100%', md: 'auto' } }}>
              {/* Customer - Compact */}
              <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  👤 Cliente
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid item xs={12} sm={4}>
                    <TextField fullWidth size="small" label="Nombre *" name="customerName" value={formData.customerName} onChange={handleInputChange} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField fullWidth size="small" label="Email" name="customerEmail" value={formData.customerEmail} onChange={handleInputChange} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField fullWidth size="small" label="Teléfono" name="customerPhone" value={formData.customerPhone} onChange={handleInputChange} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField fullWidth size="small" select label="Almacén *" name="warehouseId" value={formData.warehouseId} onChange={handleWarehouseChange} sx={{ minWidth: 200 }}>
                      {warehouses.map((w) => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={8}>
                    <TextField fullWidth size="small" label="Dirección" name="customerAddress" value={formData.customerAddress} onChange={handleInputChange} />
                  </Grid>
                </Grid>
              </Paper>

              {/* Products - Compact */}
              <ProductSelector selectedProducts={selectedProducts} onProductsChange={setSelectedProducts} warehouseId={formData.warehouseId} />
            </Box>

            {/* Right Column - Compact Summary */}
            <Box sx={{ flex: { xs: '1 1 100%', md: '0 0 33%' }, width: { xs: '100%', md: 'auto' }, position: { md: 'sticky' }, top: { md: 90 } }}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  📋 Resumen
                </Typography>

                <Stack spacing={1.5}>
                  <DatePicker label="Vencimiento" value={formData.dueDate} onChange={handleDateChange} slotProps={{ textField: { fullWidth: true, size: 'small' } }} />
                  <TextField fullWidth size="small" select label="Estado" name="paymentStatus" value={formData.paymentStatus} onChange={handleInputChange}>
                    <MenuItem value="PENDING">Pendiente</MenuItem>
                    <MenuItem value="PARTIAL">Parcial</MenuItem>
                    <MenuItem value="PAID">Pagado</MenuItem>
                  </TextField>
                  <TextField fullWidth size="small" label="Notas" name="notes" value={formData.notes} onChange={handleInputChange} multiline rows={2} />
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Subtotal:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatCurrency(totals.subtotal)}</Typography>
                  </Box>
                  {totals.totalDiscount > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Descuentos:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>-{formatCurrency(totals.totalDiscount)}</Typography>
                    </Box>
                  )}
                  {totals.totalTax > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Impuestos:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatCurrency(totals.totalTax)}</Typography>
                    </Box>
                  )}
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Total:</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>{formatCurrency(totals.total)}</Typography>
                  </Box>
                </Stack>

                {selectedProducts.length > 0 && (
                  <Box sx={{ mt: 2, p: 1.5, bgcolor: 'primary.50', borderRadius: 1, border: '1px solid', borderColor: 'primary.100' }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>📦 {selectedProducts.length} producto(s)</Typography>
                    {selectedProducts.slice(0, 3).map((item) => (
                      <Box key={item.productId} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption">{item.name} x{item.quantity}</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>{formatCurrency(item.subtotal)}</Typography>
                      </Box>
                    ))}
                    {selectedProducts.length > 3 && <Typography variant="caption" color="text.secondary">+{selectedProducts.length - 3} más...</Typography>}
                  </Box>
                )}

                <Stack spacing={1.5} sx={{ mt: 2 }}>
                  <Button fullWidth variant="contained" size="medium" startIcon={<SaveIcon />} onClick={() => handleSaveInvoice(false)} disabled={loading || selectedProducts.length === 0 || !formData.warehouseId || productsWithoutStock.length > 0} sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', fontWeight: 600 }}>
                    Guardar
                  </Button>
                  {formData.customerEmail && (
                    <Button fullWidth variant="outlined" size="small" startIcon={<SendIcon />} onClick={() => handleSaveInvoice(true)} disabled={loading || selectedProducts.length === 0 || !formData.warehouseId || productsWithoutStock.length > 0}>
                      Enviar Email
                    </Button>
                  )}
                  <Button fullWidth variant="outlined" size="small" startIcon={<PrintIcon />} onClick={handlePrintInvoice} disabled={selectedProducts.length === 0 || !formData.warehouseId || productsWithoutStock.length > 0}>
                    Imprimir
                  </Button>
                </Stack>

                {selectedProducts.length === 0 && (
                  <Alert severity="info" sx={{ mt: 2, py: 0.5 }}>
                    <Typography variant="caption">Agregue productos</Typography>
                  </Alert>
                )}
                
                {!formData.warehouseId && selectedProducts.length > 0 && (
                  <Alert severity="warning" sx={{ mt: 2, py: 0.5 }}>
                    <Typography variant="caption">Seleccione un almacén</Typography>
                  </Alert>
                )}

                {productsWithoutStock.length > 0 && (
                  <Alert severity="error" sx={{ mt: 2, py: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>Stock insuficiente:</Typography>
                    {productsWithoutStock.map((p) => (
                      <Typography key={p.productId} variant="caption" sx={{ display: 'block', fontSize: '0.7rem' }}>
                        • {p.name}: necesita {p.quantity}, disponible {stockData[p.productId] || 0}
                      </Typography>
                    ))}
                  </Alert>
                )}
              </Paper>
            </Box>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default InvoicingPage;
