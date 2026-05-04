import API from './index';
import { API_ENDPOINTS } from '../utils/constants';

export const patientsAPI = {
  list:   ()       => API.get(API_ENDPOINTS.PATIENTS.LIST),
  get:    (id)     => API.get(API_ENDPOINTS.PATIENTS.DETAIL(id)),
  create: (data)   => API.post(API_ENDPOINTS.PATIENTS.CREATE, data),
  remove: (id)     => API.delete(API_ENDPOINTS.PATIENTS.DELETE(id)),
};

export default patientsAPI;
