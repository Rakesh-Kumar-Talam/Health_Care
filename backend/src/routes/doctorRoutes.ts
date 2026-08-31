import { Router } from 'express';
import { getDoctors, getDoctorById, updateDoctorProfile, getSpecialties } from '../controllers/doctorController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', getDoctors);
router.get('/specialties', getSpecialties);
router.get('/:id', getDoctorById);
router.put('/profile', authenticate, updateDoctorProfile);

export default router;
