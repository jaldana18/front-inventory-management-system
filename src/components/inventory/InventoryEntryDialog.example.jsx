/**
 * Example Usage: InventoryEntryDialog Component
 *
 * This dialog matches the design from mock/neuva_entrada_inventario.png
 * with a clean, single-page form for registering inventory entries.
 */

import { useState } from 'react';
import { Button } from '@mui/material';
import { MoveToInbox as LoadInventoryIcon } from '@mui/icons-material';
import InventoryEntryDialog from './InventoryEntryDialog';
import toast from 'react-hot-toast';

const InventoryEntryExample = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  // Example products data - replace with actual API call
  const products = [
    { id: '1', name: 'Laptop Dell Inspiron 15' },
    { id: '2', name: 'Monitor Samsung 24"' },
    { id: '3', name: 'Teclado Mecánico Logitech' },
    { id: '4', name: 'Mouse Inalámbrico HP' },
  ];

  // Example warehouses data - replace with actual API call
  const warehouses = [
    { id: '1', name: 'Almacén Principal', code: 'cod-1' },
    { id: '2', name: 'Almacén Secundario', code: 'cod-2' },
    { id: '3', name: 'Almacén Norte', code: 'cod-3' },
  ];

  const handleSubmit = async (data) => {
    try {
      console.log('Inventory Entry Data:', data);

      // Example API call - replace with actual service
      // await inventoryService.createEntry(data);

      toast.success('Entrada de inventario registrada exitosamente');
      // Refresh inventory data here
    } catch (error) {
      console.error('Error creating inventory entry:', error);
      toast.error('Error al registrar entrada de inventario');
    }
  };

  return (
    <>
      <Button
        variant="contained"
        startIcon={<LoadInventoryIcon />}
        onClick={() => setDialogOpen(true)}
        sx={{
          px: 3,
          py: 1.25,
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
          '&:hover': {
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            boxShadow: '0 6px 16px rgba(16, 185, 129, 0.35)',
          },
        }}
      >
        Nueva Entrada de Inventario
      </Button>

      <InventoryEntryDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
        products={products}
        warehouses={warehouses}
      />
    </>
  );
};

export default InventoryEntryExample;

/**
 * Integration with InventoryPage:
 *
 * 1. Import the component:
 *    import InventoryEntryDialog from '../components/inventory/InventoryEntryDialog';
 *
 * 2. Add state for dialog:
 *    const [inventoryEntryOpen, setInventoryEntryOpen] = useState(false);
 *
 * 3. Add button to open dialog:
 *    <Button
 *      variant="contained"
 *      startIcon={<LoadInventoryIcon />}
 *      onClick={() => setInventoryEntryOpen(true)}
 *    >
 *      Nueva Entrada
 *    </Button>
 *
 * 4. Add dialog component:
 *    <InventoryEntryDialog
 *      open={inventoryEntryOpen}
 *      onClose={() => setInventoryEntryOpen(false)}
 *      onSubmit={handleInventoryEntrySubmit}
 *      products={products}
 *      warehouses={warehouses}
 *    />
 *
 * 5. Handle submission:
 *    const handleInventoryEntrySubmit = async (data) => {
 *      try {
 *        await inventoryService.createEntry(data);
 *        queryClient.invalidateQueries({ queryKey: ['inventory'] });
 *        toast.success('Entrada registrada exitosamente');
 *      } catch (error) {
 *        toast.error('Error al registrar entrada');
 *      }
 *    };
 */
