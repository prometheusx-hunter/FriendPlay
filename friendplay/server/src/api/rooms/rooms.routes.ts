import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { listRooms } from './rooms.controller';

const router = Router();
router.get('/', requireAuth, listRooms);
export default router;