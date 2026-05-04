import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import {
  listPatients,
  getPatient,
  createPatient,
  deletePatient,
} from '../controllers/patientsController.js';

const router = Router();

router.get('/', authenticate, authorize('admin'), listPatients);
router.get('/:id', authenticate, getPatient);
router.post('/', authenticate, authorize('admin'), createPatient);
router.delete('/:id', authenticate, authorize('admin'), deletePatient);

export default router;
