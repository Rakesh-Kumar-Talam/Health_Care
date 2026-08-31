import { Router } from 'express';
import {
  bookAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  cancelAppointment,
} from '../controllers/appointmentController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/book', authenticate, bookAppointment);
router.get('/my', authenticate, getPatientAppointments);
router.get('/doctor', authenticate, getDoctorAppointments);
router.patch('/:id/status', authenticate, updateAppointmentStatus);
router.patch('/:id/cancel', authenticate, cancelAppointment);

export default router;
