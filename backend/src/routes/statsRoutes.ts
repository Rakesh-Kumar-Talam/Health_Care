import { Router } from 'express';
import { getDoctorStats, getPlatformStats } from '../controllers/statsController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/doctor', authenticate, getDoctorStats);
router.get('/platform', getPlatformStats);

export default router;
