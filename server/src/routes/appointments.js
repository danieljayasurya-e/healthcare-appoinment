import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import {
  listAppointments,
  myAppointments,
  getAppointment,
  createAppointment,
  updateAppointmentStatus,
} from '../controllers/appointmentsController.js';

const router = Router();

router.get('/', authenticate, authorize('admin'), listAppointments);
router.get('/my', authenticate, myAppointments);
router.get('/:id', authenticate, getAppointment);
router.post('/', authenticate, authorize('patient', 'admin'), createAppointment);
router.put('/:id/status', authenticate, authorize('doctor', 'admin'), updateAppointmentStatus);

export default router;
