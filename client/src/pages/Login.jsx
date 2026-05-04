import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../components/auth/AuthLayout';
import Toast from '../components/Toast';
import illustrationImage from '../assets/login-illustration.png';

const DEMO = [
  { role: 'Admin', email: 'admin@demo.com', password: 'Test@123', color: '#7c3aed' },
];

const ROLE_ROUTES = { admin: '/admin', doctor: '/doctor', patient: '/patient' };

const EyeOn = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const HCLogo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="7" fill="#1565c0"/>
    <rect x="12" y="7"  width="8" height="18" rx="2" fill="white"/>
    <rect x="7"  y="12" width="18" height="8"  rx="2" fill="white"/>
    <circle cx="16" cy="16" r="3.5" fill="#1565c0"/>
  </svg>
);

const Field = ({ label, error, children }) => (
  <div>
    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
      {label}
    </label>
    {children}
    {error && (
      <p style={{ margin: '4px 0 0', fontSize: 12, color: '#dc2626' }}>{error}</p>
    )}
  </div>
);

const TextInput = ({ hasError, rightEl, inputRef, ...props }) => (
  <div style={{ position: 'relative' }}>
    <input
      ref={inputRef}
      {...props}
      style={{
        display:      'block',
        width:        '100%',
        boxSizing:    'border-box',
        padding:      rightEl ? '10px 40px 10px 12px' : '10px 12px',
        fontSize:     14,
        lineHeight:   1.5,
        border:       `1.5px solid ${hasError ? '#dc2626' : '#d1d5db'}`,
        borderRadius: 7,
        outline:      'none',
        background:   '#fff',
        color:        '#111827',
        transition:   'border-color 0.15s, box-shadow 0.15s',
      }}
      onFocus={(e) => {
        e.target.style.borderColor = hasError ? '#dc2626' : '#1565c0';
        e.target.style.boxShadow   = `0 0 0 3px ${hasError ? 'rgba(220,38,38,0.1)' : 'rgba(21,101,192,0.12)'}`;
      }}
      onBlur={(e) => {
        e.target.style.borderColor = hasError ? '#dc2626' : '#d1d5db';
        e.target.style.boxShadow   = 'none';
      }}
    />
    {rightEl && (
      <button
        type="button"
        onClick={rightEl.onClick}
        tabIndex={-1}
        style={{
          position:   'absolute',
          right:      10,
          top:        '50%',
          transform:  'translateY(-50%)',
          background: 'none',
          border:     'none',
          cursor:     'pointer',
          color:      '#9ca3af',
          padding:    0,
          display:    'flex',
          alignItems: 'center',
        }}
      >
        {rightEl.icon}
      </button>
    )}
  </div>
);

export const Login = () => {
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast,   setToast]   = useState(null);

  const { login }  = useAuth();
  const navigate   = useNavigate();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: { email: '', password: '' },
  });

  const showToast = useCallback((type, message) => setToast({ type, message }), []);

  const onSubmit = async ({ email, password }) => {
    setLoading(true);
    try {
      const user = await login({ email, password });
      showToast('success', `Welcome back, ${user.name}!`);
      setTimeout(() => navigate(ROLE_ROUTES[user.role] ?? '/', { replace: true }), 700);
    } catch (err) {
      showToast('error', err?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const fill = (email, password) => {
    setValue('email', email);
    setValue('password', password);
  };

  const emailReg    = register('email',    { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' } });
  const passwordReg = register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } });

  return (
    <>
      <Toast toast={toast} onClose={() => setToast(null)} duration={2000} />

      <AuthLayout illustrationSrc={illustrationImage}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <HCLogo />
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#1565c0', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
              Health Care
            </div>
            <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>
              Appointment System
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>
            Welcome back
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: '#6b7280' }}>
            Sign in to continue to your dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          <Field label="Email address" error={errors.email?.message}>
            <TextInput
              type="email"
              placeholder="Enter your email"
              hasError={!!errors.email}
              autoComplete="email"
              name={emailReg.name}
              ref={emailReg.ref}
              onChange={emailReg.onChange}
              onBlur={emailReg.onBlur}
            />
          </Field>

          <Field label="Password" error={errors.password?.message}>
            <TextInput
              type={showPw ? 'text' : 'password'}
              placeholder="Enter your password"
              hasError={!!errors.password}
              autoComplete="current-password"
              rightEl={{ icon: showPw ? <EyeOff /> : <EyeOn />, onClick: () => setShowPw((v) => !v) }}
              name={passwordReg.name}
              ref={passwordReg.ref}
              onChange={passwordReg.onChange}
              onBlur={passwordReg.onBlur}
            />
          </Field>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop:    2,
              padding:      '11px 0',
              background:   loading ? '#93c5fd' : '#1565c0',
              color:        '#fff',
              border:       'none',
              borderRadius: 7,
              fontSize:     14,
              fontWeight:   700,
              cursor:       loading ? 'not-allowed' : 'pointer',
              letterSpacing:'0.01em',
              transition:   'background 0.15s, transform 0.1s',
              width:        '100%',
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#0d47a1'; }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#1565c0'; }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </AuthLayout>
    </>
  );
};

export default Login;
