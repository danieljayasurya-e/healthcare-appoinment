import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
} from '@mui/material';

import { AuthLayout } from '../components/auth/AuthLayout';
import { PrimaryButton } from '../components/common/Button';
import { EyeIcon, EyeOffIcon } from '../components/icons';
import { useToasterContext } from '../hooks/useToasterContext';
import authAPI from '../services/auth';
import { BRANDING, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants';
import { isValidPassword } from '../utils/validators';
import illustrationImage from '../assets/resetpassword-illustration.png';
import logoImage from '../assets/logo.png';

export const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const { addToast }  = useToasterContext();
  const navigate      = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  // ── react-hook-form used directly in this page (no hook layer) ──────────
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { password: '', confirmPassword: '' } });

  const resetMutation = useMutation({
    mutationFn: ({ newPassword }) => authAPI.resetPassword(token, newPassword),
  });

  const onSubmit = async ({ password }) => {
    if (!token) {
      setError('root', { message: 'Reset token is missing. Please restart the recovery flow.' });
      return;
    }
    try {
      await resetMutation.mutateAsync({ newPassword: password });
      addToast(SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESS, 'success');
      navigate('/login', { replace: true });
    } catch (error) {
      const message = error?.message || ERROR_MESSAGES.SERVER_ERROR;
      addToast(message, 'error');
      setError('root', { message });
    }
  };

  const loading       = isSubmitting || resetMutation.isPending;
  const passwordValue = watch('password');

  const fieldSx = (hasError) => ({
    '& .MuiOutlinedInput-root fieldset': {
      borderColor: hasError ? 'error.main' : '#ded7f5',
    },
  });

  const EyeToggle = ({ show, onToggle, label }) => (
    <InputAdornment position="end">
      <IconButton
        size="small"
        edge="end"
        tabIndex={-1}
        onClick={onToggle}
        aria-label={label}
      >
        {show
          ? <EyeOffIcon size={18} style={{ color: '#9c97ad' }} />
          : <EyeIcon    size={18} style={{ color: '#9c97ad' }} />}
      </IconButton>
    </InputAdornment>
  );

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
        Reset Password
      </Typography>
      <Typography variant="body2" color="text.secondary" lineHeight={1.7} mb={2.5}>
        Secure your access — start fresh with a new password.
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
        {/* New password */}
        <TextField
          label="Enter New Password"
          placeholder="Enter New Password"
          type={showPassword ? 'text' : 'password'}
          fullWidth
          disabled={loading}
          error={!!errors.password}
          helperText={errors.password?.message}
          InputLabelProps={{ shrink: true }}
          InputProps={{
            endAdornment: (
              <EyeToggle
                show={showPassword}
                onToggle={() => setShowPassword((v) => !v)}
                label={showPassword ? 'Hide password' : 'Show password'}
              />
            ),
          }}
          sx={fieldSx(!!errors.password)}
          {...register('password', {
            required: 'Password is required',
            validate: (v) =>
              isValidPassword(v) || 'Min 8 chars with uppercase, lowercase and a number',
          })}
        />

        {/* Confirm password */}
        <TextField
          label="Confirm Password"
          placeholder="Enter Confirm Password"
          type={showConfirm ? 'text' : 'password'}
          fullWidth
          disabled={loading}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
          InputLabelProps={{ shrink: true }}
          InputProps={{
            endAdornment: (
              <EyeToggle
                show={showConfirm}
                onToggle={() => setShowConfirm((v) => !v)}
                label={showConfirm ? 'Hide password' : 'Show password'}
              />
            ),
          }}
          sx={fieldSx(!!errors.confirmPassword)}
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: (v) => v === passwordValue || 'Passwords do not match',
          })}
        />

        <PrimaryButton type="submit" fullWidth loading={loading} disabled={loading}>
          Reset Password
        </PrimaryButton>
      </Box>
    </AuthLayout>
  );
};

export default ResetPassword;
