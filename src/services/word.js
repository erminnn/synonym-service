import Word from '../models/word.js';

const getWords = async () => {
    return await Word.find({});
};
const addWord = async (wordPayload) => {};

export default {
    getWords,
    addWord
};
