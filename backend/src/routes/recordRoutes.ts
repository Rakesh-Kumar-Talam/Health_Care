import { Router } from 'express';
import {
  getMyRecords,
  createRecord,
  getRecordById,
  updateRecord,
  deleteRecord,
} from '../controllers/recordController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All health record endpoints require user authentication
router.use(authenticate);

router.get('/', getMyRecords);
router.post('/', createRecord);
router.get('/:id', getRecordById);
router.put('/:id', updateRecord);
router.delete('/:id', deleteRecord);

export default router;
