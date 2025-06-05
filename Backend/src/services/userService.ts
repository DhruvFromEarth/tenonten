import mongoose from 'mongoose';
import { UserModel } from '../models/user';

/**
 * Change a user's position, ensuring at least one admin remains.
 *
 * @param userId - The user to update
 * @param organisationId - The organisation to update
 * @param newPosition - 'admin' or 'member'
 */
export async function updateUserPosition(
  userId: mongoose.Types.ObjectId,
  organisationId: mongoose.Types.ObjectId,
  newPosition: 'admin' | 'member'
): Promise<void> {
  const user = await UserModel.findById(userId);
  if (!user) throw new Error('User not found');

  const orgIndex = user.organisations.findIndex(org => 
    org.organisationId.toString() === organisationId.toString()
  );
  if (orgIndex === -1) throw new Error('User not in organisation');

  const currentPosition = user.organisations[orgIndex].position;
  if (currentPosition === newPosition) return;

  if (currentPosition === 'admin' && newPosition === 'member') {
    const adminCount = await UserModel.countDocuments({
      'organisations.organisationId': organisationId,
      'organisations.position': 'admin',
      _id: { $ne: userId }
    });

    if (adminCount < 1) {
      throw new Error('At least one admin must remain in the organisation');
    }
  }

  user.organisations[orgIndex].position = newPosition;
  await user.save();
}
