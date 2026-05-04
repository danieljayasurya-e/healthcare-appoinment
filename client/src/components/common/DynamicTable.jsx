import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
} from '@mui/material';

/**
 * MUI-based generic data table.
 *
 * @param {{ key: string, header: string, render?: fn, headerClassName?: string, cellClassName?: string }[]} columns
 * @param {object[]} data
 * @param {string|function} rowKey
 * @param {string} emptyMessage
 */
export const DynamicTable = ({
  columns,
  data,
  rowKey = 'id',
  emptyMessage = 'No records found.',
}) => {
  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell
                key={col.key}
                className={col.headerClassName}
                sx={{
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  color: 'primary.dark',
                  bgcolor: 'primary.50',
                  whiteSpace: 'nowrap',
                  py: 1.5,
                }}
              >
                {col.header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                sx={{ textAlign: 'center', py: 6 }}
              >
                <Typography variant="body2" color="text.secondary">
                  {emptyMessage}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => (
              <TableRow
                key={
                  typeof rowKey === 'function'
                    ? rowKey(row)
                    : (row[rowKey] ?? index)
                }
                hover
                sx={{ '&:last-child td': { borderBottom: 0 } }}
              >
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    className={col.cellClassName}
                    sx={{ fontSize: '0.875rem', py: 1.4 }}
                  >
                    {col.render ? col.render(row, index) : row[col.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DynamicTable;
