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
  Chip,
  Tooltip,
  Typography,
  Avatar,
  Stack,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

const InventoryTable = ({ data, onEdit, onDelete, onView }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (quantity, minStock) => {
    if (quantity === 0) return 'error';
    if (quantity <= minStock) return 'warning';
    return 'success';
  };

  const getStatusLabel = (quantity, minStock) => {
    if (quantity === 0) return 'Out of Stock';
    if (quantity <= minStock) return 'Low Stock';
    return 'In Stock';
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
          No inventory items found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Start by adding your first inventory item
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      }}
    >
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ pl: 3 }}>PRODUCT</TableCell>
              <TableCell>CATEGORY</TableCell>
              <TableCell align="right">QUANTITY</TableCell>
              <TableCell align="right">PRICE</TableCell>
              <TableCell>STATUS</TableCell>
              <TableCell>UPDATED</TableCell>
              <TableCell align="right" sx={{ pr: 3 }}>
                ACTIONS
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
                <TableCell sx={{ pl: 3 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        width: 40,
                        height: 40,
                        fontSize: '0.875rem',
                        fontWeight: 600,
                      }}
                    >
                      {item.name.substring(0, 2).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600, mb: 0.25 }}
                      >
                        {item.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          fontFamily: 'monospace',
                        }}
                      >
                        {item.sku}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Chip
                    label={item.category}
                    size="small"
                    sx={{
                      bgcolor: `${getCategoryColor(item.category)}15`,
                      color: getCategoryColor(item.category),
                      fontWeight: 500,
                      border: 'none',
                    }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color:
                        item.quantity === 0
                          ? 'error.main'
                          : item.quantity <= item.minStock
                          ? 'warning.main'
                          : 'text.primary',
                    }}
                  >
                    {item.quantity}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    ${item.unitPrice.toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(item.quantity, item.minStock)}
                    color={getStatusColor(item.quantity, item.minStock)}
                    size="small"
                    sx={{
                      fontWeight: 500,
                      height: 24,
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {format(new Date(item.updatedAt), 'MMM dd, yyyy')}
                  </Typography>
                </TableCell>
                <TableCell align="right" sx={{ pr: 3 }}>
                  <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(item);
                        }}
                        sx={{
                          color: 'primary.main',
                          '&:hover': {
                            backgroundColor: 'rgba(99, 102, 241, 0.08)',
                          },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(item);
                        }}
                        sx={{
                          color: 'error.main',
                          '&:hover': {
                            backgroundColor: 'rgba(239, 68, 68, 0.08)',
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      sx={{
                        color: 'text.secondary',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        },
                      }}
                    >
                      <MoreIcon fontSize="small" />
                    </IconButton>
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
