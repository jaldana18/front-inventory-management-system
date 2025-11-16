import { useState } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  InputAdornment,
  IconButton,
  Collapse,
  Stack,
  Button,
  Chip,
  Typography,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { useLanguage } from '../../context/LanguageContext';

const InventoryFilters = ({ filters, onFilterChange, categories = [] }) => {
  const { t } = useLanguage();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = (field, value) => {
    onFilterChange({ ...filters, [field]: value });
  };

  const handleClearFilters = () => {
    onFilterChange({
      search: '',
      sku: '',
      category: '',
      isActive: '',
      minPrice: '',
      maxPrice: '',
      minStock: '',
      maxStock: '',
      lowStock: false,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.sku) count++;
    if (filters.category) count++;
    if (filters.isActive !== '') count++;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    if (filters.minStock) count++;
    if (filters.maxStock) count++;
    if (filters.lowStock) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Box sx={{ mb: 2 }}>
      {/* Basic Filters */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          placeholder={t('searchByNameOrSku') || 'Buscar por nombre o SKU...'}
          value={filters.search || ''}
          onChange={(e) => handleChange('search', e.target.value)}
          fullWidth
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: filters.search && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => handleChange('search', '')}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'white',
            },
          }}
        />

        <TextField
          select
          label={t('category') || 'Categoría'}
          value={filters.category || ''}
          onChange={(e) => handleChange('category', e.target.value)}
          size="small"
          sx={{
            minWidth: { xs: '100%', sm: 200 },
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'white',
            },
          }}
        >
          <MenuItem value="">
            <Typography variant="body2">{t('allCategories') || 'Todas las categorías'}</Typography>
          </MenuItem>
          {categories.map((cat) => (
            <MenuItem key={cat} value={cat}>
              {cat}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label={t('sortBy') || 'Ordenar por'}
          value={filters.sortBy || 'createdAt'}
          onChange={(e) => handleChange('sortBy', e.target.value)}
          size="small"
          sx={{
            minWidth: { xs: '100%', sm: 150 },
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'white',
            },
          }}
        >
          <MenuItem value="name">Nombre</MenuItem>
          <MenuItem value="sku">SKU</MenuItem>
          <MenuItem value="price">Precio</MenuItem>
          <MenuItem value="createdAt">Fecha creación</MenuItem>
        </TextField>

        <TextField
          select
          label={t('order') || 'Orden'}
          value={filters.sortOrder || 'DESC'}
          onChange={(e) => handleChange('sortOrder', e.target.value)}
          size="small"
          sx={{
            minWidth: { xs: '100%', sm: 120 },
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'white',
            },
          }}
        >
          <MenuItem value="ASC">Ascendente</MenuItem>
          <MenuItem value="DESC">Descendente</MenuItem>
        </TextField>

        <Button
          variant="outlined"
          startIcon={showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          onClick={() => setShowAdvanced(!showAdvanced)}
          size="small"
          sx={{
            minWidth: 140,
            borderColor: 'divider',
            color: 'text.secondary',
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: 'rgba(99, 102, 241, 0.04)',
            },
          }}
        >
          Filtros {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </Button>
      </Stack>

      {/* Advanced Filters */}
      <Collapse in={showAdvanced}>
        <Box
          sx={{
            p: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            backgroundColor: 'white',
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              FILTROS AVANZADOS
            </Typography>
            <Button
              size="small"
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
              sx={{ color: 'text.secondary' }}
            >
              Limpiar filtros
            </Button>
          </Stack>

          <Divider sx={{ mb: 2 }} />

          <Stack spacing={2}>
            {/* Row 1: SKU and Status */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="SKU"
                placeholder="Filtrar por SKU exacto"
                value={filters.sku || ''}
                onChange={(e) => handleChange('sku', e.target.value)}
                size="small"
                fullWidth
                InputProps={{
                  endAdornment: filters.sku && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => handleChange('sku', '')}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                select
                label="Estado"
                value={filters.isActive === '' ? '' : filters.isActive}
                onChange={(e) => handleChange('isActive', e.target.value)}
                size="small"
                fullWidth
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value={true}>Activos</MenuItem>
                <MenuItem value={false}>Inactivos</MenuItem>
              </TextField>

              <TextField
                select
                label="Stock Bajo"
                value={filters.lowStock || false}
                onChange={(e) => handleChange('lowStock', e.target.value)}
                size="small"
                fullWidth
              >
                <MenuItem value={false}>No filtrar</MenuItem>
                <MenuItem value={true}>Solo stock bajo</MenuItem>
              </TextField>
            </Stack>

            {/* Row 2: Price Range */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Precio Mínimo"
                type="number"
                placeholder="0.00"
                value={filters.minPrice || ''}
                onChange={(e) => handleChange('minPrice', e.target.value)}
                size="small"
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  endAdornment: filters.minPrice && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => handleChange('minPrice', '')}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Precio Máximo"
                type="number"
                placeholder="0.00"
                value={filters.maxPrice || ''}
                onChange={(e) => handleChange('maxPrice', e.target.value)}
                size="small"
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  endAdornment: filters.maxPrice && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => handleChange('maxPrice', '')}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>

            {/* Row 3: Stock Range */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Stock Mínimo"
                type="number"
                placeholder="0"
                value={filters.minStock || ''}
                onChange={(e) => handleChange('minStock', e.target.value)}
                size="small"
                fullWidth
                InputProps={{
                  endAdornment: filters.minStock && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => handleChange('minStock', '')}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Stock Máximo"
                type="number"
                placeholder="0"
                value={filters.maxStock || ''}
                onChange={(e) => handleChange('maxStock', e.target.value)}
                size="small"
                fullWidth
                InputProps={{
                  endAdornment: filters.maxStock && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => handleChange('maxStock', '')}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
          </Stack>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Filtros activos:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {filters.search && (
                  <Chip
                    label={`Buscar: ${filters.search}`}
                    size="small"
                    onDelete={() => handleChange('search', '')}
                  />
                )}
                {filters.sku && (
                  <Chip
                    label={`SKU: ${filters.sku}`}
                    size="small"
                    onDelete={() => handleChange('sku', '')}
                  />
                )}
                {filters.category && (
                  <Chip
                    label={`Categoría: ${filters.category}`}
                    size="small"
                    onDelete={() => handleChange('category', '')}
                  />
                )}
                {filters.isActive !== '' && (
                  <Chip
                    label={`Estado: ${filters.isActive ? 'Activo' : 'Inactivo'}`}
                    size="small"
                    onDelete={() => handleChange('isActive', '')}
                  />
                )}
                {filters.minPrice && (
                  <Chip
                    label={`Precio min: $${filters.minPrice}`}
                    size="small"
                    onDelete={() => handleChange('minPrice', '')}
                  />
                )}
                {filters.maxPrice && (
                  <Chip
                    label={`Precio max: $${filters.maxPrice}`}
                    size="small"
                    onDelete={() => handleChange('maxPrice', '')}
                  />
                )}
                {filters.minStock && (
                  <Chip
                    label={`Stock min: ${filters.minStock}`}
                    size="small"
                    onDelete={() => handleChange('minStock', '')}
                  />
                )}
                {filters.maxStock && (
                  <Chip
                    label={`Stock max: ${filters.maxStock}`}
                    size="small"
                    onDelete={() => handleChange('maxStock', '')}
                  />
                )}
                {filters.lowStock && (
                  <Chip
                    label="Solo stock bajo"
                    size="small"
                    onDelete={() => handleChange('lowStock', false)}
                  />
                )}
              </Stack>
            </Box>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};

export default InventoryFilters;
