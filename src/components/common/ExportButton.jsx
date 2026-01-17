import { Button, Tooltip } from '@mui/material';
import { FileDownload as FileDownloadIcon } from '@mui/icons-material';
import { useLanguage } from '../../context/LanguageContext';

const ExportButton = ({ data, fileName = 'inventory.csv' }) => {
  const { t } = useLanguage();

  const handleExport = () => {
    if (!data || data.length === 0) return;

    // Get headers from first item
    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(item =>
        headers
          .map(header => {
            const value = item[header];
            // Escape quotes and wrap in quotes if contains comma
            if (typeof value === 'string' && value.includes(',')) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(',')
      ),
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Tooltip title={t('export') || 'Export to CSV'}>
      <Button
        variant="outlined"
        size="small"
        startIcon={<FileDownloadIcon />}
        onClick={handleExport}
        disabled={!data || data.length === 0}
      >
        {t('export') || 'Export'}
      </Button>
    </Tooltip>
  );
};

export default ExportButton;
