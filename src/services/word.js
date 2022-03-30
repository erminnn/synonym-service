import Word from '../models/word.js';
import synonymService from './synonym';
import { createWordPayload, groupSynonymsByWords } from '../utils/word';

const getWords = async () => {
    return await Word.find({}).populate('synonyms');
};

/*
    addWord function
    - Payload that comes from frontend has structure like this :
        {
            word: String,
            synonyms: [String]
        }
*/
const addWord = async (wordPayload) => {
    const { word, synonyms } = wordPayload;

    // - Merge word with synonyms into one array.Let's call that array wordWithSynonyms.
    const wordWithSynonyms = [...synonyms, word];

    //Find if any of words in wordWithSynonyms exists in database.
    const words = await findWordsFromArray(wordWithSynonyms);

    if (!words.length) {
        /*
        Case 1: If any of the words from wordWithSynonyms array do not exist in words collection
            - Use wordWithSynonyms as a synonym payload and create new synonym record in synonym collection with that array.
            - By default when new record is made, a uniqe id is given to that record.
            - Modify all words in wordWithSynonyms array, and add synonymsId to each word.
                That synonymsId will reference to synonym record that was created previously in synonyms collection.
            - Insert all modified words in word collection.
         */

        const { _id: synonymsId } = await synonymService.addSynonyms({ synonyms: wordWithSynonyms });
        await insertMultipleWords(wordWithSynonyms, [synonymsId], words);
    } else if (words.length === wordWithSynonyms.length) {
        return { msg: 'Words already exist' };
    } else {
        /* 
        Case 2:
            If there is some words that exist in word collection, group synonyms according to words that are found in word collection.
            Filter wordWithSynonyms and retrieve words that are not present in words of grouped synonym.
            For every synonym in grouped synonyms, find it in database and add filtered words to his synonyms array.
            Map synonymsGroupedByWords to get only ids of synonyms.
            Add words which are not in database with mapped synonym ids.

            This logic solves synonym tranisitve rule requirement
        */
        const synonymsGroupedByWords = groupSynonymsByWords(words);

        for (const synonym of synonymsGroupedByWords) {
            const synonyms = wordWithSynonyms.filter((word) => !synonym.words.includes(word));
            await synonymService.addNewSynonymsToExistingSynonym(synonym.synonymId, synonyms);
        }

        const synonymIds = synonymsGroupedByWords.map((synonym) => synonym.synonymId);

        await insertMultipleWords(wordWithSynonyms, synonymIds, words);
    }
};

const insertMultipleWords = async (wordWithSynonyms, synonymIds, wordsThatExistInDatabase) => {
    const words = createWordPayload(wordWithSynonyms, synonymIds, wordsThatExistInDatabase);
    return await Word.insertMany(words);
};

const findWordsFromArray = async (wordArray) => {
    return await Word.find({ name: { $in: wordArray } }).populate('synonyms');
};

export default {
    getWords,
    addWord
};
