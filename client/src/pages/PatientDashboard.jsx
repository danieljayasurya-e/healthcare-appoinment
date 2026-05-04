import { useState, useEffect, useCallback } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  Chip,
  CircularProgress,
  Divider,
  MenuItem,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { CheckCircleIcon } from '../components/icons';
import { useAuth } from '../context/AuthContext';
import { appointmentsAPI } from '../api/appointments';
import { doctorsAPI } from '../api/doctors';

const DEPARTMENTS      = ['Cardiology', 'Orthopedics', 'General Medicine', 'Neurology', 'Dermatology', 'Pediatrics', 'ENT', 'Ophthalmology'];
const APPOINTMENT_TYPES = ['Consultation', 'Follow-up', 'Emergency', 'Routine Check-up'];
const STEPS             = ['Patient Details', 'Select Doctor & Slot', 'Confirmation'];

const STATUS_COLOR = { Booked: 'primary', Completed: 'success', Cancelled: 'error' };

const Row = ({ label, value, bold }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
    <Typography variant="body2" color="text.secondary">{label}</Typography>
    <Typography
      variant="body1"
      fontWeight={bold ? 700 : 500}
      color={bold ? 'primary.main' : 'text.primary'}
      textAlign="right"
    >
      {value}
    </Typography>
  </Box>
);

const SummaryCard = ({ label, value, helper }) => (
  <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
    <Typography variant="body2" color="text.secondary" gutterBottom>{label}</Typography>
    <Typography variant="h5" fontWeight={700}>{value}</Typography>
    {helper && <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{helper}</Typography>}
  </Paper>
);

const PatientDetailsForm = ({ data, onChange }) => (
  <Grid container spacing={2}>
    {[
      { label: 'Full Name',        key: 'name',  required: true, xs: 12, sm: 6 },
      { label: 'Phone Number',     key: 'phone', required: true, xs: 12, sm: 6 },
      { label: 'Email',            key: 'email', type: 'email',  xs: 12, sm: 6 },
      { label: 'Date of Birth',    key: 'dob',   type: 'date',   xs: 12, sm: 6, shrink: true },
    ].map(({ label, key, type = 'text', required, xs, sm, shrink }) => (
      <Grid size={{ xs, sm }} key={key}>
        <TextField
          label={label}
          type={type}
          fullWidth
          required={required}
          InputLabelProps={shrink ? { shrink: true } : undefined}
          value={data[key]}
          onChange={(e) => onChange(key, e.target.value)}
        />
      </Grid>
    ))}
    <Grid size={{ xs: 12, sm: 6 }}>
      <TextField
        label="Gender"
        select fullWidth
        value={data.gender}
        onChange={(e) => onChange('gender', e.target.value)}
      >
        {['Male', 'Female', 'Other'].map((g) => (
          <MenuItem key={g} value={g}>{g}</MenuItem>
        ))}
      </TextField>
    </Grid>
    <Grid size={{ xs: 12, sm: 6 }}>
      <TextField
        label="Disease / Symptom"
        fullWidth
        value={data.disease}
        onChange={(e) => onChange('disease', e.target.value)}
      />
    </Grid>
    <Grid size={12}>
      <TextField
        label="Appointment Type"
        select fullWidth
        value={data.appointmentType}
        onChange={(e) => onChange('appointmentType', e.target.value)}
      >
        {APPOINTMENT_TYPES.map((t) => (
          <MenuItem key={t} value={t}>{t}</MenuItem>
        ))}
      </TextField>
    </Grid>
  </Grid>
);

