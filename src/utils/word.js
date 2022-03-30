/* 
    The first parameter of function represents array that is combined from word and synonyms.
    The second parameter of function represents array of synonymIds from synonym collection.
    The third parameter of function represents array of word records from word collection.

    Description:
        Filters words that don't exist in word collection and creates word model structure for every word.
        Word model structure:
            {
                name: String,
                synonyms: [ObjectId]
            }
        Function returns array of word objects, which will be saved in word collection.
*/
const createWordPayload = (wordWithSynonyms, synonymIds, wordsThatExistInDatabase) => {
    return wordWithSynonyms.reduce((acc, word) => {
        const found = wordsThatExistInDatabase.find(({ name }) => word === name);
        if (!found) {
            acc.push({ name: word, synonyms: synonymIds });
        }
        return acc;
    }, []);
};

/* 
    In short this function groups synonyms by words.

    words parameter is array of word objects populated with synonyms.
    This is the strucute of one word object from array:
        {
            _id: ObjectId
            name: String,
            synonyms: 
            [
                {
                    _id: ObjectId
                    synonyms: [String]
                }
            ]
        }
    Description:
        With current logic, there can be multiple words with the same synonyms id.
        This function groups all words into one array which have same synonyms id.
        Function returns an array of objects with this structure:
            {
                synonymId: ObjectId
                words: [String]
            }
*/
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

export { createWordPayload, groupSynonymsByWords };
