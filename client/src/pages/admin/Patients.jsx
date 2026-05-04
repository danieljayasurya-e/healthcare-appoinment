import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Alert,
  Box,
  Button,
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
import { patientsAPI } from '../../api/patients';
import { Pagination } from '../../components/common/Pagination';

const EMPTY_FORM    = { name: '', email: '', phone: '', gender: '', dob: '', password: '' };
const ROWS_PER_PAGE = 10;

const AdminPatients = () => {
  const [patients,      setPatients]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [deleting,      setDeleting]      = useState(false);
  const [error,         setError]         = useState('');
  const [addOpen,       setAddOpen]       = useState(false);
  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [form,          setForm]          = useState(EMPTY_FORM);
  const [showPw,        setShowPw]        = useState(false);
  const [search,        setSearch]        = useState('');
  const [genderFilter,  setGenderFilter]  = useState('');
  const [page,          setPage]          = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await patientsAPI.list();
      setPatients(data.data ?? []);
    } catch (err) {
      setError(err?.message || 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return patients.filter((p) => {
      const matchSearch  = !q || p.name?.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q) || p.phone?.includes(q);
      const matchGender  = !genderFilter || p.gender === genderFilter;
      return matchSearch && matchGender;
    });
  }, [patients, search, genderFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const displayed  = useMemo(
    () => filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE),
    [filtered, page]
  );

  const handleFilterChange = (setter) => (e) => { setter(e.target.value); setPage(1); };

  const field = (key) => ({
    value: form[key],
    onChange: (e) => setForm((p) => ({ ...p, [key]: e.target.value })),
  });

  const handleAdd = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) return;
    setSaving(true);
    setError('');
    try {
      const data = await patientsAPI.create(form);
      setPatients((prev) => [...prev, data.data]);
      setForm(EMPTY_FORM);
      setAddOpen(false);
    } catch (err) {
      setError(err?.message || 'Failed to add patient');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await patientsAPI.remove(deleteTarget.id);
      setPatients((prev) => prev.filter((p) => p.patientId !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err?.message || 'Failed to deactivate patient');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" fontWeight={700} mb={0.5}>Patients</Typography>
        <Typography variant="body1" color="text.secondary">Manage registered patients and their accounts.</Typography>
      </Box>

      {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}

      <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2.5 }}>
            <Typography variant="h6" fontWeight={700}>
              {loading ? 'Loading…' : `${filtered.length} patient${filtered.length !== 1 ? 's' : ''}`}
            </Typography>
            {/* <Button startIcon={<AddIcon />} variant="contained" onClick={() => setAddOpen(true)}>
              Add Patient
            </Button> */}
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 2.5, flexWrap: 'wrap' }}>
            <TextField
              size="small" placeholder="Search by name, email or phone"
              value={search} onChange={handleFilterChange(setSearch)}
              sx={{ minWidth: 260 }}
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
              select size="small" label="Gender"
              value={genderFilter} onChange={handleFilterChange(setGenderFilter)}
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
          ) : (
            <>
              <TableContainer sx={{ overflowX: 'auto', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                <Table sx={{ minWidth: 600 }}>
                  <TableHead sx={{ bgcolor: 'grey.50' }}>
                    <TableRow>
                      {['Patient ID', 'Name', 'Phone', 'Email', 'Gender', 'DOB', ''].map((h) => (
                        <TableCell key={h} sx={{ fontWeight: 700, py: 1.5, whiteSpace: 'nowrap' }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {displayed.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                          {patients.length === 0 ? 'No patients registered yet' : 'No results match your filters'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      displayed.map((p) => (
                        <TableRow key={p.patientId} hover>
                          <TableCell sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>{p.patientId}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{p.name}</TableCell>
                          <TableCell>{p.phone}</TableCell>
                          <TableCell>{p.email}</TableCell>
                          <TableCell>{p.gender}</TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>{p.dob}</TableCell>
                          <TableCell align="right">
                            <Tooltip title="Deactivate">
                              <IconButton
                                size="small" color="error"
                                onClick={() => setDeleteTarget({ id: p.patientId, name: p.name })}
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

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700}>Deactivate Patient</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ pt: 1 }}>
            Are you sure you want to deactivate{' '}
            <Typography component="span" fontWeight={700} color="text.primary">
              {deleteTarget?.name}
            </Typography>
            ? They will no longer be able to book appointments.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5 }}>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button>
          <Button variant="contained" color="error" onClick={confirmDelete} disabled={deleting}>
            {deleting ? 'Deactivating…' : 'Deactivate'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>Add Patient</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 0.5 }}>
            <Grid size={12}>
              <TextField label="Full Name" fullWidth required {...field('name')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Phone" fullWidth required {...field('phone')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Email" type="email" fullWidth required {...field('email')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Gender" select fullWidth {...field('gender')}>
                {['Male', 'Female', 'Other'].map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Date of Birth" type="date" fullWidth
                InputLabelProps={{ shrink: true }}
                {...field('dob')}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                label="Password (for login)"
                type={showPw ? 'text' : 'password'}
                fullWidth
                {...field('password')}
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
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5 }}>
          <Button onClick={() => setAddOpen(false)} disabled={saving}>Cancel</Button>
          <Button
            variant="contained" onClick={handleAdd}
            disabled={saving || !form.name.trim() || !form.email.trim() || !form.phone.trim()}
          >
            {saving ? 'Saving…' : 'Add Patient'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default AdminPatients;
