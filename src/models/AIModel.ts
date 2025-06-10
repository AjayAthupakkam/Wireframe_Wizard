import mongoose, { Document, Schema } from 'mongoose';

export interface IAIModel extends Document {
  model_id: number;
  name: string;
  description: string;
}

const AIModelSchema: Schema = new Schema({
  model_id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  }
});

export default mongoose.model<IAIModel>('AIModel', AIModelSchema);
