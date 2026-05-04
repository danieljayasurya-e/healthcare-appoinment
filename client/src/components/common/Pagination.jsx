import { useMemo } from 'react';
import { Box, Button, Typography } from '@mui/material';

export const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  rowsPerPage,
  onPageChange,
}) => {
  const items = useMemo(() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, '...', totalPages];
    if (currentPage >= totalPages - 2) return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  }, [currentPage, totalPages]);

  const changePage = (page) => {
    if (typeof page !== 'number' || page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
  };

  if (totalPages <= 1 && totalItems === undefined) return null;

  const btn = {
    minWidth: 34, height: 34, px: 0,
    borderRadius: 1.5, fontWeight: 500, fontSize: '0.875rem',
    border: '1px solid', borderColor: 'divider',
  };

  const from = totalItems !== undefined && rowsPerPage ? Math.min((currentPage - 1) * rowsPerPage + 1, totalItems) : null;
  const to   = totalItems !== undefined && rowsPerPage ? Math.min(currentPage * rowsPerPage, totalItems) : null;

  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      flexWrap: 'nowrap',
      gap: 2,
      py: 1.5,
      px: 0.5,
      width: '100%',
    }}>
      {totalItems !== undefined && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          {from !== null
            ? `Showing ${from}–${to} of ${totalItems}`
            : `${totalItems} record${totalItems !== 1 ? 's' : ''}`}
        </Typography>
      )}

      {totalPages > 1 && (
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          flexWrap: 'nowrap',
          flexShrink: 0,
        }}>
          <Button
            variant="outlined" color="primary" size="small"
            onClick={() => changePage(currentPage - 1)}
            disabled={currentPage === 1}
            sx={{ ...btn, color: 'text.secondary' }}
          >
            {'<'}
          </Button>

          {items.map((item, idx) =>
            typeof item === 'number' ? (
              <Button
                key={`page-${item}-${idx}`}
                variant={item === currentPage ? 'contained' : 'outlined'}
                color="primary" size="small"
                onClick={() => changePage(item)}
                sx={{
                  ...btn,
                  ...(item === currentPage
                    ? { borderColor: 'primary.main', fontWeight: 700 }
                    : { color: 'text.secondary' }),
                }}
              >
                {item}
              </Button>
            ) : (
              <Box
                key={`ellipsis-${idx}`}
                sx={{
                  minWidth: 34,
                  height: 34,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: 'text.disabled',
                  fontSize: '0.875rem',
                }}
              >
                {item}
              </Box>
            )
          )}

          <Button
            variant="outlined" color="primary" size="small"
            onClick={() => changePage(currentPage + 1)}
            disabled={currentPage === totalPages}
            sx={{ ...btn, color: 'text.secondary' }}
          >
            {'>'}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Pagination;
