import mongoose, { Schema, model, Document } from 'mongoose';

export type UserPosition = 'admin' | 'member';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  userName: string;
  password: string;
  rooms: mongoose.Types.ObjectId[];
  organisations: {
    organisationId: mongoose.Types.ObjectId;
    position: UserPosition;
    role: string;
  }[];
}

const UserSchema = new Schema<IUser>({
  userName: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  rooms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  }],
  organisations: [{
    organisationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organisation'
    },
    position: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member',
      required: true
    },
    role: {
      type: String,
      default: ''
    }
  }]
});

export const UserModel = model<IUser>('User', UserSchema);
