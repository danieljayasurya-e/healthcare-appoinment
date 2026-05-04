import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import './index.css';
import App from './App.jsx';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ffffff',
      contrastText: '#1976d2',
    },
    background: {
      default: '#f5f8ff',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a2540',
      secondary: '#546e8a',
      disabled: '#9eb3c8',
    },
    error: {
      main: '#d32f2f',
    },
    divider: '#e3eaf6',
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
    fontSize: 15,
    h1: { fontWeight: 700, color: '#1a2540' },
    h2: { fontWeight: 700, color: '#1a2540' },
    h3: { fontWeight: 700, color: '#1a2540' },
    h4: { fontWeight: 700, color: '#1a2540' },
    h5: { fontWeight: 600, color: '#1a2540' },
    h6: { fontWeight: 600, color: '#1a2540' },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      defaultProps: {
        size: 'medium',
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: '10px',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #1e88e5 0%, #1565c0 100%)',
          boxShadow: '0 4px 14px rgba(25, 118, 210, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
            boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'medium',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#1976d2',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#1976d2',
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 2px 16px rgba(25, 118, 210, 0.08)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
        },
      },
    },
    MuiChip: {
      defaultProps: {
        size: 'medium',
      },
    },
    MuiTable: {
      defaultProps: {
        size: 'medium',
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#e3f2fd',
            color: '#1565c0',
            fontWeight: 600,
          },
        },
      },
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
);
