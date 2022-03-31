import Synonym from '../models/synonym';

const addSynonyms = async (synonymPayload) => {
    return await new Synonym(synonymPayload).save();
};

const addNewWordsToExistingSynonym = async (synonyms, synonymId) => {
    await Synonym.findByIdAndUpdate(synonymId, { $push: { synonyms: synonyms } }, { new: true });
};

const findSynonymsFromArray = async (array) => {
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
    return await Synonym.deleteMany({ _id: { $in: synonyms } });
};

export default {
    addSynonyms,
    addNewWordsToExistingSynonym,
    findSynonymsFromArray,
    deleteSynonyms
};
