import { Button as MuiButton, CircularProgress } from '@mui/material';

/**
 * Base Button — wraps MUI Button with consistent styling and a loading state.
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  type = 'button',
  sx,
  ...props
}) => {
  const isPrimary = variant === 'primary';

  const variantSx = isPrimary
    ? {
        background: 'linear-gradient(135deg, #1e88e5 0%, #1565c0 100%)',
        color: '#fff',
        boxShadow: '0 4px 14px rgba(25, 118, 210, 0.28)',
        '&:hover': {
          background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
          boxShadow: '0 6px 20px rgba(25, 118, 210, 0.38)',
        },
        '&:disabled': {
          background: 'rgba(0,0,0,0.12)',
          color: 'rgba(0,0,0,0.26)',
          boxShadow: 'none',
        },
      }
    : {
        backgroundColor: '#fff',
        color: '#1976d2',
        border: '1px solid #90caf9',
        '&:hover': {
          backgroundColor: '#e3f2fd',
          borderColor: '#1976d2',
        },
      };

  const sizeSx = {
    sm: { minHeight: '2.4rem', px: 2, fontSize: '0.8rem' },
    md: { minHeight: '3rem', px: 3, fontSize: '0.9rem' },
    lg: { minHeight: '3.25rem', px: 4, fontSize: '1rem' },
  }[size];

  return (
    <MuiButton
      type={type}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      disableElevation
      sx={{
        borderRadius: '10px',
        fontWeight: 600,
        textTransform: 'none',
        gap: '8px',
        ...variantSx,
        ...sizeSx,
        ...sx,
      }}
      {...props}
    >
      {loading && (
        <CircularProgress
          size={16}
          thickness={4}
          sx={{ color: isPrimary ? '#fff' : 'primary.main' }}
        />
      )}
      {loading ? 'Loading...' : children}
    </MuiButton>
  );
};

export const PrimaryButton = (props) => <Button variant="primary" {...props} />;

export const SecondaryButton = (props) => <Button variant="secondary" {...props} />;
