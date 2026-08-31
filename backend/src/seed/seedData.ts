import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Doctor from '../models/Doctor';
import Patient from '../models/Patient';
import Hospital from '../models/Hospital';
import Post from '../models/Post';
import Reel from '../models/Reel';
import Appointment from '../models/Appointment';

export const seedDatabase = async () => {
  try {
    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Doctor.deleteMany({}),
      Patient.deleteMany({}),
      Hospital.deleteMany({}),
      Post.deleteMany({}),
      Reel.deleteMany({}),
      Appointment.deleteMany({}),
    ]);

    console.log('Seeding hospitals...');
    const hospitals = await Hospital.create([
      {
        name: 'St. Jude Premier Medical Center',
        tagline: 'Leading Cardiology, Oncology & Advanced Surgery',
        description: 'St. Jude Premier Medical Center is an internationally recognized academic medical center providing world-class tertiary and quaternary healthcare with advanced robotic surgery suites and 24/7 Level 1 Trauma care.',
        address: '450 Lexington Avenue, Suite 1200',
        city: 'New York',
        state: 'NY',
        zipCode: '10017',
        phone: '+1 (212) 555-0199',
        email: 'info@stjude-premier.org',
        emergencyAvailable: true,
        totalBeds: 650,
        rating: 4.9,
        reviewCount: 420,
        image: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800&auto=format&fit=crop&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&auto=format&fit=crop&q=80',
        ],
        specialties: ['Cardiology', 'Oncology', 'Neurology', 'Orthopedics', 'Emergency Medicine', 'Pediatrics'],
        facilities: ['24/7 Level 1 Trauma', 'Robotic Surgery Suites', 'Advanced MRI/CT Imaging', 'ICU & CCU Units', 'Helipad', 'In-house Pharmacy'],
        establishedYear: 1985,
        website: 'https://stjude-premier.org',
      },
      {
        name: 'Mount Sinai Specialized Health',
        tagline: 'Excellence in Clinical Research & Patient Care',
        description: 'Mount Sinai Specialized Health is globally renowned for breakthroughs in dermatology, regenerative medicine, and minimally invasive cardiac procedures.',
        address: '1425 Madison Ave',
        city: 'New York',
        state: 'NY',
        zipCode: '10029',
        phone: '+1 (212) 555-0144',
        email: 'care@mountsinai-specialized.org',
        emergencyAvailable: true,
        totalBeds: 520,
        rating: 4.8,
        reviewCount: 380,
        image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80',
        ],
        specialties: ['Dermatology', 'Cardiology', 'Endocrinology', 'Gastroenterology', 'General Surgery'],
        facilities: ['24/7 Emergency', 'Laser Therapy Center', 'Comprehensive Wellness Clinic', 'Diagnostic Lab'],
        establishedYear: 1992,
        website: 'https://mountsinai-specialized.org',
      },
      {
        name: 'Boston Institute of Pediatric & General Health',
        tagline: 'Compassionate Care for Children & Families',
        description: 'Ranked top in the nation for pediatric care, offering specialized neonatal intensive care, pediatric neurology, and family wellness centers.',
        address: '300 Longwood Avenue',
        city: 'Boston',
        state: 'MA',
        zipCode: '02115',
        phone: '+1 (617) 555-0188',
        email: 'contact@bostonpediatric.org',
        emergencyAvailable: true,
        totalBeds: 410,
        rating: 4.9,
        reviewCount: 510,
        image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800&auto=format&fit=crop&q=80',
        ],
        specialties: ['Pediatrics', 'Neonatology', 'Pediatric Cardiology', 'Allergy & Immunology', 'Child Psychiatry'],
        facilities: ['Level 4 NICU', 'Pediatric Emergency Center', 'Family Play Suites', 'Genetic Testing Lab'],
        establishedYear: 1978,
        website: 'https://bostonpediatric.org',
      },
      {
        name: 'Cedars Medical & Neurological Pavilion',
        tagline: 'Pioneering Brain, Spine & Orthopedic Treatments',
        description: 'A comprehensive medical complex equipped with advanced neuro-navigation systems, hyperbaric oxygen chambers, and an elite spine care unit.',
        address: '8700 Beverly Blvd',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90048',
        phone: '+1 (310) 555-0120',
        email: 'info@cedars-pavilion.org',
        emergencyAvailable: true,
        totalBeds: 480,
        rating: 4.8,
        reviewCount: 290,
        image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&auto=format&fit=crop&q=80',
        gallery: [],
        specialties: ['Neurology', 'Orthopedics', 'Neurosurgery', 'Spine Care', 'Physical Therapy'],
        facilities: ['Neuro-ICU', 'Robotic Joint Replacement', '24/7 Stroke Unit', 'Sports Rehabilitation Center'],
        establishedYear: 1999,
        website: 'https://cedars-pavilion.org',
      },
    ]);

    console.log('Seeding demo patient...');
    const patientUser = await User.create({
      name: 'Sarah Jenkins',
      email: 'patient@test.com',
      password: 'Patient@123',
      role: 'patient',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      phone: '+1 (555) 234-5678',
    });

    const patientProfile = await Patient.create({
      userId: patientUser._id,
      name: patientUser.name,
      email: patientUser.email,
      avatar: patientUser.avatar,
      phone: patientUser.phone,
      gender: 'female',
      bloodGroup: 'O+',
      allergies: ['Penicillin', 'Peanuts'],
      emergencyContact: {
        name: 'Michael Jenkins',
        phone: '+1 (555) 876-5432',
        relationship: 'Spouse',
      },
      address: {
        street: '742 Evergreen Terrace',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
      },
    });

    console.log('Seeding demo doctor...');
    const doctorUser = await User.create({
      name: 'Dr. Alexander Wright',
      email: 'doctor@test.com',
      password: 'Doctor@123',
      role: 'doctor',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
      phone: '+1 (555) 345-6789',
    });

    const demoDoctor = await Doctor.create({
      userId: doctorUser._id,
      name: 'Dr. Alexander Wright, MD',
      email: doctorUser.email,
      avatar: doctorUser.avatar,
      specialty: 'Cardiology',
      qualifications: ['MD (Harvard Medical School)', 'FACC (Fellow of American College of Cardiology)', 'Board Certified Interventional Cardiologist'],
      experienceYears: 14,
      hospitalId: hospitals[0]._id,
      hospitalName: hospitals[0].name,
      bio: 'Senior Interventional Cardiologist specializing in preventive heart health, hypertension management, and coronary artery disease.',
      about: 'Dr. Alexander Wright has over 14 years of clinical experience in leading cardiac care. He has performed over 1,200 successful catheter interventions and is deeply passionate about combining cutting-edge clinical practices with patient-first empathetic care.',
      consultationFee: 85,
      rating: 4.95,
      reviewCount: 142,
      location: {
        city: 'New York',
        state: 'NY',
        address: '450 Lexington Avenue, Suite 1200',
      },
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      timeSlots: ['09:00 AM', '10:30 AM', '11:45 AM', '02:00 PM', '03:30 PM', '05:00 PM'],
      profileViews: 1240,
      isVerified: true,
      languages: ['English', 'Spanish'],
      services: ['Comprehensive Cardiac Checkup', 'ECG & Echocardiogram Analysis', 'Hypertension Protocol', 'Heart Failure Management', 'Preventive Lipid Panel Review'],
    });

    console.log('Seeding additional doctors...');
    const otherDoctorsData = [
      {
        name: 'Dr. Elena Rostova, MD',
        email: 'elena.rostova@curapulse.com',
        avatar: 'https://images.unsplash.com/photo-1594824813515-58d3434685ef?w=300&auto=format&fit=crop&q=80',
        specialty: 'Dermatology',
        qualifications: ['MD - Dermatology (Johns Hopkins)', 'FAAD'],
        experienceYears: 11,
        hospitalId: hospitals[1]._id,
        hospitalName: hospitals[1].name,
        bio: 'Clinical Dermatologist & Aesthetic Medicine Specialist focusing on acne treatments, psoriasis, eczema, and skin cancer screenings.',
        about: 'Dr. Elena Rostova blends medical precision with aesthetic harmony. She is dedicated to evidence-based skincare, acne protocols, and non-invasive dermatological therapies.',
        consultationFee: 75,
        rating: 4.9,
        reviewCount: 98,
        location: { city: 'New York', state: 'NY', address: '1425 Madison Ave, Floor 4' },
        availableDays: ['Monday', 'Wednesday', 'Thursday', 'Friday'],
        timeSlots: ['10:00 AM', '11:30 AM', '02:30 PM', '04:00 PM', '05:30 PM'],
        languages: ['English', 'Russian', 'French'],
        services: ['Skin Cancer Screening', 'Acne & Rosacea Management', 'Cosmetic Dermatology', 'Laser Resurfacing'],
      },
      {
        name: 'Dr. Marcus Chen, MD',
        email: 'marcus.chen@curapulse.com',
        avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&auto=format&fit=crop&q=80',
        specialty: 'Pediatrics',
        qualifications: ['MD (Stanford University)', 'FAAP'],
        experienceYears: 9,
        hospitalId: hospitals[2]._id,
        hospitalName: hospitals[2].name,
        bio: 'Compassionate Pediatrician dedicated to developmental milestones, infant nutrition, and childhood asthma management.',
        about: 'Dr. Marcus Chen believes healthcare for children should be warm, fun, and evidence-based. He works closely with parents to support growing families.',
        consultationFee: 65,
        rating: 4.88,
        reviewCount: 115,
        location: { city: 'Boston', state: 'MA', address: '300 Longwood Avenue' },
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Saturday'],
        timeSlots: ['08:30 AM', '10:00 AM', '11:30 AM', '01:30 PM', '03:00 PM'],
        languages: ['English', 'Mandarin'],
        services: ['Newborn Care & Well-Child Visits', 'Immunization Protocols', 'Childhood Asthma & Allergy Care', 'Developmental Screening'],
      },
      {
        name: 'Dr. Priya Sharma, MD',
        email: 'priya.sharma@curapulse.com',
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80',
        specialty: 'Neurology',
        qualifications: ['MD - Neurology (UCSF)', 'Fellowship in Headache Medicine & Epilepsy'],
        experienceYears: 13,
        hospitalId: hospitals[3]._id,
        hospitalName: hospitals[3].name,
        bio: 'Specialist in migraine management, neuromuscular disorders, epilepsy, and neuro-rehabilitation.',
        about: 'Dr. Priya Sharma is a leader in neurological diagnosis, providing tailored treatment plans for chronic migraines, sleep disturbances, and neuropathy.',
        consultationFee: 95,
        rating: 4.93,
        reviewCount: 86,
        location: { city: 'Los Angeles', state: 'CA', address: '8700 Beverly Blvd, Suite 500' },
        availableDays: ['Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        timeSlots: ['09:30 AM', '11:00 AM', '02:00 PM', '03:30 PM', '05:00 PM'],
        languages: ['English', 'Hindi'],
        services: ['Chronic Migraine Protocol', 'EEG & Neurological Assessment', 'Epilepsy Management', 'Sleep Disorders Evaluation'],
      },
      {
        name: 'Dr. David Miller, MD',
        email: 'david.miller@curapulse.com',
        avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&auto=format&fit=crop&q=80',
        specialty: 'Orthopedics',
        qualifications: ['MD - Orthopedic Surgery (Columbia)', 'FAAOS'],
        experienceYears: 16,
        hospitalId: hospitals[0]._id,
        hospitalName: hospitals[0].name,
        bio: 'Orthopedic Surgeon specializing in sports medicine, robotic knee/hip replacement, and arthroscopy.',
        about: 'Dr. David Miller is dedicated to restoring mobility and peak athletic performance with minimally invasive techniques.',
        consultationFee: 90,
        rating: 4.91,
        reviewCount: 160,
        location: { city: 'New York', state: 'NY', address: '450 Lexington Avenue, Floor 8' },
        availableDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
        timeSlots: ['08:00 AM', '09:30 AM', '11:00 AM', '01:30 PM', '03:30 PM'],
        languages: ['English'],
        services: ['Minimally Invasive Joint Replacement', 'ACL & Meniscus Repair', 'Rotator Cuff Arthroscopy', 'Sports Injury Rehabilitation'],
      },
      {
        name: 'Dr. Sarah Al-Mansoor, MD',
        email: 'sarah.mansoor@curapulse.com',
        avatar: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=300&auto=format&fit=crop&q=80',
        specialty: 'Oncology',
        qualifications: ['MD (Oxford)', 'Board Certified Medical Oncology (Memorial Sloan Kettering Fellow)'],
        experienceYears: 12,
        hospitalId: hospitals[0]._id,
        hospitalName: hospitals[0].name,
        bio: 'Medical Oncologist dedicated to precision targeted cancer therapies and compassionate survivorship care.',
        about: 'Dr. Sarah Al-Mansoor utilizes genomic profiling and immunotherapy to create personalized cancer management pathways.',
        consultationFee: 110,
        rating: 4.96,
        reviewCount: 74,
        location: { city: 'New York', state: 'NY', address: '450 Lexington Avenue, Floor 14' },
        availableDays: ['Monday', 'Wednesday', 'Thursday'],
        timeSlots: ['10:00 AM', '11:30 AM', '02:00 PM', '04:00 PM'],
        languages: ['English', 'Arabic'],
        services: ['Precision Oncology Review', 'Targeted Immunotherapy Consultation', 'Second Opinion Oncology Evaluations'],
      },
    ];

    const createdDoctors = [demoDoctor];

    for (const docData of otherDoctorsData) {
      const u = await User.create({
        name: docData.name,
        email: docData.email,
        password: 'Doctor@123',
        role: 'doctor',
        avatar: docData.avatar,
      });

      const d = await Doctor.create({
        userId: u._id,
        name: docData.name,
        email: docData.email,
        avatar: docData.avatar,
        specialty: docData.specialty,
        qualifications: docData.qualifications,
        experienceYears: docData.experienceYears,
        hospitalId: docData.hospitalId,
        hospitalName: docData.hospitalName,
        bio: docData.bio,
        about: docData.about,
        consultationFee: docData.consultationFee,
        rating: docData.rating,
        reviewCount: docData.reviewCount,
        location: docData.location,
        availableDays: docData.availableDays,
        timeSlots: docData.timeSlots,
        profileViews: Math.floor(Math.random() * 800) + 300,
        isVerified: true,
        languages: docData.languages,
        services: docData.services,
      });

      createdDoctors.push(d);
    }

    console.log('Seeding health posts...');
    const postsData = [
      {
        doctorId: demoDoctor._id,
        doctorName: demoDoctor.name,
        doctorSpecialty: demoDoctor.specialty,
        doctorAvatar: demoDoctor.avatar,
        title: '5 Daily Habits to Dramatically Lower Your Blood Pressure Naturally',
        summary: 'Cardiologist-backed lifestyle adjustments that reduce cardiovascular stress and support arterial elasticity without instant medication escalation.',
        content: `Hypertension is frequently termed the "silent killer" because it inflicts systemic arterial strain without early symptoms. 

### 1. The 30-Minute Aerobic Micro-Dose
Moderate continuous movement—such as brisk walking at 3.5 mph or cycling—signals your vascular endothelium to produce nitric oxide, promoting vasodilation. Aim for 150 minutes weekly.

### 2. The 2:1 Potassium-to-Sodium Balance
Rather than obsessing solely over sodium deprivation, actively elevate dietary potassium through avocados, spinach, coconut water, and wild salmon to assist renal sodium clearance.

### 3. Diaphragmatic 4-7-8 Breathing
Chronic sympathetic overdrive constricts peripheral arterioles. Engaging in 5 minutes of deep slow diaphragmatic pacing downregulates epinephrine and systolic pressures within minutes.

### 4. Hydration and Electrolyte Equilibrium
Dehydration leads to hemoconcentration and heightened blood viscosity. Drink adequate clean water throughout the day.

### 5. Consistent Sleep Architecture
Disrupted circadian cycles prevent the standard 10-20% nocturnal blood pressure "dipping", causing progressive arterial stiffness.`,
        coverImage: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop&q=80',
        category: 'Cardiology',
        tags: ['HeartHealth', 'BloodPressure', 'Wellness', 'Cardiology'],
        readTime: '4 min read',
        likes: [patientUser._id],
        likesCount: 38,
        comments: [
          {
            userId: patientUser._id,
            userName: patientUser.name,
            userAvatar: patientUser.avatar,
            userRole: 'patient',
            text: 'Extremely helpful Dr. Wright! The explanation of potassium balance made it so clear.',
            createdAt: new Date(),
          },
        ],
      },
      {
        doctorId: createdDoctors[1]._id,
        doctorName: createdDoctors[1].name,
        doctorSpecialty: createdDoctors[1].specialty,
        doctorAvatar: createdDoctors[1].avatar,
        title: 'The Ultimate Guide to Skin Barrier Repair & Retinoid Tolerance',
        summary: 'How to recover from a compromised moisture barrier, treat redness, and introduce actives safely.',
        content: `A disrupted stratum corneum leads to transepidermal water loss (TEWL), stinging upon moisturizer application, and sudden breakouts.

### The 3 Golden Rules of Barrier Recovery:
1. **Cease all chemical exfoliants & active AHAs/BHAs immediately** for 14 days.
2. **Layer biomimetic ceramides, cholesterol, and free fatty acids** in a 3:1:1 ratio.
3. **The Sandwich Method for Retinoids**: Moisturizer -> Pea-sized Retinoid -> Barrier Balm.

Remember that SPF 50+ broad spectrum sunscreen is your primary anti-aging and barrier-defense tool!`,
        coverImage: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80',
        category: 'Dermatology',
        tags: ['Skincare', 'Dermatology', 'AntiAging', 'SkinHealth'],
        readTime: '3 min read',
        likes: [patientUser._id],
        likesCount: 52,
        comments: [],
      },
      {
        doctorId: createdDoctors[2]._id,
        doctorName: createdDoctors[2].name,
        doctorSpecialty: createdDoctors[2].specialty,
        doctorAvatar: createdDoctors[2].avatar,
        title: 'Recognizing Early Warning Signs of Pediatric Respiratory Distress',
        summary: 'Crucial visual markers every parent and caregiver should identify when a child has a viral illness.',
        content: `When children develop bronchiolitis or viral respiratory infections, clinical signs can shift rapidly.

### Watch for these Red Flags:
- **Subcostal & Intercostal Retractions**: The chest sucks in beneath or between ribs during inhalation.
- **Nasal Flaring**: Nostrils widening with each breath.
- **Tracheal Tug**: The hollow at the base of the neck dipping deeply.
- **Lethargy or Refusal of Liquids**: Risk of rapid pediatric dehydration.

If you observe any chest retractions, seek immediate pediatric emergency assessment.`,
        coverImage: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80',
        category: 'Pediatrics',
        tags: ['Parenting', 'Pediatrics', 'ChildHealth', 'EmergencyCare'],
        readTime: '4 min read',
        likes: [],
        likesCount: 29,
        comments: [],
      },
      {
        doctorId: createdDoctors[3]._id,
        doctorName: createdDoctors[3].name,
        doctorSpecialty: createdDoctors[3].specialty,
        doctorAvatar: createdDoctors[3].avatar,
        title: 'Migraine vs. Tension Headache: How to Decode Your Symptoms',
        summary: 'Differentiating neurological vascular headache pathways from muscular tension, plus targeted remedies.',
        content: `Understanding your headache type is essential for choosing the right acute intervention:

- **Migraine**: Typically unilateral, throbbing/pulsating, exacerbated by routine physical activity, accompanied by nausea, photophobia, or visual aura. Responsive to triptans and CGRP antagonists.
- **Tension Headache**: Bilateral, band-like constriction around the forehead or occiput, mild-to-moderate, no nausea. Responsive to ergonomic fixes, hydration, and NSAIDs.`,
        coverImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80',
        category: 'Neurology',
        tags: ['Neurology', 'MigraineRelief', 'BrainHealth'],
        readTime: '3 min read',
        likes: [patientUser._id],
        likesCount: 44,
        comments: [],
      },
      {
        doctorId: createdDoctors[4]._id,
        doctorName: createdDoctors[4].name,
        doctorSpecialty: createdDoctors[4].specialty,
        doctorAvatar: createdDoctors[4].avatar,
        title: 'Knee Pain When Squatting? 3 Biomechanical Fixes for Patellofemoral Health',
        summary: 'Simple adjustments to hip torque, ankle dorsiflexion, and quad loading to safeguard your joint cartilage.',
        content: `Anterior knee pain is often an issue of upstream hip instability or downstream ankle stiffness rather than the knee itself.

1. **Improve Ankle Dorsiflexion**: Elevated heel squats temporarily offload patellar tendon strain.
2. **Glute Medius Activation**: Prevent knee valgus (collapsing inwards) with lateral band walks.
3. **Progressive Isometric Loading**: Spanish squats build tendon stiffness without painful joint friction.`,
        coverImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
        category: 'Orthopedics',
        tags: ['Orthopedics', 'JointHealth', 'SportsMedicine', 'Fitness'],
        readTime: '5 min read',
        likes: [],
        likesCount: 31,
        comments: [],
      },
    ];

    await Post.create(postsData);

    console.log('Seeding medical reels...');
    const reelsData = [
      {
        doctorId: demoDoctor._id,
        doctorName: demoDoctor.name,
        doctorSpecialty: demoDoctor.specialty,
        doctorAvatar: demoDoctor.avatar,
        title: 'How to check your resting pulse accurately in 15 seconds! ❤️',
        caption: 'Find your radial artery right along the thumb tendon. Count beats for 15s and multiply by 4. A normal resting range is 60-100 BPM! #HeartHealth #CardiologyTips',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-doctor-checking-a-patient-pulse-rate-41584-large.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80',
        tags: ['Cardiology', 'HeartRate', 'HealthTip'],
        duration: '0:35',
        category: 'Cardiology',
        likes: [patientUser._id],
        likesCount: 84,
        viewsCount: 650,
        comments: [
          {
            userId: patientUser._id,
            userName: patientUser.name,
            userAvatar: patientUser.avatar,
            text: 'Just measured 68 BPM! Thanks for the super clear demo doctor!',
            createdAt: new Date(),
          },
        ],
      },
      {
        doctorId: createdDoctors[1]._id,
        doctorName: createdDoctors[1].name,
        doctorSpecialty: createdDoctors[1].specialty,
        doctorAvatar: createdDoctors[1].avatar,
        title: 'Stop popping pimples like this! The "Triangle of Death" explained ⚠️',
        caption: 'The nasolabial facial danger triangle connects directly to the cavernous sinus! Here is how to apply hydrocolloid patches instead. #Dermatology #SkincareHacks',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-dermatologist-examining-a-patient-skin-41580-large.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80',
        tags: ['Dermatology', 'Skincare', 'SafetyFirst'],
        duration: '0:48',
        category: 'Dermatology',
        likes: [patientUser._id],
        likesCount: 140,
        viewsCount: 1200,
        comments: [],
      },
      {
        doctorId: createdDoctors[3]._id,
        doctorName: createdDoctors[3].name,
        doctorSpecialty: createdDoctors[3].specialty,
        doctorAvatar: createdDoctors[3].avatar,
        title: 'The 20-20-20 Rule to Prevent Digital Eye Strain & Tension Headaches 💻',
        caption: 'Every 20 minutes, look at an object 20 feet away for 20 seconds. Relaxes ciliary muscle spasms instantly! #Neurology #WorkFromHome',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-medical-analysis-of-brain-activity-41582-large.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80',
        tags: ['BrainHealth', 'Ergonomics', 'HeadacheFix'],
        duration: '0:30',
        category: 'Neurology',
        likes: [],
        likesCount: 65,
        viewsCount: 520,
        comments: [],
      },
      {
        doctorId: createdDoctors[4]._id,
        doctorName: createdDoctors[4].name,
        doctorSpecialty: createdDoctors[4].specialty,
        doctorAvatar: createdDoctors[4].avatar,
        title: '30-Second Posture Reset for Desk Workers 🏃‍♂️',
        caption: 'Open up the pectoralis minor and activate lower trapezius muscles with the doorway stretch routine! #Orthopedics #PostureCorrection',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-patient-doing-physiotherapy-exercises-41586-large.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
        tags: ['Posture', 'PhysicalTherapy', 'JointHealth'],
        duration: '0:42',
        category: 'Orthopedics',
        likes: [patientUser._id],
        likesCount: 92,
        viewsCount: 780,
        comments: [],
      },
    ];

    await Reel.create(reelsData);

    console.log('Seeding appointments...');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 5);
    const pastWeek = new Date(today);
    pastWeek.setDate(today.getDate() - 7);

    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    const appointmentsData = [
      {
        patientId: patientProfile._id,
        patientUserId: patientUser._id,
        patientName: patientUser.name,
        patientEmail: patientUser.email,
        patientPhone: patientUser.phone,
        doctorId: demoDoctor._id,
        doctorUserId: doctorUser._id,
        doctorName: demoDoctor.name,
        doctorSpecialty: demoDoctor.specialty,
        doctorAvatar: demoDoctor.avatar,
        hospitalId: hospitals[0]._id,
        hospitalName: hospitals[0].name,
        appointmentDate: formatDate(tomorrow),
        timeSlot: '10:30 AM',
        type: 'video',
        status: 'confirmed',
        reason: 'Hypertension Follow-Up & ECG Review',
        symptoms: 'Mild dizziness in mornings, tracking BP logs averaging 132/86 mmHg.',
        fee: demoDoctor.consultationFee,
        paymentStatus: 'paid',
        videoRoomId: 'cura-room-cardio-998',
      },
      {
        patientId: patientProfile._id,
        patientUserId: patientUser._id,
        patientName: patientUser.name,
        patientEmail: patientUser.email,
        patientPhone: patientUser.phone,
        doctorId: createdDoctors[1]._id,
        doctorUserId: createdDoctors[1].userId,
        doctorName: createdDoctors[1].name,
        doctorSpecialty: createdDoctors[1].specialty,
        doctorAvatar: createdDoctors[1].avatar,
        hospitalId: hospitals[1]._id,
        hospitalName: hospitals[1].name,
        appointmentDate: formatDate(nextWeek),
        timeSlot: '02:30 PM',
        type: 'in-person',
        status: 'confirmed',
        reason: 'Annual Dermatological Mole Check',
        symptoms: 'Pigmented lesion on shoulder for assessment.',
        fee: createdDoctors[1].consultationFee,
        paymentStatus: 'paid',
      },
      {
        patientId: patientProfile._id,
        patientUserId: patientUser._id,
        patientName: patientUser.name,
        patientEmail: patientUser.email,
        patientPhone: patientUser.phone,
        doctorId: demoDoctor._id,
        doctorUserId: doctorUser._id,
        doctorName: demoDoctor.name,
        doctorSpecialty: demoDoctor.specialty,
        doctorAvatar: demoDoctor.avatar,
        hospitalId: hospitals[0]._id,
        hospitalName: hospitals[0].name,
        appointmentDate: formatDate(pastWeek),
        timeSlot: '09:00 AM',
        type: 'in-person',
        status: 'completed',
        reason: 'Initial Cardiovascular Risk Stratification',
        symptoms: 'Family history of premature coronary artery disease.',
        notes: 'Advised lifestyle modifications, lipid panel re-check in 3 months, continued exercise.',
        prescription: 'Omega-3 Fatty Acids 1000mg OD, CoQ10 100mg OD',
        fee: demoDoctor.consultationFee,
        paymentStatus: 'paid',
      },
    ];

    await Appointment.create(appointmentsData);

    console.log('Database seeded successfully!');
    console.log('--- Demo Accounts ---');
    console.log('Patient: patient@test.com / Patient@123');
    console.log('Doctor:  doctor@test.com / Doctor@123');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};
