import mongoose, { Document } from 'mongoose';

interface IMessage extends Document {
  message: string;
  roomId: string;
  time: Date;
  userName: string;
  organisationId: mongoose.Types.ObjectId;
}

//schema
const messageSchema = new mongoose.Schema<IMessage>({
  message: {
    type: String,
    required: true
  },
  roomId: {
    type: String,
    required: true,
    index: true
  },
  userName: {
    type: String,
    required: true
  },
  time: {
    type: Date,
    default: Date.now
  },
  organisationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organisation',
    required: true
  },
});
export const MessageModel = mongoose.model<IMessage>('Message', messageSchema);