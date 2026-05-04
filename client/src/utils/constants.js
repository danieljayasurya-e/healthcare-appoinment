export const API_ENDPOINTS = {
  AUTH: {
    LOGIN:  '/auth/login',
    ME:     '/auth/me',
  },
  DOCTORS: {
    LIST:        '/doctors',
    CREATE:      '/doctors',
    DETAIL:      (id) => `/doctors/${id}`,
    UPDATE_SLOTS:(id) => `/doctors/${id}/slots`,
    DELETE:      (id) => `/doctors/${id}`,
  },
  PATIENTS: {
    LIST:   '/patients',
    CREATE: '/patients',
    DETAIL: (id) => `/patients/${id}`,
    DELETE: (id) => `/patients/${id}`,
  },
  APPOINTMENTS: {
    LIST:          '/appointments',
    MY:            '/appointments/my',
    CREATE:        '/appointments',
    DETAIL:        (id) => `/appointments/${id}`,
    UPDATE_STATUS: (id) => `/appointments/${id}/status`,
  },
};

export const APP_CONFIG = {
  API_TIMEOUT: 30000,
  TOKEN_KEY:   'appt_token',
  USER_KEY:    'appt_user',
  DEFAULT_PAGINATION: 10,
};

export const BRANDING = {
  APP_NAME:        'Health Care',
  LOGO_TEXT:       'Health Care',
  LOGIN_TITLE:     'Welcome to Health Care',
  LOGIN_SUBTITLE:  'Login to continue managing your dashboard',
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR:       'Network error. Please check your connection.',
  SERVER_ERROR:        'Server error. Please try again later.',
  VALIDATION_ERROR:    'Please check your input and try again.',
  UNAUTHORIZED:        'You are not authorized to perform this action.',
  FORBIDDEN:           'Access forbidden.',
  NOT_FOUND:           'Resource not found.',
  DUPLICATE_EMAIL:     'This email is already registered.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  SESSION_EXPIRED:     'Your session has expired. Please login again.',
};

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS:   'Login successful!',
  LOGOUT_SUCCESS:  'Logged out successfully!',
  OPERATION_SUCCESS: 'Operation completed successfully!',
};
