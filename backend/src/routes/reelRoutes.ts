import { Router } from 'express';
import {
  getReels,
  getReelById,
  createReel,
  updateReel,
  deleteReel,
  toggleLikeReel,
  addCommentReel,
} from '../controllers/reelController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', getReels);
router.get('/:id', getReelById);
router.post('/', authenticate, createReel);
router.put('/:id', authenticate, updateReel);
router.delete('/:id', authenticate, deleteReel);
router.post('/:id/like', authenticate, toggleLikeReel);
router.post('/:id/comment', authenticate, addCommentReel);

export default router;
