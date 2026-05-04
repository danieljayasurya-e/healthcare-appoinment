/**
 * Auth service — re-exports authAPI so that
 * `import authAPI from '../services/auth'` keeps working
 * while the real implementation lives in `src/api/authAPI.js`.
 */
import authAPI from '../api/authAPI';

export default authAPI;
