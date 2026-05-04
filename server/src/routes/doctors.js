import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import {
  listDoctors,
  getDoctor,
  createDoctor,
  updateSlots,
  deleteDoctor,
} from '../controllers/doctorsController.js';

const router = Router();

router.get('/', authenticate, listDoctors);
router.get('/:id', authenticate, getDoctor);
router.post('/', authenticate, authorize('admin'), createDoctor);
router.put('/:id/slots', authenticate, authorize('admin'), updateSlots);
router.delete('/:id', authenticate, authorize('admin'), deleteDoctor);

export default router;
