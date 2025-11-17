import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Card,
  CardActionArea,
  CardContent,
  Stack,
  IconButton,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Close as CloseIcon,
  Inventory2 as InventoryIcon,
  Category as ProductIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';

const BulkUploadSelector = ({ open, onClose, onSelectProduct, onSelectInventory }) => {
  const theme = useTheme();
  const [hoveredCard, setHoveredCard] = useState(null);

  const options = [
    {
      id: 'products',
      title: 'Productos',
      description: 'Carga masiva de productos con códigos, precios y categorías',
      icon: ProductIcon,
      color: theme.palette.primary.main,
      onClick: () => {
        onSelectProduct();
        onClose();
      },
    },
    {
      id: 'inventory',
      title: 'Inventario',
      description: 'Carga masiva de transacciones de inventario (entradas, salidas, ajustes)',
      icon: InventoryIcon,
      color: theme.palette.success.main,
      onClick: () => {
        onSelectInventory();
        onClose();
      },
    },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Seleccionar tipo de carga masiva
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Seleccione el tipo de datos que desea cargar masivamente desde un archivo Excel
        </Typography>

        <Stack spacing={2}>
          {options.map((option) => {
            const Icon = option.icon;
            const isHovered = hoveredCard === option.id;

            return (
              <Card
                key={option.id}
                elevation={isHovered ? 4 : 1}
                onMouseEnter={() => setHoveredCard(option.id)}
                onMouseLeave={() => setHoveredCard(null)}
                sx={{
                  transition: 'all 0.3s ease',
                  border: `2px solid ${isHovered ? option.color : 'transparent'}`,
                  transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
                }}
              >
                <CardActionArea onClick={option.onClick}>
                  <CardContent>
                    <Stack direction="row" spacing={3} alignItems="center">
                      <Box
                        sx={{
                          width: 64,
                          height: 64,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: alpha(option.color, 0.1),
                          transition: 'all 0.3s ease',
                          transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                        }}
                      >
                        <Icon
                          sx={{
                            fontSize: 36,
                            color: option.color,
                          }}
                        />
                      </Box>

                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            mb: 0.5,
                            color: isHovered ? option.color : 'text.primary',
                            transition: 'color 0.3s ease',
                          }}
                        >
                          {option.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {option.description}
                        </Typography>
                      </Box>

                      <ArrowIcon
                        sx={{
                          color: option.color,
                          opacity: isHovered ? 1 : 0.3,
                          transition: 'all 0.3s ease',
                          transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
                        }}
                      />
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            );
          })}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose}>Cancelar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default BulkUploadSelector;
