import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Chip,
  CircularProgress,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { appointmentsAPI } from '../api/appointments';
import { Pagination } from '../components/common/Pagination';

const ROWS_PER_PAGE = 10;
const STATUS_COLOR = { Booked: 'primary', Completed: 'success', Cancelled: 'error' };

const SummaryCard = ({ label, value, color }) => (
  <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
    <Typography variant="body2" color="text.secondary" gutterBottom>{label}</Typography>
    <Typography variant="h4" fontWeight={700} color={color}>{value}</Typography>
  </Paper>
);

const AdminDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const data = await appointmentsAPI.list(params);
      setAppointments(data.data ?? []);
      setPage(1);
    } catch (err) {
      setError(err?.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await appointmentsAPI.updateStatus(id, status);
      setAppointments((prev) =>
        prev.map((a) => (a.appointmentId === id ? { ...a, status } : a))
      );
    } catch {
      setError('Failed to update appointment status');
    }
  };

  const counts = {
    Total: appointments.length,
    Booked: appointments.filter((a) => a.status === 'Booked').length,
    Completed: appointments.filter((a) => a.status === 'Completed').length,
    Cancelled: appointments.filter((a) => a.status === 'Cancelled').length,
  };

  const totalPages = Math.max(1, Math.ceil(appointments.length / ROWS_PER_PAGE));
  const displayed = useMemo(
    () => appointments.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE),
    [appointments, page]
  );

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" fontWeight={700} mb={0.5}>Admin Panel</Typography>
        <Typography variant="body1" color="text.secondary">View and manage all appointment bookings.</Typography>
      </Box>

      <Grid container spacing={2.5}>
        {[
          { label: 'Total', value: counts.Total, color: 'text.primary' },
          { label: 'Booked', value: counts.Booked, color: 'primary.main' },
          { label: 'Completed', value: counts.Completed, color: 'success.main' },
          { label: 'Cancelled', value: counts.Cancelled, color: 'error.main' },
        ].map(({ label, value, color }) => (
          <Grid size={{ xs: 6, sm: 3 }} key={label}>
            <SummaryCard label={label} value={loading ? '—' : value} color={color} />
          </Grid>
        ))}
      </Grid>

      <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2.5 }}>
            <Box>
              <Typography variant="h6" fontWeight={700}>All Appointments</Typography>
              <Typography variant="body2" color="text.secondary">View and update status of all bookings</Typography>
            </Box>
            <TextField
              select label="Filter by Status"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              sx={{ minWidth: 160 }} size="small"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Booked">Booked</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
            </TextField>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {loading ? (
            <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
          ) : (
            <>
              <TableContainer sx={{ overflowX: 'auto', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                <Table sx={{ minWidth: 900 }}>
                  <TableHead sx={{ bgcolor: 'grey.50' }}>
                    <TableRow>
                      {['Appt ID', 'Patient', 'Doctor', 'Dept', 'Type', 'Disease', 'Date', 'Time', 'Status', 'Action'].map((h) => (
                        <TableCell key={h} sx={{ fontWeight: 700, py: 1.5, whiteSpace: 'nowrap' }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {displayed.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                          No appointments found
                        </TableCell>
                      </TableRow>
                    ) : (
                      displayed.map((a) => (
                        <TableRow key={a.appointmentId} hover>
                          <TableCell sx={{ fontWeight: 600, color: 'primary.main', whiteSpace: 'nowrap' }}>{a.appointmentId}</TableCell>
                          <TableCell>{a.patientName}</TableCell>
                          <TableCell>{a.doctorName}</TableCell>
                          <TableCell>{a.department}</TableCell>
                          <TableCell>{a.appointmentType}</TableCell>
                          <TableCell>{a.disease}</TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>{a.appointmentDate}</TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>{a.appointmentTime}</TableCell>
                          <TableCell>
                            <Chip label={a.status} color={STATUS_COLOR[a.status] ?? 'default'} size="small" />
                          </TableCell>
                          <TableCell>
                            {a.status === 'Booked' && (
                              <TextField
                                select value={a.status} size="small" sx={{ minWidth: 140 }}
                                onChange={(e) => handleStatusUpdate(a.appointmentId, e.target.value)}
                              >
                                <MenuItem value="Booked">Booked</MenuItem>
                                <MenuItem value="Completed">Completed</MenuItem>
                                <MenuItem value="Cancelled">Cancelled</MenuItem>
                              </TextField>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={appointments.length}
                rowsPerPage={ROWS_PER_PAGE}
                onPageChange={setPage}
              />
            </>
          )}
        </Box>
      </Paper>
    </Stack>
  );
};

export default AdminDashboard;
