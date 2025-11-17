/**
 * EJEMPLO DE USO: BulkInventoryUploadDialog
 * 
 * Este archivo muestra cómo integrar el componente de carga masiva de inventario
 * en la página de inventario o cualquier otra página.
 */

import { useState } from 'react';
import { Button } from '@mui/material';
import { CloudUpload as UploadIcon } from '@mui/icons-material';
import BulkInventoryUploadDialog from './BulkInventoryUploadDialog';

const InventoryPageExample = () => {
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);

  const handleBulkUploadSuccess = () => {
    // Recargar la tabla de inventario o hacer cualquier actualización necesaria
    console.log('Carga masiva completada exitosamente');
    // Por ejemplo: refetch de datos, actualizar estado, etc.
  };

  return (
    <div>
      {/* Botón para abrir el diálogo de carga masiva */}
      <Button
        variant="contained"
        color="primary"
        startIcon={<UploadIcon />}
        onClick={() => setBulkUploadOpen(true)}
      >
        Carga masiva
      </Button>

      {/* Componente de carga masiva */}
      <BulkInventoryUploadDialog
        open={bulkUploadOpen}
        onClose={() => setBulkUploadOpen(false)}
        onSuccess={handleBulkUploadSuccess}
      />
    </div>
  );
};

export default InventoryPageExample;

/**
 * INTEGRACIÓN EN InventoryPage.jsx:
 * 
 * 1. Importar el componente:
 *    import BulkInventoryUploadDialog from '../components/inventory/BulkInventoryUploadDialog';
 * 
 * 2. Añadir estado para controlar el diálogo:
 *    const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
 * 
 * 3. Añadir botón en la barra de acciones (junto a "Nuevo producto" por ejemplo):
 *    <Button
 *      variant="outlined"
 *      startIcon={<CloudUpload />}
 *      onClick={() => setBulkUploadOpen(true)}
 *    >
 *      Carga masiva
 *    </Button>
 * 
 * 4. Añadir el componente al final del JSX:
 *    <BulkInventoryUploadDialog
 *      open={bulkUploadOpen}
 *      onClose={() => setBulkUploadOpen(false)}
 *      onSuccess={() => {
 *        // Recargar datos del inventario
 *        fetchInventory();
 *      }}
 *    />
 */

/**
 * FORMATO ESPERADO DEL ARCHIVO EXCEL:
 * 
 * El backend debería generar una plantilla con las siguientes columnas:
 * 
 * | SKU Producto | Nombre Producto | Código Almacén | Tipo | Motivo | Cantidad | Costo Unitario | Referencia | Ubicación | Notas |
 * |--------------|-----------------|----------------|------|--------|----------|----------------|------------|-----------|-------|
 * | PROD-001     | Laptop Dell     | WH-001         | inbound | purchase | 10 | 999.99 | PO-12345 | A-12 | Compra inicial |
 * | PROD-002     | Mouse Logitech  | WH-001         | outbound | sale | 5 | 25.50 | INV-001 | B-05 | Venta cliente |
 * 
 * Tipos de transacción permitidos:
 * - inbound: Entrada de inventario
 * - outbound: Salida de inventario
 * - adjustment: Ajuste de inventario
 * - transfer: Transferencia entre almacenes
 * 
 * Motivos permitidos:
 * - purchase: Compra
 * - sale: Venta
 * - return: Devolución
 * - damaged: Dañado
 * - lost: Pérdida
 * - found: Encontrado
 * - correction: Corrección
 * - initial_stock: Stock inicial
 * - transfer_in: Transferencia entrada
 * - transfer_out: Transferencia salida
 * - other: Otro
 */
