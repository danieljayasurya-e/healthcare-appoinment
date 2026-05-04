import { Link } from 'react-router-dom';
import { Box, Typography, Button, Paper } from '@mui/material';
import { BRANDING } from '../utils/constants';

export const NotFound = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        p: 2,
        background: 'radial-gradient(circle at top, rgba(25,118,210,0.10), transparent 40%), #f5f8ff',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 480,
          p: { xs: 4, sm: 6 },
          borderRadius: 4,
          textAlign: 'center',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 24px 60px rgba(25,118,210,0.10)',
        }}
      >
        {/* 404 number */}
        <Typography
          sx={{
            fontSize: { xs: '5rem', sm: '6rem' },
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: '-0.06em',
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          404
        </Typography>

        <Typography variant="h5" fontWeight={700} color="text.primary" mt={2} mb={1}>
          Page not found
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ maxWidth: 340, mx: 'auto', lineHeight: 1.7, mb: 4 }}
        >
          The page you requested does not exist in{' '}
          <strong>{BRANDING.APP_NAME}</strong>. Use one of the links below to
          continue.
        </Typography>

        <Box display="flex" justifyContent="center" gap={2} flexWrap="wrap">
          <Button
            component={Link}
            to="/"
            variant="contained"
            color="primary"
            sx={{ borderRadius: 2, px: 3, py: 1.2, fontWeight: 600 }}
          >
            Go to Dashboard
          </Button>
          <Button
            component={Link}
            to="/login"
            variant="outlined"
            color="primary"
            sx={{ borderRadius: 2, px: 3, py: 1.2, fontWeight: 600 }}
          >
            Back to Login
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default NotFound;
