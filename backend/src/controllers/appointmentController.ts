import { Response } from 'express';
import Appointment from '../models/Appointment';
import Doctor from '../models/Doctor';
import Patient from '../models/Patient';
import { AuthRequest } from '../middleware/auth';

export const bookAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const {
      doctorId,
      appointmentDate,
      timeSlot,
      type,
      reason,
      symptoms,
      patientPhone,
    } = req.body;

    if (!doctorId || !appointmentDate || !timeSlot) {
      res.status(400).json({ success: false, message: 'Doctor, appointment date, and time slot are required' });
      return;
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      res.status(404).json({ success: false, message: 'Doctor not found' });
      return;
    }

    // Check if appointment slot is already taken for that doctor and date
    const existing = await Appointment.findOne({
      doctorId: doctor._id,
      appointmentDate,
      timeSlot,
      status: { $in: ['pending', 'confirmed'] },
    });

    if (existing) {
      res.status(400).json({ success: false, message: 'This time slot is already booked. Please choose another time.' });
      return;
    }

    const patient = await Patient.findOne({ userId: req.user._id });

    // Generate random video room id if video consultation
    const videoRoomId = type === 'video' ? `cura-room-${Math.random().toString(36).substring(2, 9)}` : undefined;

    const appointment = await Appointment.create({
      patientId: patient?._id,
      patientUserId: req.user._id,
      patientName: req.user.name,
      patientEmail: req.user.email,
      patientPhone: patientPhone || req.user.phone || '',
      doctorId: doctor._id,
      doctorUserId: doctor.userId,
      doctorName: doctor.name,
      doctorSpecialty: doctor.specialty,
      doctorAvatar: doctor.avatar,
      hospitalId: doctor.hospitalId,
      hospitalName: doctor.hospitalName,
      appointmentDate,
      timeSlot,
      type: type || 'in-person',
      status: 'confirmed', // Auto-confirm in demo
      reason: reason || 'General Checkup',
      symptoms: symptoms || '',
      fee: doctor.consultationFee,
      paymentStatus: 'paid',
      videoRoomId,
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully!',
      appointment,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to book appointment' });
  }
};

export const getPatientAppointments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { status } = req.query;
    const query: any = { patientUserId: req.user._id };

    if (status && status !== 'all') {
      query.status = status;
    }

    const appointments = await Appointment.find(query).sort({ appointmentDate: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch appointments' });
  }
};

export const getDoctorAppointments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'doctor') {
      res.status(403).json({ success: false, message: 'Doctor privileges required' });
      return;
    }

    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      res.status(404).json({ success: false, message: 'Doctor profile not found' });
      return;
    }

    const { status, date } = req.query;
    const query: any = { doctorId: doctor._id };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (date) {
      query.appointmentDate = date;
    }

    const appointments = await Appointment.find(query).sort({ appointmentDate: 1, timeSlot: 1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch doctor appointments' });
  }
};

export const updateAppointmentStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const { status, notes, prescription } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      res.status(404).json({ success: false, message: 'Appointment not found' });
      return;
    }

    // Validate access
    const isDoctor = req.user.role === 'doctor' && appointment.doctorUserId.toString() === req.user._id.toString();
    const isPatient = appointment.patientUserId.toString() === req.user._id.toString();

    if (!isDoctor && !isPatient) {
      res.status(403).json({ success: false, message: 'Not authorized to modify this appointment' });
      return;
    }

    if (status) appointment.status = status;
    if (notes !== undefined) appointment.notes = notes;
    if (prescription !== undefined) appointment.prescription = prescription;

    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      appointment,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update appointment' });
  }
};

export const cancelAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      res.status(404).json({ success: false, message: 'Appointment not found' });
      return;
    }

    const isDoctor = req.user.role === 'doctor' && appointment.doctorUserId.toString() === req.user._id.toString();
    const isPatient = appointment.patientUserId.toString() === req.user._id.toString();

    if (!isDoctor && !isPatient) {
      res.status(403).json({ success: false, message: 'Not authorized to cancel this appointment' });
      return;
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      appointment,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to cancel appointment' });
  }
};
