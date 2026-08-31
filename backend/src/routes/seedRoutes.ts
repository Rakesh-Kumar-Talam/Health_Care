import { Router, Request, Response } from 'express';
import { seedDatabase } from '../seed/seedData';

const router = Router();

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    await seedDatabase();
    res.status(200).json({
      success: true,
      message: 'Database seeded successfully with demo patients, doctors, hospitals, posts, reels, and appointments!',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to seed database',
    });
  }
});

export default router;
