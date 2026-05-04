import { Box, useMediaQuery, useTheme } from '@mui/material';
import vectorImage from '../../assets/vector.png';

/**
 * Two-column auth page shell.
 *
 * ┌──────────────────────────┬──────────────────────┐
 * │  Illustration + vector   │  Form panel (child)  │
 * └──────────────────────────┴──────────────────────┘
 *
 * On mobile the illustration moves below the form.
 */
export const AuthLayout = ({
  illustrationSrc,
  illustrationStyle = {},
  vectorStyle    = {},
  children,
}) => {
  const theme   = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  /* ── Illustration panel ─────────────────────────────────────────── */
  const IllustrationPanel = () => (
    <Box
      component="section"
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isMobile ? 'center' : 'flex-start',
        minHeight: isMobile ? 220 : 'min(40rem, 78vh)',
        pl: isMobile ? 0 : '2rem',
        pr: isMobile ? 0 : 'clamp(2rem, 6vw, 5rem)',
        overflow: 'hidden',
      }}
    >
      {/* Vector blob — absolute background */}
      <Box
        component="img"
        src={vectorImage}
        alt=""
        sx={{
          position: 'absolute',
          left: isMobile ? '50%' : '-3rem',
          bottom: isMobile ? '-1.5rem' : '-4rem',
          width: isMobile ? '115%' : 'min(100%, 58rem)',
          opacity: 0.9,
          pointerEvents: 'none',
          transform: isMobile ? 'translateX(-50%)' : 'none',
          ...vectorStyle,
        }}
      />

      {/* Illustration — layered above vector */}
      <Box
        component="img"
        src={illustrationSrc}
        alt=""
        sx={{
          position: 'relative',  // sit above the absolute vector
          width: isMobile ? 'min(78%, 18rem)' : 'min(90%, 34rem)',
          height: 'auto',
          objectFit: 'contain',
          ...illustrationStyle,
        }}
      />
    </Box>
  );

  /* ── Root grid ──────────────────────────────────────────────────── */
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: isMobile
          ? '1fr'
          : 'minmax(0, 1.25fr) minmax(340px, 460px)',
        alignItems: 'center',
        gap: isMobile ? 0 : 'clamp(1rem, 3vw, 4rem)',
        p: { xs: 'clamp(1rem, 4vw, 2rem)', md: 'clamp(1.5rem, 3vw, 3rem)' },
        bgcolor: '#ffffff',
      }}
    >
      {/* Desktop: illustration on left */}
      {!isMobile && <IllustrationPanel />}

      {/* Form panel */}
      <Box
        component="section"
        sx={{
          width: '100%',
          maxWidth: 440,
          mx: 'auto',
          order: isMobile ? 1 : 'unset',
        }}
      >
        {children}
      </Box>

      {/* Mobile: illustration below form */}
      {isMobile && (
        <Box sx={{ order: 2 }}>
          <IllustrationPanel />
        </Box>
      )}
    </Box>
  );
};

export default AuthLayout;
