import { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  Stack,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
  Visibility as PreviewIcon,
  ExpandMore as ExpandMoreIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
import { inventoryService } from '../../services/inventory.service';
import toast from 'react-hot-toast';

const STEPS = ['Seleccionar archivo', 'Vista previa', 'Confirmar carga'];

const BulkInventoryUploadDialog = ({ open, onClose, onSuccess }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [updateExisting, setUpdateExisting] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const fileInputRef = useRef(null);

  const handleReset = () => {
    setActiveStep(0);
    setFile(null);
    setPreview(null);
    setUploadResult(null);
    setUpdateExisting(false);
    setShowErrors(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleDownloadTemplate = async () => {
    try {
      await inventoryService.downloadTemplate();
      toast.success('Plantilla descargada exitosamente');
    } catch (error) {
      console.error('Error downloading template:', error);
      toast.error('Error al descargar la plantilla');
    }
  };

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ];

      if (!validTypes.includes(selectedFile.type)) {
        toast.error('Por favor seleccione un archivo Excel (.xls o .xlsx)');
        return;
      }

      setFile(selectedFile);
      setPreview(null);
      setUploadResult(null);
    }
  };

  const handlePreview = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const response = await inventoryService.bulkPreview(file, updateExisting);
      setPreview(response.data.data);
      setActiveStep(1);
      toast.success('Vista previa generada correctamente');
    } catch (error) {
      console.error('Error generating preview:', error);
      toast.error(error.response?.data?.message || 'Error al generar la vista previa');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const response = await inventoryService.bulkUpload(file, {
        updateExisting,
        skipErrors: true,
        dryRun: false,
      });

      setUploadResult(response.data.data);
      setActiveStep(2);

      const hasErrors = response.data.data.errorCount > 0;
      if (!hasErrors) {
        toast.success(response.data.message);
        setTimeout(() => {
          if (onSuccess) onSuccess();
          handleClose();
        }, 2000);
      } else {
        toast.warning(response.data.message);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(error.response?.data?.message || 'Error al procesar el archivo');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                Instrucciones:
              </Typography>
              <Typography variant="caption" component="div">
                1. Descargue la plantilla de Excel
                <br />
                2. Complete los datos de las transacciones de inventario
                <br />
                3. Suba el archivo completado
                <br />
                4. Revise la vista previa antes de confirmar
              </Typography>
            </Alert>

            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadTemplate}
              fullWidth
              sx={{ mb: 3 }}
            >
              Descargar plantilla de Excel
            </Button>

            <Paper
              sx={{
                p: 4,
                textAlign: 'center',
                border: '2px dashed',
                borderColor: file ? 'success.main' : 'divider',
                backgroundColor: file ? 'success.50' : 'background.paper',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'action.hover',
                },
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xls,.xlsx"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <UploadIcon sx={{ fontSize: 64, color: file ? 'success.main' : 'action.disabled', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {file ? file.name : 'Haga clic o arrastre el archivo aquí'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Archivos permitidos: .xls, .xlsx
              </Typography>
              {file && (
                <Chip
                  label={`${(file.size / 1024).toFixed(2)} KB`}
                  color="success"
                  size="small"
                  sx={{ mt: 2 }}
                />
              )}
            </Paper>

            <Box sx={{ mt: 3 }}>
              <label>
                <input
                  type="checkbox"
                  checked={updateExisting}
                  onChange={(e) => setUpdateExisting(e.target.checked)}
                  style={{ marginRight: 8 }}
                />
                <Typography variant="body2" component="span">
                  Actualizar inventario existente (basado en Código y Almacén)
                </Typography>
              </label>
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box>
            {preview && (
              <>
                <Alert severity={preview.summary.invalidRows > 0 ? 'warning' : 'success'} sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Resumen de la carga:
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip label={`${preview.summary.totalRows} filas totales`} size="small" sx={{ mr: 1, mb: 1 }} />
                    <Chip
                      label={`${preview.summary.validRows} válidas`}
                      color="success"
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                    />
                    {preview.summary.invalidRows > 0 && (
                      <Chip
                        label={`${preview.summary.invalidRows} con errores`}
                        color="error"
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    )}
                    <Chip
                      label={`${preview.summary.willCreate} transacciones`}
                      color="primary"
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                    />
                    {preview.summary.willUpdate > 0 && (
                      <Chip
                        label={`${preview.summary.willUpdate} ajustes`}
                        color="info"
                        size="small"
                        sx={{ mb: 1 }}
                      />
                    )}
                  </Box>
                </Alert>

                {preview.errors && preview.errors.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Button
                      onClick={() => setShowErrors(!showErrors)}
                      endIcon={
                        <ExpandMoreIcon
                          sx={{
                            transform: showErrors ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: '0.3s',
                          }}
                        />
                      }
                      color="error"
                      size="small"
                    >
                      Ver errores ({preview.errors.length})
                    </Button>
                    <Collapse in={showErrors}>
                      <Paper sx={{ mt: 1, p: 2, maxHeight: 200, overflow: 'auto' }}>
                        <List dense>
                          {preview.errors.map((error, idx) => (
                            <ListItem key={idx}>
                              <ListItemIcon>
                                <ErrorIcon color="error" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText
                                primary={`Fila ${error.row}: ${error.field}`}
                                secondary={error.message}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Paper>
                    </Collapse>
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  Vista previa (primeros 10 registros):
                </Typography>

                {preview.preview.toCreate.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>
                      Transacciones a crear:
                    </Typography>
                    <Paper sx={{ mt: 1, maxHeight: 200, overflow: 'auto' }}>
                      <List dense>
                        {preview.preview.toCreate.map((transaction, idx) => (
                          <ListItem key={idx}>
                            <ListItemIcon>
                              <CheckIcon color="primary" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                              primary={`${transaction.productSku || transaction.productName}`}
                              secondary={`Tipo: ${transaction.type} - Cantidad: ${transaction.quantity} - Almacén: ${transaction.warehouseCode || 'Principal'}`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                  </Box>
                )}

                {preview.preview.toUpdate && preview.preview.toUpdate.length > 0 && (
                  <Box>
                    <Typography variant="caption" color="info.main" sx={{ fontWeight: 600 }}>
                      Ajustes de inventario:
                    </Typography>
                    <Paper sx={{ mt: 1, maxHeight: 200, overflow: 'auto' }}>
                      <List dense>
                        {preview.preview.toUpdate.map((transaction, idx) => (
                          <ListItem key={idx}>
                            <ListItemIcon>
                              <WarningIcon color="info" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                              primary={`${transaction.productSku || transaction.productName}`}
                              secondary={`Tipo: ${transaction.type} - Cantidad: ${transaction.quantity} - Almacén: ${transaction.warehouseCode || 'Principal'}`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                  </Box>
                )}
              </>
            )}
          </Box>
        );

      case 2:
        return (
          <Box>
            {uploadResult && (
              <>
                <Alert severity={uploadResult.errorCount === 0 ? 'success' : 'warning'} sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Carga completada
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip
                      label={`${uploadResult.successCount} procesados`}
                      color="success"
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    {uploadResult.errorCount > 0 && (
                      <Chip label={`${uploadResult.errorCount} errores`} color="error" size="small" />
                    )}
                  </Box>
                </Alert>

                {uploadResult.errors && uploadResult.errors.length > 0 && (
                  <Paper sx={{ p: 2, maxHeight: 300, overflow: 'auto' }}>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                      Errores encontrados:
                    </Typography>
                    <List dense>
                      {uploadResult.errors.map((error, idx) => (
                        <ListItem key={idx}>
                          <ListItemIcon>
                            <ErrorIcon color="error" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={`Fila ${error.row}: ${error.field}`} secondary={error.message} />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                )}
              </>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InventoryIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Carga masiva de inventario
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 4, mt: 2 }}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {renderStepContent()}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} disabled={loading}>
          {activeStep === 2 ? 'Cerrar' : 'Cancelar'}
        </Button>

        {activeStep === 0 && (
          <Button
            variant="contained"
            onClick={handlePreview}
            disabled={!file || loading}
            startIcon={<PreviewIcon />}
          >
            Vista previa
          </Button>
        )}

        {activeStep === 1 && (
          <>
            <Button onClick={() => setActiveStep(0)} disabled={loading}>
              Atrás
            </Button>
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={!preview || loading || preview.summary.validRows === 0}
              startIcon={<UploadIcon />}
            >
              Confirmar carga
            </Button>
          </>
        )}

        {activeStep === 2 && uploadResult?.errorCount === 0 && (
          <Button variant="contained" onClick={handleClose}>
            Finalizar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default BulkInventoryUploadDialog;
