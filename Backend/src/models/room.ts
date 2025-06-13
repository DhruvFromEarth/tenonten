import mongoose, { Schema, model, Document } from 'mongoose';

export interface IRoom extends Document {
    roomName: string;
    usersList: mongoose.Types.ObjectId[];
    organisationId: mongoose.Types.ObjectId;
}

// schema
const RoomSchema = new Schema<IRoom>({
    roomName: {
        type: String,
        required: true
    },
    usersList: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }], // Reference to User model
    organisationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organisation',
        required: true
    },
});

export const RoomModel = model<IRoom>('Room', RoomSchema);