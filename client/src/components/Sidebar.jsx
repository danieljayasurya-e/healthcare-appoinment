import { NavLink } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  GridIcon as DashboardIcon,
  CalendarIcon,
  EventNoteIcon,
  StethoscopeIcon,
  PersonIcon,
  ClockIcon,
} from './icons';
import { useAuth } from '../context/AuthContext';

const SHELL_BAR_HEIGHT = 72;
const SIDEBAR_WIDTH    = 220;
const SIDEBAR_MINI     = 64;

// ── Healthcare logo ───────────────────────────────────────────────────────────
const HealthcareLogo = ({ size = 34 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="15" fill="rgba(255,255,255,0.18)" />
    <rect x="12" y="7"  width="8" height="18" rx="1.5" fill="white" />
    <rect x="7"  y="12" width="18" height="8"  rx="1.5" fill="white" />
    <circle cx="16" cy="16" r="3" fill="#1565c0" />
  </svg>
);

// ── Nav menus ─────────────────────────────────────────────────────────────────
const MENUS = {
  patient: [
    { label: 'Book Appointment', href: '/patient',            icon: <CalendarIcon size={18} /> },
  ],
  doctor: [
    { label: 'My Appointments',  href: '/doctor',             icon: <EventNoteIcon size={18} /> },
  ],
  admin: [
    { label: 'Appointments',     href: '/admin',              icon: <DashboardIcon size={18} /> },
    { label: 'Doctors',          href: '/admin/doctors',      icon: <StethoscopeIcon size={18} /> },
    { label: 'Patients',         href: '/admin/patients',     icon: <PersonIcon size={18} /> },
    { label: 'Availability',     href: '/admin/availability', icon: <ClockIcon size={18} /> },
  ],
};

// ── Nav item ──────────────────────────────────────────────────────────────────
const NavItem = ({ item, isOpen, onNavigate }) => (
  <Tooltip title={!isOpen ? item.label : ''} placement="right" arrow>
    <span style={{ display: 'block' }}>
      <NavLink to={item.href} end style={{ textDecoration: 'none' }} onClick={onNavigate}>
        {({ isActive }) => (
          <ListItemButton
            sx={{
              minHeight:      46,
              px:             isOpen ? 1.75 : 0,
              justifyContent: isOpen ? 'flex-start' : 'center',
              borderRadius:   0,
              color:  isActive ? '#fff' : 'rgba(255,255,255,0.70)',
              bgcolor: isActive ? 'rgba(255,255,255,0.16)' : 'transparent',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.10)', color: '#fff' },
              transition: 'padding 0.25s',
            }}
          >
            <ListItemIcon
              sx={{
                minWidth:       isOpen ? 36 : 'unset',
                justifyContent: 'center',
                color:          'inherit',
              }}
            >
              {item.icon}
            </ListItemIcon>
            {isOpen && (
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
              />
            )}
          </ListItemButton>
        )}
      </NavLink>
    </span>
  </Tooltip>
);

// ── Sidebar ───────────────────────────────────────────────────────────────────
export const Sidebar = ({ isOpen, mobileOpen, isDesktop, onClose }) => {
  const { user }  = useAuth();
  const menuItems = MENUS[user?.role] ?? [];
  const width     = isOpen ? SIDEBAR_WIDTH : SIDEBAR_MINI;

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── Brand header ───────────────────────────────────────────── */}
      <Box
        sx={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: isOpen ? 'flex-start' : 'center',
          gap:            1.5,
          px:             isOpen ? 2 : 0,
          minHeight:      SHELL_BAR_HEIGHT,
          flexShrink:     0,
          overflow:       'hidden',
        }}
      >
        <Box sx={{ flexShrink: 0 }}>
          <HealthcareLogo size={34} />
        </Box>
        {isOpen && (
          <Typography
            variant="subtitle1"
            fontWeight={800}
            noWrap
            sx={{ letterSpacing: '-0.01em', fontSize: '0.95rem', color:'#fff' }}
          >
            Health Care
          </Typography>
        )}
      </Box>

      {/* ── User badge (expanded only) ─────────────────────────────── */}
      {isOpen && user && (
        <Box
          sx={{
            mx:   1.5,
            mb:   1.5,
            px:   1.5,
            py:   1,
            bgcolor: 'rgba(255,255,255,0.08)',
            borderRadius: 1.5,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color:           'rgba(255,255,255,0.45)',
              textTransform:   'uppercase',
              letterSpacing:   '0.08em',
              fontSize:        '0.62rem',
              display:         'block',
              mb:              0.25,
            }}
          >
            {user.role}
          </Typography>
          <Typography variant="body2" fontWeight={600} noWrap sx={{ lineHeight: 1.4, color:'#fff' }}>
            {user.name}
          </Typography>
        </Box>
      )}

      {/* ── Navigation ─────────────────────────────────────────────── */}
      <List sx={{ flex: 1, px: 0, pt: 0.5, pb: 2 }}>
        {menuItems.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            isOpen={isOpen}
            onNavigate={!isDesktop ? onClose : undefined}
          />
        ))}
      </List>
    </Box>
  );

  /* Desktop */
  if (isDesktop) {
    return (
      <Drawer
        variant="permanent"
        sx={{
          width,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width,
            boxSizing:   'border-box',
            border:      'none',
            borderRadius: 0,
            overflowX:   'hidden',
            background:  'linear-gradient(180deg, #0d47a1 0%, #1565c0 100%)',
            boxShadow:   '2px 0 8px rgba(0,0,0,0.12)',
            transition:  'width 0.25s cubic-bezier(.4,0,.2,1)',
          },
          transition: 'width 0.25s cubic-bezier(.4,0,.2,1)',
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  /* Mobile */
  return (
    <Drawer
      variant="temporary"
      open={mobileOpen}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        display: { xs: 'block', lg: 'none' },
        '& .MuiDrawer-paper': {
          width:       SIDEBAR_WIDTH,
          boxSizing:   'border-box',
          border:      'none',
          borderRadius: 0,
          background:  'linear-gradient(180deg, #0d47a1 0%, #1565c0 100%)',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
