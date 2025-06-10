import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  user_id: number;
  name: string;
  email: string;
  password: string;
}

const UserSchema: Schema = new Schema({
  user_id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false // Don't return password by default in queries
  }
}, {
  timestamps: true
});

export default mongoose.model<IUser>('User', UserSchema);
