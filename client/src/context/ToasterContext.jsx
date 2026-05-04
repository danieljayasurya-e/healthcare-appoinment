import { createContext, useState, useCallback } from 'react';
import { Snackbar, Alert } from '@mui/material';

export const ToasterContext = createContext(null);

export const ToasterProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    setToast({
      message,
      type,
      duration,
      open: true,
    });
  }, []);

  const removeToast = useCallback(() => {
    setToast((prev) => (prev ? { ...prev, open: false } : null));
  }, []);

  return (
    <ToasterContext.Provider value={{ addToast, removeToast }}>
      {children}
      {toast && (
        <Snackbar
          open={toast.open}
          autoHideDuration={toast.duration}
          onClose={removeToast}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={removeToast}
            severity={toast.type}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {toast.message}
          </Alert>
        </Snackbar>
      )}
    </ToasterContext.Provider>
  );
};