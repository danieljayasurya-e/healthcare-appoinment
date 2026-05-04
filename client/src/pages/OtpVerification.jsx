import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Box, TextField, Typography, Alert } from '@mui/material';

import { AuthLayout } from '../components/auth/AuthLayout';
import { PrimaryButton } from '../components/common/Button';
import { useToasterContext } from '../hooks/useToasterContext';
import authAPI from '../services/auth';
import { BRANDING, ERROR_MESSAGES } from '../utils/constants';
import illustrationImage from '../assets/otp-illustration.png';
import logoImage from '../assets/logo.png';

const OTP_LENGTH     = 4;
const RESEND_SECONDS = 28;

export const OtpVerification = () => {
  const { addToast }       = useToasterContext();
  const navigate           = useNavigate();
  const [searchParams]     = useSearchParams();
  const [otp, setOtp]      = useState(Array(OTP_LENGTH).fill(''));
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [otpError, setOtpError] = useState('');
  const inputRefs = useRef([]);
  const email = searchParams.get('email') ?? '';

  const resendMutation = useMutation({ mutationFn: authAPI.forgotPassword });
  const isOtpComplete  = otp.every((d) => d.trim() !== '');
  const otpValue       = useMemo(() => otp.join(''), [otp]);

  // Countdown
  useEffect(() => {
    if (secondsLeft <= 0) return undefined;
    const t = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [secondsLeft]);

  const handleOtpChange = (index, value) => {
    const next = value.replace(/\D/g, '').slice(-1);
    setOtp((cur) => { const a = [...cur]; a[index] = next; return a; });
    if (next && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (!email || secondsLeft > 0) return;
    try {
      await resendMutation.mutateAsync(email);
      setSecondsLeft(RESEND_SECONDS);
      addToast('OTP sent again successfully.', 'success');
    } catch (error) {
      addToast(error?.message || ERROR_MESSAGES.SERVER_ERROR, 'error');
    }
  };

  const handleVerify = (e) => {
    e.preventDefault();
    if (!isOtpComplete) { setOtpError('Please enter the complete 4-digit OTP.'); return; }
    setOtpError('');
    navigate(
      `/reset-password?token=${encodeURIComponent(otpValue)}&email=${encodeURIComponent(email)}`,
    );
  };

  const formattedTimer = `00:${String(secondsLeft).padStart(2, '0')}`;

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
        OTP Verification
      </Typography>
      <Typography variant="body2" color="text.secondary" lineHeight={1.7} mb={2.5}>
        We&apos;ve sent a 4-digit code to your registered Email / Mobile Number
        {email ? `: ${email}` : '.'}
      </Typography>

      {otpError && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {otpError}
        </Alert>
      )}

      {/* ── OTP form ──────────────────────────────────────────────────── */}
      <Box component="form" onSubmit={handleVerify} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box>
          <Typography variant="body2" fontWeight={600} color="text.primary" mb={1.5}>
            Enter the OTP below to continue:
          </Typography>

          {/* 4 digit boxes — evenly spaced */}
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            {otp.map((digit, index) => (
              <TextField
                key={index}
                inputRef={(el) => { inputRefs.current[index] = el; }}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                inputProps={{
                  maxLength: 1,
                  inputMode: 'numeric',
                  autoComplete: 'one-time-code',
                  style: {
                    textAlign: 'center',
                    fontWeight: 700,
                    fontSize: '1.25rem',
                    color: '#231f39',
                    padding: '12px 0',
                  },
                }}
                sx={{
                  width: 56,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    '& fieldset': { borderColor: '#e0daf6' },
                    '&:hover fieldset':  { borderColor: 'primary.main' },
                    '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                  },
                }}
              />
            ))}
          </Box>
        </Box>

        <PrimaryButton type="submit" fullWidth>
          Verify OTP
        </PrimaryButton>
      </Box>

      {/* ── Resend row ────────────────────────────────────────────────── */}
      <Box mt={2} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
        <Typography
          component="button"
          type="button"
          onClick={handleResend}
          disabled={secondsLeft > 0 || resendMutation.isPending || !email}
          sx={{
            border: 'none',
            background: 'transparent',
            color: secondsLeft > 0 ? 'text.disabled' : 'primary.main',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: secondsLeft > 0 ? 'not-allowed' : 'pointer',
            p: 0,
            fontFamily: 'inherit',
          }}
        >
          Resend OTP
        </Typography>
        <Typography variant="body2" color="text.secondary">
          in{' '}
          <Box component="span" sx={{ color: '#5f61ff', fontWeight: 700 }}>
            {formattedTimer}
          </Box>
          {' '}(disabled until timer ends)
        </Typography>
      </Box>

      <Box mt={1.5} textAlign="right">
        <Link
          to="/forgot-password"
          style={{ color: '#1976d2', fontSize: '0.85rem', fontWeight: 500, textDecoration: 'none' }}
        >
          Back
        </Link>
      </Box>
    </AuthLayout>
  );
};

export default OtpVerification;
