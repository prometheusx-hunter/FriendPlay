import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { getUserProfile } from './users.controller';

const router = Router();

router.get('/:id', requireAuth, getUserProfile);

export default router;
