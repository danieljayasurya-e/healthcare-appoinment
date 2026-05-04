import API from './index';
import { API_ENDPOINTS } from '../utils/constants';

const departmentAPI = {
  getDepartments: (params = {}) =>
    API.get(API_ENDPOINTS.DEPARTMENTS.LIST, { params }),

  getDepartmentById: (id) => API.get(API_ENDPOINTS.DEPARTMENTS.DETAIL(id)),

  createDepartment: (payload) =>
    API.post(API_ENDPOINTS.DEPARTMENTS.CREATE, payload),

  updateDepartment: (id, payload) =>
    API.put(API_ENDPOINTS.DEPARTMENTS.UPDATE(id), payload),

  deleteDepartment: (id) =>
    API.delete(API_ENDPOINTS.DEPARTMENTS.DELETE(id)),
};

export default departmentAPI;
