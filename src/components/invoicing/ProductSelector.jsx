import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  InputAdornment,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { productService } from '../../services/product.service';
import { inventoryService } from '../../services/inventory.service';
import toast from 'react-hot-toast';

const ProductSelector = ({ selectedProducts, onProductsChange, warehouseId }) => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [stockData, setStockData] = useState({});

  // Currency formatting
  const formatCurrency = (value) => {
    if (!value && value !== 0) return '$0.00';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (warehouseId) {
      loadStockData();
    }
  }, [warehouseId, selectedProducts]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await productService.getAll({ isActive: true });
      const productsData = response?.data?.items || response?.items || response?.data || [];
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const loadStockData = async () => {
    if (!warehouseId) return;

    try {
      const productIds = selectedProducts.map((p) => p.productId);
      const stockPromises = productIds.map((id) =>
        inventoryService.getProductStockInWarehouse(id, warehouseId).catch(() => null)
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

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;

    const term = searchTerm.toLowerCase();
    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(term) ||
        p.sku?.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term)
    );
  }, [products, searchTerm]);

  const handleAddProduct = (product) => {
    const existing = selectedProducts.find((p) => p.productId === product.id);

    if (existing) {
      handleUpdateQuantity(product.id, existing.quantity + 1);
    } else {
      const newProduct = {
        productId: product.id,
        name: product.name,
        sku: product.sku,
        unitPrice: product.price || 0,
        quantity: 1,
        discount: 0,
        tax: product.tax || 0,
        subtotal: product.price || 0,
      };
      onProductsChange([...selectedProducts, newProduct]);
    }
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveProduct(productId);
      return;
    }

    const updated = selectedProducts.map((p) => {
      if (p.productId === productId) {
        const subtotal = p.unitPrice * newQuantity;
        const discountAmount = (subtotal * p.discount) / 100;
        const taxableAmount = subtotal - discountAmount;
        const taxAmount = (taxableAmount * p.tax) / 100;
        const total = taxableAmount + taxAmount;

        return {
          ...p,
          quantity: newQuantity,
          subtotal: total,
        };
      }
      return p;
    });

    onProductsChange(updated);
  };

  const handleUpdatePrice = (productId, newPrice) => {
    const updated = selectedProducts.map((p) => {
      if (p.productId === productId) {
        const subtotal = newPrice * p.quantity;
        const discountAmount = (subtotal * p.discount) / 100;
        const taxableAmount = subtotal - discountAmount;
        const taxAmount = (taxableAmount * p.tax) / 100;
        const total = taxableAmount + taxAmount;

        return {
          ...p,
          unitPrice: newPrice,
          subtotal: total,
        };
      }
      return p;
    });

    onProductsChange(updated);
  };

  const handleUpdateDiscount = (productId, newDiscount) => {
    const updated = selectedProducts.map((p) => {
      if (p.productId === productId) {
        const subtotal = p.unitPrice * p.quantity;
        const discountAmount = (subtotal * newDiscount) / 100;
        const taxableAmount = subtotal - discountAmount;
        const taxAmount = (taxableAmount * p.tax) / 100;
        const total = taxableAmount + taxAmount;

        return {
          ...p,
          discount: newDiscount,
          subtotal: total,
        };
      }
      return p;
    });

    onProductsChange(updated);
  };

  const handleRemoveProduct = (productId) => {
    onProductsChange(selectedProducts.filter((p) => p.productId !== productId));
  };

  const getAvailableStock = (productId) => {
    return stockData[productId] || 0;
  };

  const hasStockIssue = (productId, quantity) => {
    const available = getAvailableStock(productId);
    return quantity > available;
  };

  return (
    <Box>
      {/* Product Search */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'grey.200',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>🔍</Typography>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Buscar Productos
          </Typography>
        </Box>
        <TextField
          fullWidth
          placeholder="Buscar por nombre, SKU o categoría..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ 
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            }
          }}
        />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
            {filteredProducts.map((product) => {
              const isSelected = selectedProducts.some((p) => p.productId === product.id);
              return (
                <Box
                  key={product.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 2,
                    mb: 1.5,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: isSelected ? 'primary.main' : 'grey.200',
                    bgcolor: isSelected ? 'rgba(102, 126, 234, 0.08)' : 'white',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      bgcolor: isSelected ? 'rgba(102, 126, 234, 0.12)' : 'grey.50',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {product.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                      <Chip label={product.sku} size="small" variant="outlined" />
                      {product.category && (
                        <Chip label={product.category} size="small" variant="outlined" />
                      )}
                      <Chip
                        label={formatCurrency(product.price)}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                  <Button
                    variant={isSelected ? 'outlined' : 'contained'}
                    startIcon={<AddIcon />}
                    onClick={() => handleAddProduct(product)}
                    size="small"
                  >
                    {isSelected ? 'Agregar más' : 'Agregar'}
                  </Button>
                </Box>
              );
            })}
            {filteredProducts.length === 0 && (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                No se encontraron productos
              </Typography>
            )}
          </Box>
        )}
      </Paper>

      {/* Selected Products */}
      {selectedProducts.length > 0 && (
        <Paper 
          elevation={0}
          sx={{ 
            p: 3,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'grey.200',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>📦</Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Productos Seleccionados ({selectedProducts.length})
            </Typography>
          </Box>

          {!warehouseId && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Seleccione un almacén para verificar disponibilidad de stock
            </Alert>
          )}

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Producto</TableCell>
                  <TableCell align="right">Precio Unit.</TableCell>
                  <TableCell align="center">Cantidad</TableCell>
                  <TableCell align="right">Descuento %</TableCell>
                  <TableCell align="right">Stock Disp.</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedProducts.map((item) => {
                  const stockIssue = warehouseId && hasStockIssue(item.productId, item.quantity);
                  return (
                    <TableRow
                      key={item.productId}
                      sx={{ bgcolor: stockIssue ? 'error.50' : 'transparent' }}
                    >
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {item.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.sku}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                          <TextField
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleUpdatePrice(item.productId, parseFloat(e.target.value) || 0)
                          }
                          size="small"
                          sx={{ width: 120 }}
                          inputProps={{ min: 0, step: 0.01 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <IconButton
                            size="small"
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                          >
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                          <TextField
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              handleUpdateQuantity(item.productId, parseInt(e.target.value) || 0)
                            }
                            size="small"
                            sx={{ width: 70, mx: 1 }}
                            inputProps={{ min: 1, style: { textAlign: 'center' } }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <TextField
                          type="number"
                          value={item.discount}
                          onChange={(e) =>
                            handleUpdateDiscount(item.productId, parseFloat(e.target.value) || 0)
                          }
                          size="small"
                          sx={{ width: 90 }}
                          inputProps={{ min: 0, max: 100, step: 0.1 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        {warehouseId ? (
                          <Chip
                            label={getAvailableStock(item.productId)}
                            size="small"
                            color={stockIssue ? 'error' : 'success'}
                            variant="outlined"
                          />
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            -
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatCurrency(item.subtotal)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveProduct(item.productId)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
};

export default ProductSelector;
