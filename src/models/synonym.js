import { model, Schema } from 'mongoose';

const SynonymSchema = new Schema({
    synonyms: [String]
});

const SynonymModel = model('synonym', SynonymSchema);
export default SynonymModel;
