import Synonym from '../models/synonym';

const addSynonyms = async (synonymPayload) => {
    return await new Synonym(synonymPayload).save();
};

const addNewSynonymsToExistingSynonym = async (synonymId, synonyms) => {
    await Synonym.findByIdAndUpdate(synonymId, { $push: { synonyms: synonyms } }, { new: true });
};

export default {
    addSynonyms,
    addNewSynonymsToExistingSynonym
};
