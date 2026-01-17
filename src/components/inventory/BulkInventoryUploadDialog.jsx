import { useState, useRef } from 'react';
import {
  Upload,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Download,
  X,
  Eye,
  ChevronDown,
  Package,
} from 'lucide-react';
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
      
      console.log('👁️ Preview response:', response);
      
      // El interceptor ya devuelve response.data
      const previewData = response.data || response;
      
      console.log('📋 Preview data:', previewData);

      setPreview(previewData);
      setActiveStep(1);
      toast.success('Vista previa generada correctamente');
    } catch (error) {
      console.error('❌ Error generating preview:', error);
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

      console.log('📦 Bulk upload response:', response);

      // El interceptor de axios ya devuelve response.data
      // Estructura esperada: { success: true, data: { successCount, errorCount, errors, ... }, message: "..." }
      const resultData = response.data || response;
      
      console.log('📊 Result data:', resultData);

      // Validar que tengamos datos
      if (!resultData || (resultData.successCount === undefined && resultData.errorCount === undefined)) {
        console.error('❌ Invalid response structure:', response);
        throw new Error('Formato de respuesta inválido del servidor');
      }

      setUploadResult(resultData);
      setActiveStep(2);

      const hasErrors = (resultData.errorCount || 0) > 0;
      const successCount = resultData.successCount || 0;

      if (!hasErrors && successCount > 0) {
        toast.success(response.message || `${successCount} registros procesados exitosamente`);
        
        // Llamar onSuccess y cerrar después de un breve delay
        setTimeout(() => {
          if (onSuccess) {
            console.log('✅ Calling onSuccess callback');
            onSuccess();
          }
          handleClose();
        }, 1500);
      } else if (hasErrors && successCount > 0) {
        toast.warning(response.message || `${successCount} procesados, ${resultData.errorCount} con errores`);
      } else if (hasErrors && successCount === 0) {
        toast.error('No se pudo procesar ningún registro. Revise los errores.');
      }
    } catch (error) {
      console.error('❌ Error uploading file:', error);
      toast.error(error.message || error.response?.data?.message || 'Error al procesar el archivo');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <div className="space-y-4">
            {/* Instrucciones */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-900 mb-2">Instrucciones:</p>
              <div className="text-sm text-blue-800 space-y-1">
                <p>1. Descargue la plantilla de Excel</p>
                <p>2. Complete los datos de las transacciones de inventario</p>
                <p>3. Suba el archivo completado</p>
                <p>4. Revise la vista previa antes de confirmar</p>
              </div>
            </div>

            {/* Botón descargar plantilla */}
            <button
              onClick={handleDownloadTemplate}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-semibold rounded-lg transition-colors"
            >
              <Download className="h-5 w-5" />
              Descargar plantilla de Excel
            </button>

            {/* Zona de carga */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 text-center border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                file
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 bg-white hover:border-indigo-500 hover:bg-indigo-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xls,.xlsx"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Upload
                className={`mx-auto mb-3 ${file ? 'text-green-500' : 'text-gray-400'}`}
                size={64}
              />
              <p className="text-lg font-semibold text-gray-900 mb-1">
                {file ? file.name : 'Haga clic o arrastre el archivo aquí'}
              </p>
              <p className="text-sm text-gray-500">Archivos permitidos: .xls, .xlsx</p>
              {file && (
                <span className="inline-block mt-3 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  {(file.size / 1024).toFixed(2)} KB
                </span>
              )}
            </div>

            {/* Checkbox actualizar existente */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={updateExisting}
                onChange={(e) => setUpdateExisting(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">
                Actualizar inventario existente (basado en Código y Almacén)
              </span>
            </label>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            {preview && (
              <>
                {/* Resumen */}
                <div
                  className={`border rounded-lg p-4 ${
                    preview.summary?.invalidRows > 0
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-green-50 border-green-200'
                  }`}
                >
                  <p className="text-sm font-semibold text-gray-900 mb-3">Resumen de la carga:</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {preview.summary?.totalRows || 0} filas totales
                    </span>
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      {preview.summary?.validRows || 0} válidas
                    </span>
                    {(preview.summary?.invalidRows || 0) > 0 && (
                      <span className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                        {preview.summary.invalidRows} con errores
                      </span>
                    )}
                    {(preview.summary?.productsToCreate || 0) > 0 && (
                      <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                        {preview.summary.productsToCreate} productos a crear
                      </span>
                    )}
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      Cantidad total: {preview.summary?.totalQuantity || 0}
                    </span>
                    <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                      Costo total: ${preview.summary?.totalCost?.toLocaleString('es-CO') || 0}
                    </span>
                  </div>
                </div>

                {/* Errores */}
                {preview.errors && preview.errors.length > 0 && (
                  <div>
                    <button
                      onClick={() => setShowErrors(!showErrors)}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Ver errores ({preview.errors.length})
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          showErrors ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {showErrors && (
                      <div className="mt-2 border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto bg-white">
                        <ul className="space-y-2">
                          {preview.errors.map((error, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-medium text-gray-900">
                                  Fila {error.row}
                                  {error.sku ? `: SKU ${error.sku}` : ''}
                                </p>
                                <p className="text-gray-600">{error.message}</p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <div className="border-t border-gray-200 my-4" />

                {/* Productos a crear */}
                {preview.createdProducts && preview.createdProducts.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-2">
                      Productos que se crearán:
                    </p>
                    <div className="border border-indigo-200 rounded-lg p-3 max-h-48 overflow-y-auto bg-indigo-50">
                      <ul className="space-y-2">
                        {preview.createdProducts.map((product, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-gray-900">{product.name}</p>
                              <p className="text-gray-600">SKU: {product.sku}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Info adicional */}
                {(preview.summary?.validRows || 0) > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      Se procesarán {preview.summary.validRows} filas válidas con un total de{' '}
                      {preview.summary.totalQuantity} unidades por un costo de $
                      {preview.summary.totalCost?.toLocaleString('es-CO')}.
                    </p>
                    {(preview.summary.productsAffected || 0) > 0 && (
                      <p className="text-sm text-blue-900 mt-2">
                        Se afectarán {preview.summary.productsAffected} producto(s) existente(s).
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            {uploadResult && (
              <>
                {/* Resultado */}
                <div
                  className={`border rounded-lg p-4 ${
                    uploadResult.errorCount === 0
                      ? 'bg-green-50 border-green-200'
                      : 'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  <p className="text-sm font-semibold text-gray-900 mb-3">Carga completada</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      {uploadResult.successCount} procesados
                    </span>
                    {uploadResult.errorCount > 0 && (
                      <span className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                        {uploadResult.errorCount} errores
                      </span>
                    )}
                  </div>
                </div>

                {/* Errores */}
                {uploadResult.errors && uploadResult.errors.length > 0 && (
                  <div className="border border-gray-200 rounded-lg p-4 max-h-72 overflow-y-auto bg-white">
                    <p className="text-sm font-semibold text-gray-900 mb-3">
                      Errores encontrados:
                    </p>
                    <ul className="space-y-2">
                      {uploadResult.errors.map((error, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-gray-900">
                              Fila {error.row}
                              {error.sku ? `: SKU ${error.sku}` : ''}
                            </p>
                            <p className="text-gray-600">{error.message}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12 md:pt-20 pointer-events-none overflow-y-auto">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[calc(100vh-6rem)] overflow-y-auto pointer-events-auto animate-in zoom-in-95 duration-200 my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-gray-200 pb-4 mb-2 px-6 pt-6 sticky top-0 bg-white z-10">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-6 w-6 text-indigo-600" />
                <h2 className="text-2xl font-bold text-indigo-600">
                  Carga masiva de inventario
                </h2>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-6">
            {/* Stepper */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                {STEPS.map((label, index) => (
                  <div key={label} className="flex-1 flex items-center">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                          index <= activeStep
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <p
                        className={`text-xs mt-2 text-center font-medium ${
                          index <= activeStep ? 'text-indigo-600' : 'text-gray-500'
                        }`}
                      >
                        {label}
                      </p>
                    </div>
                    {index < STEPS.length - 1 && (
                      <div
                        className={`h-1 flex-1 mx-2 rounded transition-colors ${
                          index < activeStep ? 'bg-indigo-600' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Progress bar */}
            {loading && (
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-indigo-600 h-2 rounded-full animate-pulse" style={{ width: '100%' }} />
                </div>
              </div>
            )}

            {/* Step content */}
            <div className="min-h-[300px]">{renderStepContent()}</div>

            {/* Footer */}
            <div className="border-t border-gray-200 pt-6 mt-6 flex gap-3 justify-end">
              <button
                onClick={handleClose}
                disabled={loading}
                className="px-6 h-11 border-2 border-gray-300 hover:bg-gray-50 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {activeStep === 2 ? 'Cerrar' : 'Cancelar'}
              </button>

              {activeStep === 0 && (
                <button
                  onClick={handlePreview}
                  disabled={!file || loading}
                  className="px-6 h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Eye className="h-5 w-5" />
                  Vista previa
                </button>
              )}

              {activeStep === 1 && (
                <>
                  <button
                    onClick={() => setActiveStep(0)}
                    disabled={loading}
                    className="px-6 h-11 border-2 border-gray-300 hover:bg-gray-50 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Atrás
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={
                      !preview ||
                      loading ||
                      (preview.summary &&
                        preview.summary.validRows !== undefined &&
                        preview.summary.validRows === 0)
                    }
                    className="px-6 h-11 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Upload className="h-5 w-5" />
                    Confirmar carga
                  </button>
                </>
              )}

              {activeStep === 2 && uploadResult?.errorCount === 0 && (
                <button
                  onClick={handleClose}
                  className="px-6 h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Finalizar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BulkInventoryUploadDialog;
