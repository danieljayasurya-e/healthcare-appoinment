import API from './index';
import { API_ENDPOINTS } from '../utils/constants';

const userAPI = {
  getUsers: (params = {}) =>
    API.get(API_ENDPOINTS.USERS.LIST, { params }),

  getUserById: (id) => API.get(API_ENDPOINTS.USERS.DETAIL(id)),

  createUser: (payload) => API.post(API_ENDPOINTS.USERS.CREATE, payload),

  updateUser: (id, payload) =>
    API.put(API_ENDPOINTS.USERS.UPDATE(id), payload),

  deleteUser: (id) => API.delete(API_ENDPOINTS.USERS.DELETE(id)),
};

export default userAPI;
