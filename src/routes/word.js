import { Router } from 'express';
import wordController from '../controllers/word.js';

const wordRouter = Router();

wordRouter.get('/', wordController.getWords);
wordRouter.get('/search', wordController.searchWord);
wordRouter.post('/', wordController.addWord);

export default wordRouter;
