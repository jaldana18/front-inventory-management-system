import { useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  Typography,
  Stack,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useLanguage } from '../../context/LanguageContext';

const InventoryTable = ({ data, onEdit, onDelete, onView }) => {
  const { t } = useLanguage();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getCategoryColor = (category) => {
    const colors = {
      Electronics: '#6366f1',
      Clothing: '#ec4899',
      'Food & Beverages': '#10b981',
      'Office Supplies': '#f59e0b',
      Furniture: '#8b5cf6',
      Tools: '#3b82f6',
      Other: '#64748b',
    };
    return colors[category] || '#64748b';
  };

  const paginatedData = useMemo(() => {
    return data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [data, page, rowsPerPage]);

  if (data.length === 0) {
    return (
      <Paper
        sx={{
          p: 8,
          textAlign: 'center',
          borderRadius: 3,
        }}
      >
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {t('noInventoryItemsFound') || 'No inventory items found'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('startAddingItems') || 'Start by adding your first inventory item'}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: 'none',
        border: '1px solid #e2e8f0',
      }}
    >
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ pl: 1.5, py: 1, fontSize: '0.7rem', fontWeight: 600 }}>{t('name').toUpperCase()}</TableCell>
              <TableCell sx={{ py: 1, fontSize: '0.7rem', fontWeight: 600 }}>{t('category').toUpperCase()}</TableCell>
              <TableCell align="right" sx={{ py: 1, fontSize: '0.7rem', fontWeight: 600 }}>{t('quantity').toUpperCase()}</TableCell>
              <TableCell align="right" sx={{ py: 1, fontSize: '0.7rem', fontWeight: 600 }}>{t('price').toUpperCase()}</TableCell>
              <TableCell sx={{ py: 1, fontSize: '0.7rem', fontWeight: 600 }}>{t('status').toUpperCase()}</TableCell>
              <TableCell sx={{ py: 1, fontSize: '0.7rem', fontWeight: 600 }}>{t('updatedAt').toUpperCase()}</TableCell>
              <TableCell align="right" sx={{ pr: 1.5, py: 1, fontSize: '0.7rem', fontWeight: 600 }}>
                {t('actions').toUpperCase()}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((item) => (
              <TableRow
                key={item.id}
                hover
                sx={{
                  cursor: 'pointer',
                  '&:last-child td': { border: 0 },
                }}
                onClick={() => onView(item)}
              >
                <TableCell sx={{ pl: 1.5, py: 0.75 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, lineHeight: 1.2, fontSize: '0.8rem' }}
                      >
                        {item.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          fontSize: '0.65rem',
                        }}
                      >
                        {item.sku}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell sx={{ py: 0.75 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: getCategoryColor(item.category),
                      fontWeight: 500,
                      fontSize: '0.7rem',
                    }}
                  >
                    {item.category}
                  </Typography>
                </TableCell>
                <TableCell align="right" sx={{ py: 0.75 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      fontSize: '0.8rem',
                    }}
                  >
                    {item.currentStock ? item.currentStock : 0}
                  </Typography>
                </TableCell>
                <TableCell align="right" sx={{ py: 0.75 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>
                    ${(item.price || 0).toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 0.75 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    —
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 0.75 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    {format(new Date(item.updatedAt), 'MMM dd, yyyy')}
                  </Typography>
                </TableCell>
                <TableCell align="right" sx={{ pr: 1.5, py: 0.75 }}>
                  <Stack direction="row" spacing={0.25} justifyContent="flex-end">
                    <Tooltip title={t('edit')}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(item);
                        }}
                        sx={{
                          color: 'primary.main',
                          p: 0.25,
                          '&:hover': {
                            backgroundColor: 'rgba(99, 102, 241, 0.08)',
                          },
                        }}
                      >
                        <EditIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('delete')}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(item);
                        }}
                        sx={{
                          color: 'error.main',
                          p: 0.25,
                          '&:hover': {
                            backgroundColor: 'rgba(239, 68, 68, 0.08)',
                          },
                        }}
                      >
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      />
    </Paper>
  );
};

export default InventoryTable;
