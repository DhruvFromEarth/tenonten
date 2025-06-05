import mongoose from 'mongoose';
import { OrganisationModel } from '../models/organisation';
import { UserModel } from '../models/user';

export async function createOrganisation(
  organisationName: string,
  userId: mongoose.Types.ObjectId
): Promise<mongoose.Document> {
  try {
    // Create the organisation with the creator as the only user
    const organisation = await OrganisationModel.create({
      organisationName,
      usersList: [userId]
    });

    // Update the creator user: add to organisations array and set position
    await UserModel.findByIdAndUpdate(
      userId,
      {
        $push: { 
          organisations: {
            organisationId: organisation._id,
            position: 'admin'
          }
        }
      }
    );

    return organisation;
  } catch (error) {
    console.error('Error in createOrganisation:', error);
    throw error;
  }
}
