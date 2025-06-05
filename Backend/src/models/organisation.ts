import mongoose, { Schema, model, Document } from 'mongoose';

export interface IOrganisation extends Document {
    _id: mongoose.Types.ObjectId;
    organisationName: string;
    usersList: mongoose.Types.ObjectId[];
    joinRequests: {
        _id: mongoose.Types.ObjectId;
        userId: mongoose.Types.ObjectId;
        status: 'pending' | 'approved' | 'rejected';
        requestedAt: Date;
    }[];
}

const OrganisationSchema = new Schema<IOrganisation>({
    organisationName: {
        type: String,
        required: true,
        unique: true
    },
    usersList: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }], // Reference to User model
    joinRequests: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        },
        requestedAt: {
            type: Date,
            default: Date.now
        }
    }]
});

export const OrganisationModel = model<IOrganisation>('Organisation', OrganisationSchema);