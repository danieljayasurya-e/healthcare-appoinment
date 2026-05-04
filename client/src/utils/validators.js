// ─── Primitive validators ─────────────────────────────────────────────────────

export const isValidEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());

export const isValidMobile = (value) =>
  /^[6-9]\d{9}$/.test(String(value).trim());

export const isValidEmailOrMobile = (value) =>
  isValidEmail(value) || isValidMobile(value);

export const isValidPassword = (value) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(String(value));

// ─── Form-level validators ────────────────────────────────────────────────────

/**
 * Validates the login form.
 * Returns an errors object (empty = valid).
 */
export const validateLoginForm = (email, password) => {
  const errors = {};

  if (!email) {
    errors.email = 'Email or mobile number is required';
  } else if (!isValidEmailOrMobile(email)) {
    errors.email = 'Enter a valid email address or 10-digit mobile number';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  return errors;
};

/**
 * Validates the forgot-password form.
 */
export const validateForgotPasswordForm = (email) => {
  const errors = {};

  if (!email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(email)) {
    errors.email = 'Invalid email format';
  }

  return errors;
};

/**
 * Validates the reset-password form.
 */
export const validateResetPasswordForm = (password, confirmPassword) => {
  const errors = {};

  if (!password) {
    errors.password = 'Password is required';
  } else if (!isValidPassword(password)) {
    errors.password =
      'Password must be at least 8 characters and include uppercase, lowercase and a number';
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Confirm password is required';
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return errors;
};
