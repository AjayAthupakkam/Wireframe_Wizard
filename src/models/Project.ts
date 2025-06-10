import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export interface IProject extends Document {
  project_id: number;
  user_id: number;
  title: string;
  image_url: string;
  ai_model: string;
  generated_code: string;
  created_at: Date;
}

const ProjectSchema: Schema = new Schema({
  project_id: {
    type: Number,
    required: true,
    unique: true
  },
  user_id: {
    type: Number,
    required: true,
    ref: 'User' // Reference to User model
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  image_url: {
    type: String,
    required: true
  },
  ai_model: {
    type: String,
    required: true
  },
  generated_code: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<IProject>('Project', ProjectSchema);
