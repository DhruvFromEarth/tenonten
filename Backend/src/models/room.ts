import mongoose, { Schema, model, Document } from 'mongoose';

export interface IRoom extends Document {
    // roomId: mongoose.Types.ObjectId;
    roomName: string;
    usersList: mongoose.Types.ObjectId[];
    organisationId: mongoose.Types.ObjectId;
}

// schema
const RoomSchema = new Schema<IRoom>({
    // roomId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     required: true, unique: true, auto: true
    // }, // Auto-generate ObjectId
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