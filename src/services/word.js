import Word from '../models/word.js';
import synonymService from './synonym';

const getWords = async () => {
    return await Word.find({}).populate('synonyms');
};
const addWord = async (wordPayload) => {
    const { name, synonyms } = wordPayload;
    /*
    - Payload that comes from frontend has structure like this :
            {
                name: String,
                synonyms: [String]
            }
    - Merge word with synonyms into one array.Let's call that array wordWithSynonymsArray.
    */
    const wordWithSynonymsArray = [...synonyms, name];

    //Find if any of words in wordWithSynonymsArray exists in database
    const words = await findWordsFromArray(wordWithSynonymsArray);

    if (words.length === wordWithSynonymsArray.length) {
        return { msg: 'Words already exists' };
    }

    if (!words.length) {
        /*
        Case 1: If any of the words from wordWithSynonymsArray array do not exist in word collection
            - Use wordWithSynonymsArray as a synonym payload and create new synonym record in synonym collection with that array.
            - By default when new record is made, a uniqe id is given to that record.
            - Modify all words in wordWithSynonymsArray array, and add synonymsId to each word.
                That synonymsId will reference to synonym record that was created previously in synonyms collection.
            - Insert all modified words in word collection.
         */

        const { _id: synonymsId } = await synonymService.addSynonyms({ synonyms: wordWithSynonymsArray });
        const modifiedWordPayload = wordWithSynonymsArray.map((word) => ({ name: word, synonyms: [synonymsId] }));
        return await Word.insertMany(modifiedWordPayload);
    } else {
        /* 
        Case 2:
            If there is some words that exist in word collection, group synonyms according to words that are found in word collection.
            Filter wordWithSynonymsArray and retrieve words that are not present in words of grouped synonym.
            For every synonym in grouped synonyms, find it in database and add filtered words to his synonyms array.
            Map synonymsGroupedByWords to get only ids of synonyms.
            Add words which are not in database with mapped synonym ids
        */
        const synonymsGroupedByWords = groupSynonymsByWords(words);
        for (const synonym of synonymsGroupedByWords) {
            const synonyms = wordWithSynonymsArray.filter((word) => !synonym.words.includes(word));
            await synonymService.addNewSynonymsToExistingSynonym(synonym.synonymId, synonyms);
        }

        const synonymIds = synonymsGroupedByWords.map((synonym) => synonym.synonymId);

        const wordsPayload = wordWithSynonymsArray.reduce((acc, word) => {
            const found = words.find(({ name }) => word === name);
            if (!found) {
                acc.push({ name: word, synonyms: synonymIds });
            }
            return acc;
        }, []);

        return await Word.insertMany(wordsPayload);
    }
};

const findWordsFromArray = async (wordArray) => {
    return await Word.find({ name: { $in: wordArray } }).populate('synonyms');
};

const groupSynonymsByWords = (words) => {
    return words.reduce((acc, word) => {
        word.synonyms.forEach((synonym) => {
            const index = acc.findIndex(({ synonymId }) => synonymId.toString() === synonym._id.toString());
            if (index === -1) {
                acc.push({ synonymId: synonym._id, words: [word.name] });
            } else {
                acc[index].words.push(word.name);
            }
        });
        return acc;
    }, []);
};

export default {
    getWords,
    addWord
};
