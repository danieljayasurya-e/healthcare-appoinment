import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Box, TextField, Typography, Alert } from '@mui/material';

import { AuthLayout } from '../components/auth/AuthLayout';
import { PrimaryButton } from '../components/common/Button';
import { useToasterContext } from '../hooks/useToasterContext';
import authAPI from '../services/auth';
import { BRANDING, ERROR_MESSAGES } from '../utils/constants';
import { isValidEmail } from '../utils/validators';
import illustrationImage from '../assets/forgotpassword-illustration.png';
import logoImage from '../assets/logo.png';

export const ForgotPassword = () => {
  const { addToast } = useToasterContext();
  const navigate = useNavigate();

  // ── react-hook-form used directly in this page (no hook layer) ──────────
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: '' } });

  const forgotMutation = useMutation({
    mutationFn: (email) => authAPI.forgotPassword(email),
  });

  const onSubmit = async ({ email }) => {
    try {
      await forgotMutation.mutateAsync(email);
      addToast('Verification code sent successfully.', 'success');
      navigate(`/otp-verification?email=${encodeURIComponent(email)}`);
    } catch (error) {
      const message = error?.message || ERROR_MESSAGES.SERVER_ERROR;
      addToast(message, 'error');
      setError('root', { message });
    }
  };

  const loading = isSubmitting || forgotMutation.isPending;

  return (
    <AuthLayout
      illustrationSrc={illustrationImage}
      vectorStyle={{ left: '-4rem', bottom: '-5rem', width: 'min(92%, 42rem)', opacity: 0.78 }}
    >
      {/* ── Brand ─────────────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.75, gap: 0.5 }}>
        <Box
          component="img"
          src={logoImage}
          alt=""
          sx={{ width: 52, height: 'auto', objectFit: 'contain' }}
        />
        <Typography variant="h5" fontWeight={700} letterSpacing="-0.03em" color="primary.main">
          {BRANDING.LOGO_TEXT}
        </Typography>
      </Box>

      {/* ── Heading ───────────────────────────────────────────────────── */}
      <Typography
        variant="h4"
        fontWeight={700}
        color="text.primary"
        sx={{ fontSize: 'clamp(1.6rem, 3vw, 2.1rem)', lineHeight: 1.2, mb: 0.75 }}
      >
        Trouble Signing In?
      </Typography>
      <Typography variant="body2" color="text.secondary" lineHeight={1.7} mb={0.5}>
        Enter your registered Email Address or Mobile Number below.
      </Typography>
      <Typography variant="body2" color="text.secondary" lineHeight={1.7} mb={2.5}>
        We&apos;ll send you a verification code to reset your password.
      </Typography>

      {/* ── Server error ──────────────────────────────────────────────── */}
      {errors.root && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {errors.root.message}
        </Alert>
      )}

      {/* ── Form ──────────────────────────────────────────────────────── */}
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
      >
        <TextField
          label="Enter Email / Mobile number"
          placeholder="Enter Email or Mobile Number"
          fullWidth
          disabled={loading}
          error={!!errors.email}
          helperText={errors.email?.message}
          InputLabelProps={{ shrink: true }}
          sx={{
            '& .MuiOutlinedInput-root fieldset': {
              borderColor: errors.email ? 'error.main' : '#cfc5ff',
            },
          }}
          {...register('email', {
            required: 'Email is required',
            validate: (v) => isValidEmail(v) || 'Invalid email format',
          })}
        />

        <PrimaryButton type="submit" fullWidth loading={loading} disabled={loading}>
          Get OTP
        </PrimaryButton>
      </Box>

      {/* ── Back to login ─────────────────────────────────────────────── */}
      <Box mt={1.5} textAlign="right">
        <Link
          to="/login"
          style={{ color: '#1976d2', fontSize: '0.85rem', fontWeight: 500, textDecoration: 'none' }}
        >
          Back to Login
        </Link>
      </Box>
    </AuthLayout>
  );
};

export default ForgotPassword;
