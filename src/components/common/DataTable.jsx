import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Box,
  CircularProgress,
  Typography,
  Paper,
} from '@mui/material';
import { Inbox as InboxIcon } from '@mui/icons-material';

export const DataTable = ({
  columns,
  data,
  loading,
  pagination,
  emptyMessage = 'No hay datos disponibles',
}) => {
  // Ensure data is always an array
  const safeData = Array.isArray(data) ? data : [];

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (safeData.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 400,
          py: 8,
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: 'grey.100',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
          }}
        >
          <InboxIcon sx={{ fontSize: 40, color: 'grey.400' }} />
        </Box>
        <Typography variant="h6" color="text.secondary" fontWeight={500}>
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'grey.50' }}>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {safeData.map((row, index) => (
              <TableRow
                key={row.id || index}
                sx={{
                  '&:hover': {
                    backgroundColor: 'grey.50',
                  },
                  '&:last-child td': {
                    borderBottom: 0,
                  },
                }}
              >
                {columns.map((column) => (
                  <TableCell key={column.id} align={column.align || 'left'}>
                    {column.render ? column.render(row) : row[column.id]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {pagination && (
        <TablePagination
          component="div"
          count={pagination.total}
          page={pagination.page - 1}
          onPageChange={(event, newPage) => pagination.onPageChange(newPage + 1)}
          rowsPerPage={pagination.limit}
          onRowsPerPageChange={(event) => {
            pagination.onLimitChange(parseInt(event.target.value, 10));
            pagination.onPageChange(1);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
          sx={{
            borderTop: '1px solid',
            borderColor: 'divider',
            '.MuiTablePagination-toolbar': {
              px: 2,
            },
          }}
        />
      )}
    </Box>
  );
};
