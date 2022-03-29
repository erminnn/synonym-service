import Word from '../models/word.js';

const getWords = async () => {
    return await Word.find({});
};
const addWord = async (wordPayload) => {};

const findWordByName = async (word) => {
    return await Word.findOne({ name: word });
};

export default {
    getWords,
    addWord
};
