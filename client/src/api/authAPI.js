import API from './index';
import { API_ENDPOINTS } from '../utils/constants';

const authAPI = {
  login: ({ email, password }) =>
    API.post(API_ENDPOINTS.AUTH.LOGIN, { email, password }),

  signup: (payload) => API.post(API_ENDPOINTS.AUTH.SIGNUP, payload),

  logout: () => API.post(API_ENDPOINTS.AUTH.LOGOUT),

  forgotPassword: (email) =>
    API.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email }),

  resetPassword: (token, newPassword) =>
    API.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, newPassword }),

  verifyEmail: (token) =>
    API.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { token }),

  refreshToken: () => API.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN),

  getCurrentUser: () => API.get(API_ENDPOINTS.AUTH.ME),
};

export default authAPI;
