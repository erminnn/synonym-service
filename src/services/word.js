import Word from '../models/word.js';
import synonymService from './synonym';
import { createWordPayload, groupSynonymsByWords, filterWordsWhichDoNotExistInDatabase } from '../utils/word';

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

    const wordsWhichDoNotExistsInDatabase = filterWordsWhichDoNotExistInDatabase(wordWithSynonyms, words);

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
        await insertMultipleWords(wordsWhichDoNotExistsInDatabase, synonymsId);
    } else if (words.length === wordWithSynonyms.length) {
        return { msg: 'Words already exist' };
    } else {
        /* 
        Case 2:
            There is some words that exist in word collection.Group synonyms according to words that are found in word collection.
            This logic solves synonym tranisitve rule requirement
        */
        const synonymsGroupedByWords = groupSynonymsByWords(words);

        if (synonymsGroupedByWords.length === 1) {
            /*
                Case 1:
                    If array of grouped synonyms has length of 1.
                    Use synonymId of that one item.
                    Update synonym record in synonym collection, with adding new words which do not exist in database to his array.
                    Also insert new words which do not exist in database in word collection with synonymId of that one item.
            */
            await synonymService.addNewWordsToExistingSynonym(wordsWhichDoNotExistsInDatabase, synonymsGroupedByWords[0]);
            await insertMultipleWords(wordsWhichDoNotExistsInDatabase, synonymsGroupedByWords[0]);
        } else {
            /*
                Case 2:
                    Array of grouped synonyms has more than 1 item.
                    It means that there is synonym records in synonym collection, which will be synonyms to each other after adding new words that have come from frontend.
                    Query synonym collection and find synonyms from synonymsGroupedByWords sorted by synonyms size.The first item will have the largest number of synonyms.
                    Merge all synonyms into array except the first one which is the largest.
                    Add merged synonyms into the largest synonym.
                    Add new words into word collection with the synonymId of the largest synonym.
                    Update synonymId of words from merged synonyms with the id of the largest.
                    After adding, and updating, we can safely remove all synonym records from grouped synonyms except largest.

            */
            const synonymsSortedBySize = await synonymService.findSynonymsFromArray(synonymsGroupedByWords);
            const largestSynonym = synonymsSortedBySize[0];
            const mergedSynonyms = [];
            synonymsSortedBySize.slice(1, synonymsSortedBySize.length).forEach(({ synonyms }) => mergedSynonyms.push(...synonyms));
            const synonymsThatAreSafeToDelete = synonymsSortedBySize.slice(1, synonymsSortedBySize.length).map((synonym) => synonym._id);

            await synonymService.addNewWordsToExistingSynonym([...mergedSynonyms, ...wordsWhichDoNotExistsInDatabase], largestSynonym._id);
            await updateSynonymOfWords(largestSynonym._id, mergedSynonyms);
            await insertMultipleWords(wordsWhichDoNotExistsInDatabase, largestSynonym._id);
            await synonymService.deleteSynonyms(synonymsThatAreSafeToDelete);
        }
    }
};

const insertMultipleWords = async (words, synonymId) => {
    const wordsPayload = createWordPayload(words, synonymId);
    return await Word.insertMany(wordsPayload);
};

const findWordsFromArray = async (wordArray) => {
    return await Word.find({ name: { $in: wordArray } }).populate('synonyms');
};

const updateSynonymOfWords = async (synonymId, words) => {
    await Word.updateMany({ name: { $in: words } }, { $set: { synonyms: synonymId } });
};

export default {
    getWords,
    addWord
};
