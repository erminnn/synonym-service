/* 
    The first parameter of function represents array of words (Strings).
    The second parameter of function represents synonymId.

    Description:
        Map words and creates word model structure for every word.
        Word model structure:
            {
                name: String,
                synonyms: ObjectId
            }
        Function returns array of word objects, which will be saved in word collection.
*/
const createWordPayload = (words, synonymId) => {
    if (!words) {
        throw new Error('words array is null');
    }
    if (!synonymId) {
        throw new Error('synonymId is null');
    }
    return words.map((word) => ({ name: word, synonyms: synonymId }));
};

/* 
    In short this function groups synonyms by words.

    words parameter is array of word objects populated with synonyms.
    This is the strucute of one word object from array:
        {
            _id: ObjectId
            name: String,
            synonyms: 
                {
                    _id: ObjectId
                    synonyms: [String]
                }
    
        }
    Description:
        With current logic, there can be multiple words with the same synonyms id.
        Function returns an array of synonyms id.
*/
const groupSynonymsByWords = (words) => {
    if (!words) {
        throw new Error('words array is null');
    }

    return words.reduce((acc, word) => {
        const found = acc.find((synonym) => synonym.toString() === word.synonyms._id.toString());
        if (!found) {
            acc.push(word.synonyms._id);
        }
        return acc;
    }, []);
};
/*
    This function filters words which do not exist in database.
    
    The first parameter of function represents array of words (Strings).
    The second parameter of function represents array of word objects.

    Strucutre of word object:
    {
        _id: ObjectId,
        name: String,
        synonyms: ObjectId
    }

*/
const filterWordsWhichDoNotExistInDatabase = (words, wordsThatExistInDatabase) => {
    if (!words) {
        throw new Error('words array is null');
    }
    if (!wordsThatExistInDatabase) {
        throw new Error('wordsThatExistInDatabase array is null');
    }
    return words.filter((word) => !wordsThatExistInDatabase.find(({ name }) => word.toLowerCase() === name.toLowerCase()));
};

export { createWordPayload, groupSynonymsByWords, filterWordsWhichDoNotExistInDatabase };
