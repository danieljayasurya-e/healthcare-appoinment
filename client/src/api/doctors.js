import API from './index';
import { API_ENDPOINTS } from '../utils/constants';

export const doctorsAPI = {
  list:        ()           => API.get(API_ENDPOINTS.DOCTORS.LIST),
  get:         (id)         => API.get(API_ENDPOINTS.DOCTORS.DETAIL(id)),
  create:      (data)       => API.post(API_ENDPOINTS.DOCTORS.CREATE, data),
  updateSlots: (id, slots)  => API.put(API_ENDPOINTS.DOCTORS.UPDATE_SLOTS(id), { availableSlots: slots }),
  remove:      (id)         => API.delete(API_ENDPOINTS.DOCTORS.DELETE(id)),
};

export default doctorsAPI;
