import { Router } from 'express';
import wordController from '../controllers/word.js';

const wordRouter = Router();

wordRouter.get('/', wordController.getWords);
wordRouter.post('/', wordController.addWord);

export default wordRouter;
