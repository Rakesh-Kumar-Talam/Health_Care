import { Router } from 'express';
import { register, login, demoLogin, getMe, updatePatientVitals } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/demo-login', demoLogin);
router.get('/me', authenticate, getMe);
router.put('/vitals', authenticate, updatePatientVitals);

export default router;
