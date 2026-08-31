import { Request, Response } from 'express';
import Hospital from '../models/Hospital';
import Doctor from '../models/Doctor';

export const getHospitals = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, city, emergencyOnly, specialty, sort } = req.query;

    const query: any = {};

    if (search) {
      const searchRegex = new RegExp(String(search), 'i');
      query.$or = [
        { name: searchRegex },
        { city: searchRegex },
        { specialties: searchRegex },
        { description: searchRegex },
      ];
    }

    if (city && city !== 'All') {
      query.city = new RegExp(String(city), 'i');
    }

    if (emergencyOnly === 'true') {
      query.emergencyAvailable = true;
    }

    if (specialty && specialty !== 'All') {
      query.specialties = new RegExp(String(specialty), 'i');
    }

    let sortOption: any = { rating: -1, totalBeds: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };
    if (sort === 'beds') sortOption = { totalBeds: -1 };
    if (sort === 'name') sortOption = { name: 1 };

    const hospitals = await Hospital.find(query).sort(sortOption);

    res.status(200).json({
      success: true,
      count: hospitals.length,
      hospitals,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch hospitals' });
  }
};

export const getHospitalById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const hospital = await Hospital.findById(id);
    if (!hospital) {
      res.status(404).json({ success: false, message: 'Hospital not found' });
      return;
    }

    // Find doctors affiliated with this hospital or matching hospital name
    const affiliatedDoctors = await Doctor.find({
      $or: [{ hospitalId: hospital._id }, { hospitalName: hospital.name }],
    });

    res.status(200).json({
      success: true,
      hospital,
      doctors: affiliatedDoctors,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch hospital details' });
  }
};