const DoctorSlotPicker = ({ data, onChange, doctors, loadingDoctors }) => {
  const filteredDoctors = data.department
    ? doctors.filter((d) => d.department === data.department)
    : doctors;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <TextField
        label="Department / Specialty"
        select fullWidth required
        value={data.department}
        onChange={(e) => {
          onChange('department', e.target.value);
          onChange('doctorId', '');
          onChange('doctorName', '');
          onChange('slot', '');
        }}
      >
        {DEPARTMENTS.map((dept) => (
          <MenuItem key={dept} value={dept}>{dept}</MenuItem>
        ))}
      </TextField>

      {data.department && (
        <>
          <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
            Available Doctors for {data.department}
          </Typography>
          {loadingDoctors ? (
            <Box display="flex" justifyContent="center" py={3}><CircularProgress size={24} /></Box>
          ) : filteredDoctors.length === 0 ? (
            <Typography color="text.secondary" variant="body2">
              No doctors registered for this department yet.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {filteredDoctors.map((doctor) => {
                const isSelected = data.doctorId === doctor.doctorId;
                return (
                  <Grid size={{ xs: 12, md: 6 }} key={doctor.doctorId}>
                    <Card
                      variant="outlined"
                      sx={{
                        borderColor: isSelected ? 'primary.main' : 'divider',
                        borderWidth: isSelected ? 2 : 1,
                        bgcolor: isSelected ? 'primary.50' : 'background.paper',
                      }}
                    >
                      <CardActionArea
                        onClick={() => {
                          onChange('doctorId', doctor.doctorId);
                          onChange('doctorName', doctor.name);
                          onChange('doctorSlots', doctor.availableSlots ?? []);
                          onChange('slot', '');
                        }}
                        sx={{ p: 2 }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            sx={{
                              bgcolor: isSelected ? 'primary.main' : 'grey.200',
                              color: isSelected ? '#fff' : 'text.primary',
                              width: 44, height: 44,
                              fontSize: '0.95rem', fontWeight: 700,
                            }}
                          >
                            {doctor.name.charAt(4)}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" fontWeight={600}>{doctor.name}</Typography>
                            <Typography variant="body2" color="text.secondary">{doctor.department}</Typography>
                          </Box>
                          {isSelected && (
                            <Box sx={{ ml: 'auto', color: 'primary.main', display: 'flex' }}>
                              <CheckCircleIcon size={20} />
                            </Box>
                          )}
                        </Box>
                      </CardActionArea>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </>
      )}

      {data.doctorId && (
        <TextField
          label="Appointment Date"
          type="date" fullWidth required
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: new Date().toISOString().split('T')[0] }}
          value={data.date}
          onChange={(e) => onChange('date', e.target.value)}
        />
      )}

      {data.doctorId && data.date && (
        <>
          <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
            Available Time Slots
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {(data.doctorSlots ?? []).map((slot) => (
              <Chip
                key={slot}
                label={slot}
                clickable
                color={data.slot === slot ? 'primary' : 'default'}
                variant={data.slot === slot ? 'filled' : 'outlined'}
                onClick={() => onChange('slot', slot)}
                sx={{ fontWeight: data.slot === slot ? 700 : 500 }}
              />
            ))}
          </Box>
        </>
      )}
    </Box>
  );
};

const ConfirmationView = ({ patient, booking, appointmentId }) => (
  <Box sx={{ textAlign: 'center' }}>
    <Box sx={{ color: 'success.main', mb: 1, display: 'flex', justifyContent: 'center' }}>
      <CheckCircleIcon size={64} />
    </Box>
    <Typography variant="h6" fontWeight={700} gutterBottom>Appointment Booked</Typography>
    <Typography variant="body1" color="text.secondary" mb={3}>
      Your appointment has been confirmed. Keep this ID for reference.
    </Typography>
    <Paper variant="outlined" sx={{ p: 2.5, textAlign: 'left', maxWidth: 460, mx: 'auto' }}>
      <Stack spacing={1}>
        <Row label="Appointment ID"  value={appointmentId}        bold />
        <Divider />
        <Row label="Patient"         value={patient.name} />
        <Row label="Department"      value={booking.department} />
        <Row label="Doctor"          value={booking.doctorName} />
        <Row label="Date"            value={booking.date} />
        <Row label="Time"            value={booking.slot} />
        <Row label="Type"            value={patient.appointmentType} />
        <Row label="Disease"         value={patient.disease || '-'} />
        <Divider />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">Status</Typography>
          <Chip label="Booked" color="primary" />
        </Box>
      </Stack>
    </Paper>
  </Box>
);

const AppointmentHistory = ({ appointments, loading }) => (
  <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
    <Box sx={{ mb: 2.5 }}>
      <Typography variant="h6" fontWeight={700}>My Appointments</Typography>
      <Typography variant="body2" color="text.secondary">
        Upcoming and past appointments.
      </Typography>
    </Box>

    {loading ? (
      <Box display="flex" justifyContent="center" py={4}><CircularProgress size={24} /></Box>
    ) : appointments.length === 0 ? (
      <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
        <Typography variant="body1" fontWeight={600} gutterBottom>No appointments yet</Typography>
        <Typography variant="body2" color="text.secondary">
          Use the booking form to schedule your first appointment.
        </Typography>
      </Paper>
    ) : (
      <Stack spacing={2}>
        {appointments.map((a) => (
          <Paper key={a.appointmentId} variant="outlined" sx={{ p: 2.25 }}>
            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>{a.department}</Typography>
                  <Typography variant="body2" color="text.secondary">{a.doctorName}</Typography>
                </Box>
                <Chip label={a.status} color={STATUS_COLOR[a.status] ?? 'default'} size="small" />
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1.5 }}>
                <Row label="Appt ID"  value={a.appointmentId}   bold />
                <Row label="Type"     value={a.appointmentType} />
                <Row label="Date"     value={a.appointmentDate} />
                <Row label="Time"     value={a.appointmentTime} />
                <Row label="Reason"   value={a.disease || '-'} />
              </Box>
            </Stack>
          </Paper>
        ))}
      </Stack>
    )}
  </Paper>
);

const EMPTY_BOOKING = { department: '', doctorId: '', doctorName: '', doctorSlots: [], date: '', slot: '' };

const PatientDashboard = () => {
  const { user } = useAuth();
  const [activeStep,    setActiveStep]    = useState(0);
  const [appointmentId, setAppointmentId] = useState('');
  const [appointments,  setAppointments]  = useState([]);
  const [doctors,       setDoctors]       = useState([]);
  const [loadingAppts,  setLoadingAppts]  = useState(true);
  const [loadingDocs,   setLoadingDocs]   = useState(true);
  const [submitting,    setSubmitting]    = useState(false);
  const [error,         setError]         = useState('');

  const [patientData, setPatientData] = useState({
    name: user?.name ?? '',
    phone: '',
    email: user?.email ?? '',
    dob: '',
    gender: '',
    disease: '',
    appointmentType: 'Consultation',
  });

  const [bookingData, setBookingData] = useState(EMPTY_BOOKING);

  const loadAppointments = useCallback(async () => {
    setLoadingAppts(true);
    try {
      const data = await appointmentsAPI.my();
      setAppointments(data.data ?? []);
    } catch {
      // silent — show empty list
    } finally {
      setLoadingAppts(false);
    }
  }, []);

  const loadDoctors = useCallback(async () => {
    setLoadingDocs(true);
    try {
      const data = await doctorsAPI.list();
      setDoctors(data.data ?? []);
    } catch {
      // silent — show empty list
    } finally {
      setLoadingDocs(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
    loadDoctors();
  }, [loadAppointments, loadDoctors]);

  const handlePatientChange = (field, value) =>
    setPatientData((prev) => ({ ...prev, [field]: value }));

  const handleBookingChange = (field, value) =>
    setBookingData((prev) => ({ ...prev, [field]: value }));

  const canProceedStep0 = patientData.name.trim() && patientData.phone.trim() && patientData.gender;
  const canProceedStep1 = bookingData.department && bookingData.doctorId && bookingData.date && bookingData.slot;

  const handleNext = async () => {
    if (activeStep === 1) {
      // Submit to API
      setSubmitting(true);
      setError('');
      try {
        const payload = {
          patientId:       user?.patientId ?? '',
          patientName:     patientData.name,
          doctorId:        bookingData.doctorId,
          doctorName:      bookingData.doctorName,
          department:      bookingData.department,
          appointmentType: patientData.appointmentType,
          disease:         patientData.disease,
          appointmentDate: bookingData.date,
          appointmentTime: bookingData.slot,
        };
        const result = await appointmentsAPI.create(payload);
        const created = result.data;
        setAppointmentId(created.appointmentId);
        setAppointments((prev) => [created, ...prev]);
      } catch (err) {
        setError(err?.message || 'Failed to book appointment');
        return;
      } finally {
        setSubmitting(false);
      }
    }
    setActiveStep((s) => s + 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setAppointmentId('');
    setBookingData(EMPTY_BOOKING);
    setPatientData((prev) => ({ ...prev, phone: '', dob: '', gender: '', disease: '', appointmentType: 'Consultation' }));
  };

  const upcoming = appointments.filter((a) => a.status === 'Booked').length;

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" fontWeight={700} mb={0.75}>Patient Dashboard</Typography>
        <Typography variant="body1" color="text.secondary">
          Book a visit, review appointment details, and check your schedule.
        </Typography>
      </Box>

      {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 4 }}>
          <SummaryCard label="Patient" value={user?.name ?? 'Patient'} helper="Personal details are prefilled." />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <SummaryCard label="Upcoming Appointments" value={loadingAppts ? '—' : upcoming} helper="Booked visits waiting for consultation." />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <SummaryCard label="Total Appointments" value={loadingAppts ? '—' : appointments.length} helper="Includes all visits." />
        </Grid>
      </Grid>

      <Grid container spacing={3} alignItems="stretch">
        <Grid size={{ xs: 12, xl: 7 }}>
          <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight={700} mb={0.5}>Book Appointment</Typography>
              <Typography variant="body2" color="text.secondary">
                Fill in the details below to schedule your appointment.
              </Typography>
            </Box>

            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {STEPS.map((label) => (
                <Step key={label}><StepLabel>{label}</StepLabel></Step>
              ))}
            </Stepper>

            <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, mb: 3, bgcolor: 'grey.50' }}>
              {activeStep === 0 && (
                <PatientDetailsForm data={patientData} onChange={handlePatientChange} />
              )}
              {activeStep === 1 && (
                <DoctorSlotPicker
                  data={bookingData}
                  onChange={handleBookingChange}
                  doctors={doctors}
                  loadingDoctors={loadingDocs}
                />
              )}
              {activeStep === 2 && (
                <ConfirmationView
                  patient={patientData}
                  booking={bookingData}
                  appointmentId={appointmentId}
                />
              )}
            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
              {activeStep < 2 ? (
                <>
                  <Button
                    variant="outlined"
                    disabled={activeStep === 0 || submitting}
                    onClick={() => setActiveStep((s) => s - 1)}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    disabled={
                      (activeStep === 0 ? !canProceedStep0 : !canProceedStep1) || submitting
                    }
                    onClick={handleNext}
                  >
                    {submitting
                      ? 'Booking…'
                      : activeStep === 1
                      ? 'Confirm Booking'
                      : 'Next'}
                  </Button>
                </>
              ) : (
                <>
                  <Box />
                  <Button variant="outlined" onClick={handleReset}>Book Another</Button>
                </>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, xl: 5 }}>
          <AppointmentHistory appointments={appointments} loading={loadingAppts} />
        </Grid>
      </Grid>
    </Stack>
  );
};

export default PatientDashboard;
