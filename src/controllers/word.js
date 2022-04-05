import wordService from '../services/word.js';

const getWords = async (req, res, next) => {
    try {
        res.status(200).json({ success: true, data: await wordService.getWords() });
    } catch (err) {
        next(err);
    }
};

const searchWord = async (req, res, next) => {
    try {
        const { word } = req.query;
        res.status(200).json({ success: true, data: await wordService.searchWord(word) });
    } catch (err) {
        next(err);
    }
};

const addWord = async (req, res, next) => {
    try {
        res.status(200).json({ success: true, data: await wordService.addWord(req.body) });
    } catch (err) {
        next(err);
    }
};

export default {
    getWords,
    addWord,
    searchWord
};
