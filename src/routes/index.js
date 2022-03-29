import { Router } from 'express';
import wordRouter from './word.js';

const router = Router();

router.use('/word', wordRouter);

export default router;
