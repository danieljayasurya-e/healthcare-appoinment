import authAPI from '../api/authAPI';
import { APP_CONFIG } from '../utils/constants';

const AUTH_QUERY_KEY = ['auth', 'currentUser'];

/**
 * React Query options for fetching the current user.
 * Returns null (not an error) when no token exists.
 */
export const getCurrentUserQueryOptions = () => ({
  queryKey: AUTH_QUERY_KEY,
  queryFn: async () => {
    const token = localStorage.getItem(APP_CONFIG.TOKEN_KEY);
    if (!token) return null;
    try {
      return (await authAPI.getCurrentUser()) ?? null;
    } catch {
      localStorage.removeItem(APP_CONFIG.TOKEN_KEY);
      return null;
    }
  },
  staleTime: 5 * 60 * 1000,
  retry: false,
});

/**
 * Persist login response data and seed the query cache.
 */
export const setAuthSession = (queryClient, data) => {
  const { token, user } = data ?? {};
  if (token) localStorage.setItem(APP_CONFIG.TOKEN_KEY, token);
  queryClient.setQueryData(AUTH_QUERY_KEY, user ?? null);
};

/**
 * Remove auth data and invalidate the current-user query.
 */
export const clearAuthSession = (queryClient) => {
  localStorage.removeItem(APP_CONFIG.TOKEN_KEY);
  queryClient.setQueryData(AUTH_QUERY_KEY, null);
  queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
};
