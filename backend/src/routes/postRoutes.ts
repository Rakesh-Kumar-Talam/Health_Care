import { Router } from 'express';
import {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  toggleLikePost,
  addCommentPost,
} from '../controllers/postController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', getPosts);
router.get('/:id', getPostById);
router.post('/', authenticate, createPost);
router.put('/:id', authenticate, updatePost);
router.delete('/:id', authenticate, deletePost);
router.post('/:id/like', authenticate, toggleLikePost);
router.post('/:id/comment', authenticate, addCommentPost);

export default router;
