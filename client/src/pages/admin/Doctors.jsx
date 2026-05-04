import { useState, useEffect, useCallback, useMemo } from 'react';
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
  IconButton,
  InputAdornment,
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
  Tooltip,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { AddIcon, DeleteIcon, EyeIcon, EyeOffIcon } from '../../components/icons';
import { doctorsAPI } from '../../api/doctors';
import { Pagination } from '../../components/common/Pagination';

const DEPARTMENTS = [
  'Cardiology', 'Orthopedics', 'General Medicine', 'Neurology',
  'Dermatology', 'Pediatrics', 'ENT', 'Ophthalmology',
];

const ALL_SLOTS = [
  '08:00 AM','08:30 AM','09:00 AM','09:30 AM',
  '10:00 AM','10:30 AM','11:00 AM','11:30 AM',
  '12:00 PM','01:00 PM','02:00 PM','02:30 PM',
  '03:00 PM','03:30 PM','04:00 PM','04:30 PM',
];

const EMPTY_FORM    = { name: '', department: '', email: '', password: '', availableSlots: [] };
const ROWS_PER_PAGE = 10;

const AdminDoctors = () => {
  const [doctors,       setDoctors]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [deleting,      setDeleting]      = useState(false);
  const [error,         setError]         = useState('');
  const [addOpen,       setAddOpen]       = useState(false);
  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [form,          setForm]          = useState(EMPTY_FORM);
  const [showPw,        setShowPw]        = useState(false);
  const [search,        setSearch]        = useState('');
  const [deptFilter,    setDeptFilter]    = useState('');
  const [page,          setPage]          = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await doctorsAPI.list();
      setDoctors(data.data ?? []);
    } catch (err) {
      setError(err?.message || 'Failed to load doctors');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return doctors.filter((d) => {
      const matchSearch = !q || d.name?.toLowerCase().includes(q) || d.doctorId?.toLowerCase().includes(q);
      const matchDept   = !deptFilter || d.department === deptFilter;
      return matchSearch && matchDept;
    });
  }, [doctors, search, deptFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const displayed  = useMemo(
    () => filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE),
    [filtered, page]
  );

  const handleFilterChange = (setter) => (e) => { setter(e.target.value); setPage(1); };

  const toggleSlot = (slot) =>
    setForm((prev) => ({
      ...prev,
      availableSlots: prev.availableSlots.includes(slot)
        ? prev.availableSlots.filter((s) => s !== slot)
        : [...prev.availableSlots, slot],
    }));

  const handleAdd = async () => {
    if (!form.name.trim() || !form.department) return;
    setSaving(true);
    setError('');
    try {
      const data = await doctorsAPI.create(form);
      setDoctors((prev) => [...prev, data.data]);
      setForm(EMPTY_FORM);
      setAddOpen(false);
    } catch (err) {
      setError(err?.message || 'Failed to add doctor');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await doctorsAPI.remove(deleteTarget.id);
      setDoctors((prev) => prev.filter((d) => d.doctorId !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err?.message || 'Failed to deactivate doctor');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" fontWeight={700} mb={0.5}>Doctors</Typography>
        <Typography variant="body1" color="text.secondary">Manage registered doctors and their accounts.</Typography>
      </Box>

      {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}

      <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2.5 }}>
            <Typography variant="h6" fontWeight={700}>
              {loading ? 'Loading…' : `${filtered.length} doctor${filtered.length !== 1 ? 's' : ''}`}
            </Typography>
            {/* <Button startIcon={<AddIcon />} variant="contained" onClick={() => setAddOpen(true)}>
              Add Doctor
            </Button> */}
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 2.5, flexWrap: 'wrap' }}>
            <TextField
              size="small" placeholder="Search by name or ID"
              value={search} onChange={handleFilterChange(setSearch)}
              sx={{ minWidth: 220, flex: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              select size="small" label="Department"
              value={deptFilter} onChange={handleFilterChange(setDeptFilter)}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="">All Departments</MenuItem>
              {DEPARTMENTS.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
            </TextField>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
          ) : (
            <>
              <TableContainer sx={{ overflowX: 'auto', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                <Table sx={{ minWidth: 560 }}>
                  <TableHead sx={{ bgcolor: 'grey.50' }}>
                    <TableRow>
                      {['Doctor ID', 'Name', 'Department', 'Available Slots', ''].map((h) => (
                        <TableCell key={h} sx={{ fontWeight: 700, py: 1.5, whiteSpace: 'nowrap' }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {displayed.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                          {doctors.length === 0 ? 'No doctors registered yet' : 'No results match your filters'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      displayed.map((d) => (
                        <TableRow key={d.doctorId} hover>
                          <TableCell sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>{d.doctorId}</TableCell>
                          <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{d.name}</TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>{d.department}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {(d.availableSlots ?? []).map((slot) => (
                                <Chip key={slot} label={slot} size="small" />
                              ))}
                            </Box>
                          </TableCell>
                          <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                            <Tooltip title="Deactivate">
                              <IconButton
                                size="small" color="error"
                                onClick={() => setDeleteTarget({ id: d.doctorId, name: d.name })}
                              >
                                <DeleteIcon size={16} />
                              </IconButton>
                            </Tooltip>
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
                totalItems={filtered.length}
                rowsPerPage={ROWS_PER_PAGE}
                onPageChange={setPage}
              />
            </>
          )}
        </Box>
      </Paper>

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>Add Doctor</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 0.5 }}>
            <Grid size={12}>
              <TextField
                label="Doctor Name" fullWidth required
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                label="Department" select fullWidth required
                value={form.department}
                onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
              >
                {DEPARTMENTS.map((dept) => <MenuItem key={dept} value={dept}>{dept}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Email (for login)" type="email" fullWidth
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Password"
                type={showPw ? 'text' : 'password'} fullWidth
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                helperText="Leave blank if no login account needed"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowPw((v) => !v)} tabIndex={-1}>
                        {showPw ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={12}>
              <Typography variant="body2" color="text.secondary" mb={1}>Default Time Slots</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {ALL_SLOTS.map((slot) => (
                  <Chip
                    key={slot} label={slot} clickable
                    color={form.availableSlots.includes(slot) ? 'primary' : 'default'}
                    variant={form.availableSlots.includes(slot) ? 'filled' : 'outlined'}
                    onClick={() => toggleSlot(slot)}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5 }}>
          <Button onClick={() => setAddOpen(false)} disabled={saving}>Cancel</Button>
          <Button
            variant="contained" onClick={handleAdd}
            disabled={saving || !form.name.trim() || !form.department}
          >
            {saving ? 'Saving…' : 'Add Doctor'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700}>Deactivate Doctor</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ pt: 1 }}>
            Are you sure you want to deactivate{' '}
            <Typography component="span" fontWeight={700} color="text.primary">
              {deleteTarget?.name}
            </Typography>
            ? They will no longer appear in the system or accept appointments.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5 }}>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button>
          <Button variant="contained" color="error" onClick={confirmDelete} disabled={deleting}>
            {deleting ? 'Deactivating…' : 'Deactivate'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default AdminDoctors;
