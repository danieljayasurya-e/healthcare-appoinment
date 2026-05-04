import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Topbar } from './Topbar';
import { Sidebar } from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { useInactivityTimeout } from '../hooks/useInactivityTimeout';

const COUNTDOWN_SECONDS = 120;

export const Layout = ({ children }) => {
  const theme     = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [warnOpen,    setWarnOpen]    = useState(false);
  const [countdown,   setCountdown]   = useState(COUNTDOWN_SECONDS);
  const countdownRef                  = useRef(null);

  const { logout } = useAuth();
  const navigate   = useNavigate();

  const handleLogout = useCallback(() => {
    clearInterval(countdownRef.current);
    setWarnOpen(false);
    logout();
    navigate('/login', { replace: true });
  }, [logout, navigate]);

  const handleStay = useCallback(() => {
    clearInterval(countdownRef.current);
    setWarnOpen(false);
    setCountdown(COUNTDOWN_SECONDS);
  }, []);

  const onWarn = useCallback(() => {
    setCountdown(COUNTDOWN_SECONDS);
    setWarnOpen(true);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    if (countdown === 0 && warnOpen) {
      handleLogout();
    }
  }, [countdown, warnOpen, handleLogout]);

  useInactivityTimeout({ onWarn, onLogout: handleLogout });

  const toggle = () => setSidebarOpen((prev) => !prev);

  const mins = Math.floor(countdown / 60);
  const secs = String(countdown % 60).padStart(2, '0');

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>
      <Sidebar
        isOpen={isDesktop ? sidebarOpen : true}
        mobileOpen={!isDesktop && sidebarOpen}
        isDesktop={isDesktop}
        onClose={() => setSidebarOpen(false)}
      />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <Topbar onMenuToggle={toggle} sidebarOpen={isDesktop ? sidebarOpen : true} />
        <Box
          component="main"
          sx={{
            flex:       1,
            px:         { xs: 2, sm: 3, lg: 4 },
            py:         { xs: 2, sm: 3 },
            overflowY:  'auto',
            overflowX:  'hidden',
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 1440, mx: 'auto' }}>{children}</Box>
        </Box>
      </Box>

      <Dialog open={warnOpen} maxWidth="xs" fullWidth disableEscapeKeyDown>
        <DialogTitle fontWeight={700} sx={{ pb: 1 }}>
          Session Expiring Soon
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Your session will end automatically due to inactivity to protect patient data in compliance with HIPAA requirements.
          </Typography>
          <Box
            sx={{
              textAlign:    'center',
              py:           2.5,
              borderRadius: 2,
              border:       '1px solid',
              borderColor:  countdown <= 30 ? 'error.light' : 'info.light',
              bgcolor:      countdown <= 30 ? '#fef2f2' : '#f0f9ff',
            }}
          >
            <Typography
              variant="h3"
              fontWeight={800}
              color={countdown <= 30 ? 'error.main' : 'primary.main'}
            >
              {mins}:{secs}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              remaining
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" color="error" onClick={handleLogout}>
            Logout Now
          </Button>
          <Button variant="contained" onClick={handleStay} autoFocus>
            Stay Logged In
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Layout;
