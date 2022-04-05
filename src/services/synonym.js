import Synonym from '../models/synonym';

const addSynonyms = async (synonymPayload) => {
    if (!synonymPayload) {
        throw new Error('Synonym payload is null');
    }
    return await new Synonym(synonymPayload).save();
};

const addNewWordsToExistingSynonym = async (synonyms, synonymId) => {
    if (!synonyms) {
        throw new Error('Synonyms array is null');
    }
    if (!synonymId) {
        throw new Error('Synonym id is null');
    }
    await Synonym.findByIdAndUpdate(synonymId, { $push: { synonyms: synonyms } }, { new: true });
};

const findSynonymsFromArray = async (array) => {
    if (!array) {
        throw new Error('Synonyms array is null');
    }
    return await Synonym.aggregate([
        {
            $match: {
                _id: { $in: array }
            }
        },
        {
            $project: {
                synonyms: 1,
                length: { $size: '$synonyms' }
            }
        },

        // Sort on the "synonyms size"
        { $sort: { length: -1 } }
    ]);
};

const deleteSynonyms = async (synonyms) => {
    if (!synonyms) {
        throw new Error('Synonyms array is null');
    }
    return await Synonym.deleteMany({ _id: { $in: synonyms } });
};

export default {
    addSynonyms,
    addNewWordsToExistingSynonym,
    findSynonymsFromArray,
    deleteSynonyms
};
