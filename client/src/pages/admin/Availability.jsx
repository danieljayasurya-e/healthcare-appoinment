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
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { EditIcon } from '../../components/icons';
import { doctorsAPI } from '../../api/doctors';

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

const AdminAvailability = () => {
  const [doctors,   setDoctors]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');
  const [editDoc,   setEditDoc]   = useState(null);
  const [editSlots, setEditSlots] = useState([]);
  const [search,    setSearch]    = useState('');
  const [deptFilter, setDeptFilter] = useState('');

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
      const matchSearch = !q || d.name?.toLowerCase().includes(q);
      const matchDept   = !deptFilter || d.department === deptFilter;
      return matchSearch && matchDept;
    });
  }, [doctors, search, deptFilter]);

  const openEdit = (doctor) => {
    setEditDoc(doctor);
    setEditSlots([...(doctor.availableSlots ?? [])]);
  };

  const toggleSlot = (slot) =>
    setEditSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );

  const handleSave = async () => {
    if (!editDoc) return;
    setSaving(true);
    setError('');
    try {
      await doctorsAPI.updateSlots(editDoc.doctorId, editSlots);
      setDoctors((prev) =>
        prev.map((d) =>
          d.doctorId === editDoc.doctorId ? { ...d, availableSlots: editSlots } : d
        )
      );
      setEditDoc(null);
    } catch (err) {
      setError(err?.message || 'Failed to update slots');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" fontWeight={700} mb={0.5}>Availability</Typography>
        <Typography variant="body1" color="text.secondary">Configure available time slots for each doctor.</Typography>
      </Box>

      {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          size="small" placeholder="Search by doctor name"
          value={search} onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 240 }}
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
          value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">All Departments</MenuItem>
          {DEPARTMENTS.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
        </TextField>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
      ) : filtered.length === 0 ? (
        <Paper variant="outlined">
          <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
            <Typography>
              {doctors.length === 0 ? 'No doctors found. Add doctors first.' : 'No results match your filters'}
            </Typography>
          </Box>
        </Paper>
      ) : (
        <Grid container spacing={2.5}>
          {filtered.map((d) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={d.doctorId}>
              <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box>
                    <Typography variant="body1" fontWeight={700}>{d.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{d.department}</Typography>
                  </Box>
                  <Tooltip title="Edit slots">
                    <IconButton size="small" onClick={() => openEdit(d)}>
                      <EditIcon size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Divider sx={{ mb: 1.5 }} />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(d.availableSlots ?? []).length === 0 ? (
                    <Typography variant="body2" color="text.disabled">No slots configured</Typography>
                  ) : (
                    (d.availableSlots ?? []).map((slot) => (
                      <Chip key={slot} label={slot} size="small" color="primary" variant="outlined" />
                    ))
                  )}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={Boolean(editDoc)} onClose={() => setEditDoc(null)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>Edit Availability — {editDoc?.name}</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Toggle slots to set availability. Selected slots will be bookable by patients.
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {ALL_SLOTS.map((slot) => (
              <Chip
                key={slot} label={slot} clickable
                color={editSlots.includes(slot) ? 'primary' : 'default'}
                variant={editSlots.includes(slot) ? 'filled' : 'outlined'}
                onClick={() => toggleSlot(slot)}
              />
            ))}
          </Box>
          <Typography variant="caption" color="text.secondary" mt={2} display="block">
            {editSlots.length} slot{editSlots.length !== 1 ? 's' : ''} selected
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5 }}>
          <Button onClick={() => setEditDoc(null)} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Slots'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default AdminAvailability;
