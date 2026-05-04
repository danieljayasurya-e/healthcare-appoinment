import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Box, IconButton, Typography,
  Avatar, Menu, MenuItem, Divider, Tooltip,
} from '@mui/material';
import { MenuIcon, ChevronLeftIcon } from './icons';
import { useAuth } from '../context/AuthContext';

const SHELL_BAR_HEIGHT = 72;
const SHELL_CONTROL_SIZE = 40;

const PAGE_TITLES = {
  '/patient': 'Book Appointment',
  '/doctor': 'My Appointments',
  '/admin': 'Admin Panel',
  '/admin/doctors': 'Doctors',
  '/admin/patients': 'Patients',
  '/admin/availability': 'Availability',
};

export const Topbar = ({ onMenuToggle, sidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);

  const pageTitle = PAGE_TITLES[location.pathname] ?? 'Dashboard';
  const avatarInitial = user?.name?.charAt(0)?.toUpperCase() ?? 'U';

  const handleLogout = () => {
    setAnchorEl(null);
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider',
        zIndex: (t) => t.zIndex.appBar,
        boxShadow: '0 1px 0 rgba(26, 37, 64, 0.04)',
      }}
    >
      <Toolbar
        sx={{
          minHeight: `${SHELL_BAR_HEIGHT}px !important`,
          px: { xs: 1.5, sm: 2, lg: 2.5 },
          gap: 1.5,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display:"flex", gap:'10%'}}>
          <Box>
            <Tooltip title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}>
              <IconButton
                onClick={onMenuToggle}
                aria-label="Toggle sidebar"
                size="medium"
                sx={{
                  flexShrink: 0,
                  color: 'text.secondary',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1.5,
                  width: 36,
                  height: 36,
                  transition: 'color 0.15s, background 0.15s',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    color: 'text.primary',
                  },
                }}
              >
                {sidebarOpen
                  ? <ChevronLeftIcon size={18} />
                  : <MenuIcon size={18} />}
              </IconButton>
            </Tooltip>
          </Box>
          <Box minWidth={0}>
            <Typography
              variant="caption"
              color="text.disabled"
              sx={{ display: { xs: 'none', sm: 'block' }, lineHeight: 1, mb: 0.25 }}
            >
              Dashboard
            </Typography>
            <Typography variant="h6" fontWeight={700} color="text.primary" noWrap>
              {pageTitle}
            </Typography>
          </Box>
        </Box>

        <Box display="flex" alignItems="center" gap={1.25} flexShrink={0}>

          <Tooltip title={user?.name ?? 'Account'}>
            <IconButton
              onClick={(e) => setAnchorEl(e.currentTarget)}
              aria-label="User menu"
              sx={{
                p: 0.25,
                width: SHELL_CONTROL_SIZE,
                height: SHELL_CONTROL_SIZE,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1.5,
              }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #42a5f5 0%, #1565c0 100%)',
                }}
              >
                {avatarInitial}
              </Avatar>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              elevation: 3,
              sx: {
                minWidth: 180,
                borderRadius: 2,
                mt: 0.75,
                border: '1px solid',
                borderColor: 'divider',
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.25 }}>
              <Typography variant="body2" fontWeight={700}>{user?.name}</Typography>
              <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
            </Box>
            <Divider />
            <MenuItem
              onClick={handleLogout}
              sx={{ fontSize: '0.875rem', py: 1.25, color: 'error.main', fontWeight: 500 }}
            >
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
