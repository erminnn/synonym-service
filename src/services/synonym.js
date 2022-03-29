import Synonym from '../models/synonym';

const addSynonyms = async (synonymPayload) => {
    return await new Synonym(synonymPayload).save();
};

export default {
    addSynonyms
};
