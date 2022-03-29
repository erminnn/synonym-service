import wordService from '../services/word.js';

const getWords = async (req, res, next) => {
    try {
        res.json(await wordService.getWords());
    } catch (err) {
        next(err);
    }
};

const addWord = async (req, res, next) => {
    try {
        res.json(await wordService.addWord(req.body));
    } catch (err) {
        next(err);
    }
};

export default {
    getWords,
    addWord
};
