import { Router } from 'express';
import {
  bookAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  cancelAppointment,
  requestRecordAccess,
  respondRecordAccess,
  updatePatientVitalsByDoctor,
} from '../controllers/appointmentController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/book', authenticate, bookAppointment);
router.get('/my', authenticate, getPatientAppointments);
router.get('/doctor', authenticate, getDoctorAppointments);
router.patch('/:id/status', authenticate, updateAppointmentStatus);
router.put('/:id/vitals', authenticate, updatePatientVitalsByDoctor);
router.patch('/:id/cancel', authenticate, cancelAppointment);
router.post('/:id/request-records', authenticate, requestRecordAccess);
router.post('/:id/respond-records', authenticate, respondRecordAccess);

export default router;
