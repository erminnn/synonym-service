import { model, Schema } from 'mongoose';

const WordSchema = new Schema({
    name: String,
    synonyms: {
        type: Schema.Types.ObjectId,
        ref: 'synonym'
    }
});

const WordModel = model('word', WordSchema);
export default WordModel;
