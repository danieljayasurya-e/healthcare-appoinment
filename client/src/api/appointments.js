import API from './index';
import { API_ENDPOINTS } from '../utils/constants';

export const appointmentsAPI = {
  list:         (params)        => API.get(API_ENDPOINTS.APPOINTMENTS.LIST, { params }),
  my:           ()              => API.get(API_ENDPOINTS.APPOINTMENTS.MY),
  get:          (id)            => API.get(API_ENDPOINTS.APPOINTMENTS.DETAIL(id)),
  create:       (data)          => API.post(API_ENDPOINTS.APPOINTMENTS.CREATE, data),
  updateStatus: (id, status)    => API.put(API_ENDPOINTS.APPOINTMENTS.UPDATE_STATUS(id), { status }),
};

export default appointmentsAPI;
