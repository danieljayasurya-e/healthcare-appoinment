import { useState, useEffect, useCallback } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { useAuth } from '../context/AuthContext';
import { appointmentsAPI } from '../api/appointments';

const STATUS_COLOR   = { Booked: 'primary', Completed: 'success', Cancelled: 'error' };
const FILTER_OPTIONS = ['All', 'Booked', 'Completed', 'Cancelled'];

const DetailRow = ({ label, value }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, py: 0.75 }}>
    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
      {label}
    </Typography>
    <Typography variant="body1" fontWeight={500} textAlign="right">
      {value || '-'}
    </Typography>
  </Box>
);

const SummaryCard = ({ label, value, color }) => (
  <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
    <Typography variant="body2" color="text.secondary" gutterBottom>
      {label}
    </Typography>
    <Typography variant="h4" fontWeight={700} color={color}>
      {value}
    </Typography>
  </Paper>
);

const DoctorDashboard = () => {
  const { user }    = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [filter,       setFilter]       = useState('All');
  const [selected,     setSelected]     = useState(null);
  const [dialogOpen,   setDialogOpen]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await appointmentsAPI.my();
      setAppointments(data.data ?? []);
    } catch (err) {
      setError(err?.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered =
    filter === 'All' ? appointments : appointments.filter((a) => a.status === filter);

  const counts = {
    Booked:    appointments.filter((a) => a.status === 'Booked').length,
    Completed: appointments.filter((a) => a.status === 'Completed').length,
    Cancelled: appointments.filter((a) => a.status === 'Cancelled').length,
  };

  const openDetail = (appt) => {
    setSelected(appt);
    setDialogOpen(true);
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await appointmentsAPI.updateStatus(id, newStatus);
      setAppointments((prev) =>
        prev.map((a) => (a.appointmentId === id ? { ...a, status: newStatus } : a))
      );
      if (selected?.appointmentId === id) {
        setSelected((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      setError(err?.message || 'Failed to update status');
    }
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" fontWeight={700} mb={0.75}>
          My Appointments
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome, {user?.name}. Review and manage your assigned appointments.
        </Typography>
      </Box>

      {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}

      {/* Summary cards */}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard label="Total" value={loading ? '—' : appointments.length} color="text.primary" />
        </Grid>
        {Object.entries(counts).map(([status, count]) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={status}>
            <SummaryCard label={status} value={loading ? '—' : count} color={`${STATUS_COLOR[status]}.main`} />
          </Grid>
        ))}
      </Grid>

      {/* Table */}
      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', mb: 2.5 }}>
          <Box>
            <Typography variant="h6" fontWeight={700}>Appointment Queue</Typography>
            <Typography variant="body2" color="text.secondary">
              Filter upcoming, completed, and cancelled visits.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {FILTER_OPTIONS.map((option) => (
              <Chip
                key={option}
                label={option === 'All'
                  ? `All (${appointments.length})`
                  : `${option} (${counts[option] ?? 0})`}
                clickable
                color={filter === option ? 'primary' : 'default'}
                variant={filter === option ? 'filled' : 'outlined'}
                onClick={() => setFilter(option)}
              />
            ))}
          </Box>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
        ) : (
          <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  {['Appt ID', 'Patient', 'Disease', 'Type', 'Date', 'Time', 'Status', 'Actions'].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 700, py: 1.5, whiteSpace: 'nowrap' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                      No appointments found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((a) => (
                    <TableRow
                      key={a.appointmentId}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => openDetail(a)}
                    >
                      <TableCell sx={{ fontWeight: 600, color: 'primary.main', whiteSpace: 'nowrap' }}>
                        {a.appointmentId}
                      </TableCell>
                      <TableCell>{a.patientName}</TableCell>
                      <TableCell>{a.disease}</TableCell>
                      <TableCell>{a.appointmentType}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{a.appointmentDate}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{a.appointmentTime}</TableCell>
                      <TableCell>
                        <Chip label={a.status} color={STATUS_COLOR[a.status] ?? 'default'} size="small" />
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        {a.status === 'Booked' && (
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Button
                              size="small"
                              variant="outlined"
                              color="success"
                              onClick={() => updateStatus(a.appointmentId, 'Completed')}
                            >
                              Complete
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() => updateStatus(a.appointmentId, 'Cancelled')}
                            >
                              Cancel
                            </Button>
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Detail Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Appointment Details</DialogTitle>
        <DialogContent dividers>
          {selected && (
            <Stack spacing={0.25}>
              <DetailRow label="Appointment ID" value={selected.appointmentId} />
              <Divider sx={{ my: 0.5 }} />
              <DetailRow label="Patient Name"   value={selected.patientName} />
              <Divider sx={{ my: 0.5 }} />
              <DetailRow label="Disease"        value={selected.disease} />
              <DetailRow label="Type"           value={selected.appointmentType} />
              <DetailRow label="Department"     value={selected.department} />
              <DetailRow label="Appt Date"      value={selected.appointmentDate} />
              <DetailRow label="Appt Time"      value={selected.appointmentTime} />
              <Divider sx={{ my: 0.5 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 0.5 }}>
                <Typography variant="body2" color="text.secondary">Status</Typography>
                <Chip label={selected.status} color={STATUS_COLOR[selected.status] ?? 'default'} />
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5 }}>
          {selected?.status === 'Booked' && (
            <>
              <Button
                color="success"
                variant="contained"
                onClick={() => {
                  updateStatus(selected.appointmentId, 'Completed');
                  setDialogOpen(false);
                }}
              >
                Mark Completed
              </Button>
              <Button
                color="error"
                variant="outlined"
                onClick={() => {
                  updateStatus(selected.appointmentId, 'Cancelled');
                  setDialogOpen(false);
                }}
              >
                Cancel
              </Button>
            </>
          )}
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default DoctorDashboard;
