import { Request, Response, RequestHandler } from 'express';
import mongoose from 'mongoose';
import { createOrganisation } from '../services/organisationServices';
import { UserModel } from '../models/user';
import { OrganisationModel, IOrganisation } from '../models/organisation';
import { TaskModel } from '../models/task';

// Extend Express Request type to include userId
interface AuthRequest extends Request {
    userId: string;
}

interface PopulatedOrganisation {
    organisationId: IOrganisation;
    position: string;
}

export async function handleCreateOrganisation(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { organisationName } = req.body;
    const userId = req.userId;

    if (!organisationName) {
      res.status(400).json({ message: 'organisationName is required' });
      return;
    }

    if (!userId) {
      res.status(400).json({ message: 'User not authenticated' });
      return;
    }

    // Check if user exists
    const user = await UserModel.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Check if organisation name already exists
    const existingOrg = await OrganisationModel.findOne({ organisationName });
    if (existingOrg) {
      res.status(400).json({ message: 'Organisation with this name already exists' });
      return;
    }

    // Create organisation and set creator as admin
    await createOrganisation(
      organisationName,
      new mongoose.Types.ObjectId(String(userId))
    );

    res.status(201).json({ message: 'Organisation created successfully' });
  } catch (err: any) {
    console.error('Error in handleCreateOrganisation:', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
}

export async function handleJoinOrganisation(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { organisationName } = req.body;
    const userId = req.userId; // Get userId from auth middleware

    if (!organisationName) {
      res.status(400).json({ message: 'organisationName is required' });
      return;
    }

    if (!userId) {
      res.status(400).json({ message: 'User not authenticated' });
      return;
    }

    // Find organisation by name
    const organisation = await OrganisationModel.findOne({ organisationName });
    
    if (!organisation) {
      res.status(404).json({ message: 'Organisation does not exist' });
      return;
    }

    // Check if user is already in the organisation
    const user = await UserModel.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const orgId = organisation._id as mongoose.Types.ObjectId;
    if (user.organisations.some(org => org.organisationId.toString() === orgId.toString())) {
      res.status(400).json({ message: 'User is already a member of this organisation' });
      return;
    }

    // Add user to organisation's usersList
    await OrganisationModel.findByIdAndUpdate(
      orgId,
      { $push: { usersList: userId } }
    );

    // Update user's organisations array with both ID and position
    await UserModel.findByIdAndUpdate(
      userId,
      { 
        $push: { 
          organisations: {
            organisationId: orgId,
            position: 'member'
          }
        }
      }
    );

    res.status(200).json({ message: 'Successfully joined organisation' });
  } catch (err: any) {
    console.error('Error in handleJoinOrganisation:', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
}

export async function handleGetUserOrganisations(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(400).json({ message: 'User not authenticated' });
      return;
    }

    // Find user and populate their organizations
    const user = await UserModel.findById(userId);
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    console.log('User organisations before formatting:', user.organisations); // Debug log

    // Format the response to include organization name and position
    const formattedOrgs = await Promise.all(user.organisations.map(async (org) => {
      const organisation = await OrganisationModel.findById(org.organisationId);
      return {
        organisationName: organisation?.organisationName,
        position: org.position
      };
    }));

    console.log('Formatted organisations:', formattedOrgs); // Debug log

    // Return the formatted organizations
    res.status(200).json(formattedOrgs);
  } catch (err: any) {
    console.error('Error in handleGetUserOrganisations:', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
}

export async function handleGetOrgUsers(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    const { organisationName } = req.body;

    if (!userId) {
      res.status(400).json({ message: 'User not authenticated' });
      return;
    }

    if (!organisationName) {
      res.status(400).json({ message: 'Organisation name is required' });
      return;
    }

    // Find the organization by name
    const organisation = await OrganisationModel.findOne({ organisationName });
    if (!organisation) {
      res.status(404).json({ message: 'Organisation not found' });
      return;
    }

    // Get all users in the organization with their positions
    const users = await UserModel.find({
      'organisations.organisationId': organisation._id
    }).select('userName _id organisations role');

    // Get task counts for each user
    const taskCounts = await Promise.all(
      users.map(
        async (user) => {
      const tasksDoc = await TaskModel.findOne({ organisationId: organisation._id });
      let todo = 0, doing = 0, done = 0;
      if (tasksDoc) {
        tasksDoc.tasks.forEach(task => {
          if (task.assignedTo.some(id => id.toString() === (user._id as mongoose.Types.ObjectId).toString())) {
            if (task.status === 'todo') todo++;
            else if (task.status === 'doing') doing++;
            else if (task.status === 'done') done++;
          }
        });
      }
      return { userId: user._id, todo, doing, done };
    }));

    // Format the response to include position, role and task count per status
    const formattedUsers = users.map(
      user => {
      const userOrg = user.organisations.find(org => 
        org.organisationId.toString() === organisation._id.toString()
      );
      const taskCount = taskCounts.find(tc => 
        (tc.userId as mongoose.Types.ObjectId).toString() === (user._id as mongoose.Types.ObjectId).toString()
      ) || { todo: 0, doing: 0, done: 0 };
      return {
        _id: user._id,
        userName: user.userName,
        position: userOrg?.position || 'member',
        role: userOrg?.role || '',
        taskCount
      };
    });

    console.log('Found users in organization:', formattedUsers);
    res.status(200).json(formattedUsers);
  } catch (err: any) {
    console.error('Error in handleGetOrgUsers:', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
}

// Add user to organization
export const addUserToOrganisation = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { organisationName, userName, position } = req.body;
        const userId = req.userId;

        // Get user's organization
        const user = await UserModel.findById(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Find the organization by name
        const organisation = await OrganisationModel.findOne({ organisationName });
        if (!organisation) {
            res.status(404).json({ message: 'Organisation not found' });
            return;
        }

        // Check if the requesting user is an admin of the organization
        const userOrg = user.organisations.find(org => 
            org.organisationId.toString() === organisation._id.toString()
        );
        if (!userOrg || userOrg.position !== 'admin') {
            res.status(403).json({ message: 'Only admins can add users to the organization' });
            return;
        }

        // Find the user to add
        const userToAdd = await UserModel.findOne({ userName });
        if (!userToAdd) {
            res.status(404).json({ message: 'User to add not found' });
            return;
        }

        // Check if user is already in the organization
        if (userToAdd.organisations.some(org => 
            org.organisationId.toString() === organisation._id.toString()
        )) {
            res.status(400).json({ message: 'User is already in the organization' });
            return;
        }

        // Add user to organization
        userToAdd.organisations.push({
            organisationId: organisation._id,
            position: position || 'member',
            role: 'member'
        });
        await userToAdd.save();

        res.json({ message: 'User added to organization successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error adding user to organization', error });
    }
};

// Remove user from organization
export const removeUserFromOrganisation = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { organisationName, userName } = req.body;
        const userId = req.userId;

        // Get user's organization
        const user = await UserModel.findById(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Find the organization by name
        const organisation = await OrganisationModel.findOne({ organisationName });
        if (!organisation) {
            res.status(404).json({ message: 'Organisation not found' });
            return;
        }

        // Check if the requesting user is an admin of the organization
        const userOrg = user.organisations.find(org => 
            org.organisationId.toString() === organisation._id.toString()
        );
        if (!userOrg || userOrg.position !== 'admin') {
            res.status(403).json({ message: 'Only admins can remove users from the organization' });
            return;
        }

        // Find the user to remove
        const userToRemove = await UserModel.findOne({ userName });
        if (!userToRemove) {
            res.status(404).json({ message: 'User to remove not found' });
            return;
        }

        // Remove user from organization's usersList
        await OrganisationModel.findByIdAndUpdate(
            organisation._id,
            { $pull: { usersList: userToRemove._id } }
        );

        // Remove organization from user's organizations array
        userToRemove.organisations = userToRemove.organisations.filter(org => 
            org.organisationId.toString() !== organisation._id.toString()
        );
        await userToRemove.save();

        res.json({ message: 'User removed from organization successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error removing user from organization', error });
    }
};

// Export the functions as RequestHandler
export const handleCreateOrganisationHandler: RequestHandler = handleCreateOrganisation as unknown as RequestHandler;
export const handleJoinOrganisationHandler: RequestHandler = handleJoinOrganisation as unknown as RequestHandler;
export const handleGetUserOrganisationsHandler: RequestHandler = handleGetUserOrganisations as unknown as RequestHandler;
export const handleGetOrgUsersHandler: RequestHandler = handleGetOrgUsers as unknown as RequestHandler;
export const addUserToOrganisationHandler: RequestHandler = addUserToOrganisation as unknown as RequestHandler;
export const removeUserFromOrganisationHandler: RequestHandler = removeUserFromOrganisation as unknown as RequestHandler;

// Get all users in an organization
export const getUsersInOrganisation = async (req: any, res: Response) => {
  try {
    const { organisationName } = req.query;
    const userId = req.userId;

    // Get user's organization
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the organization by name
    const organisation = await OrganisationModel.findOne({ organisationName });
    if (!organisation) {
      return res.status(404).json({ message: 'Organisation not found' });
    }

    // Check if user belongs to this organization
    const userOrg = user.organisations.find(org => 
      org.organisationId.toString() === organisation._id.toString()
    );
    if (!userOrg) {
      return res.status(403).json({ message: 'User does not belong to this organization' });
    }

    // Get all users in the organization
    const users = await UserModel.find({
      'organisations.organisationId': organisation._id
    }).select('userName organisations');

    // Format the response to include position
    const formattedUsers = users.map(user => ({
      _id: user._id,
      userName: user.userName,
      position: user.organisations.find(org => 
        org.organisationId.toString() === organisation._id.toString()
      )?.position
    }));

    res.json(formattedUsers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users in organization', error });
  }
};

// Check if user is admin of organization
export const checkUserIsAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { organisationName } = req.body;
        const userId = req.userId;

        if (!organisationName) {
            res.status(400).json({ message: 'Organisation name is required' });
            return;
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Find the organization by name
        const organisation = await OrganisationModel.findOne({ organisationName });
        if (!organisation) {
            res.status(404).json({ message: 'Organisation not found' });
            return;
        }

        const isAdmin = user.organisations.some(org => 
            org.organisationId.toString() === organisation._id.toString() && 
            org.position === 'admin'
        );

        res.json({ isAdmin });
    } catch (error) {
        console.error('Error checking admin status:', error);
        res.status(500).json({ message: 'Error checking admin status', error });
    }
};

export const checkUserIsAdminHandler: RequestHandler = checkUserIsAdmin as unknown as RequestHandler;

export const handleJoinRequest = async (req: AuthRequest, res: Response) => {
    try {
        const { organisationName } = req.body;
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const organisation = await OrganisationModel.findOne({ organisationName });
        if (!organisation) {
            return res.status(404).json({ message: 'Organisation not found' });
        }

        // Check if user already has a pending request
        const existingRequest = organisation.joinRequests.find(req => 
            req.userId.toString() === userId && req.status === 'pending'
        );

        if (existingRequest) {
            return res.status(400).json({ message: 'You already have a pending request' });
        }

        // Add join request
        const newRequest = {
            _id: new mongoose.Types.ObjectId(),
            userId: new mongoose.Types.ObjectId(userId),
            status: 'pending' as const,
            requestedAt: new Date()
        };

        organisation.joinRequests.push(newRequest);
        await organisation.save();

        console.log('Join request saved:', {
            organisationName,
            userId,
            request: newRequest
        });

        res.status(200).json({ message: 'Join request sent successfully' });
    } catch (error) {
        console.error('Error in handleJoinRequest:', error);
        res.status(500).json({ message: 'Error processing join request' });
    }
};

export const handleGetJoinRequests = async (req: AuthRequest, res: Response) => {
    try {
        const { organisationName } = req.body;
        const userId = req.userId;

        console.log('Getting join requests for:', { organisationName, userId });

        if (!userId) {
            console.log('No userId found in request');
            return res.status(401).json({ message: 'User not authenticated' });
        }

        if (!organisationName) {
            console.log('No organisationName provided');
            return res.status(400).json({ message: 'Organisation name is required' });
        }

        const organisation = await OrganisationModel.findOne({ organisationName })
            .populate('joinRequests.userId', 'userName');

        if (!organisation) {
            console.log('Organisation not found:', organisationName);
            return res.status(404).json({ message: 'Organisation not found' });
        }

        // Check if user is admin
        const user = await UserModel.findById(userId);
        if (!user) {
            console.log('User not found:', userId);
            return res.status(404).json({ message: 'User not found' });
        }

        const isAdmin = user.organisations.some(org => 
            org.organisationId.toString() === organisation._id.toString() && 
            org.position === 'admin'
        );

        if (!isAdmin) {
            console.log('User is not admin:', { userId, organisationName });
            return res.status(403).json({ message: 'Not authorized to view join requests' });
        }

        console.log('Found join requests:', organisation.joinRequests);

        const formattedRequests = organisation.joinRequests.map(request => ({
            _id: request._id,
            userName: (request.userId as any).userName,
            status: request.status,
            requestedAt: request.requestedAt
        }));

        console.log('Formatted join requests:', formattedRequests);
        res.status(200).json(formattedRequests);
    } catch (error) {
        console.error('Error in handleGetJoinRequests:', error);
        res.status(500).json({ 
            message: 'Error fetching join requests',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export const handleJoinRequestResponse = async (req: AuthRequest, res: Response) => {
    try {
        const { organisationName, requestId, action } = req.body;
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const organisation = await OrganisationModel.findOne({ organisationName });
        if (!organisation) {
            return res.status(404).json({ message: 'Organisation not found' });
        }

        // Check if user is admin
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isAdmin = user.organisations.some(org => 
            org.organisationId.toString() === organisation._id.toString() && 
            org.position === 'admin'
        );

        if (!isAdmin) {
            return res.status(403).json({ message: 'Not authorized to handle join requests' });
        }

        const request = organisation.joinRequests.find(req => req._id.toString() === requestId);
        if (!request) {
            return res.status(404).json({ message: 'Join request not found' });
        }

        if (action === 'approve') {
            // Add user to organisation
            await OrganisationModel.updateOne(
                { organisationName },
                { 
                    $push: { usersList: request.userId },
                    $pull: { joinRequests: { _id: requestId } }
                }
            );

            // Update user's organisations array
            await UserModel.updateOne(
                { _id: request.userId },
                { $push: { organisations: { organisationId: organisation._id, position: 'member' } } }
            );
        } else if (action === 'reject') {
            // Remove the request
            await OrganisationModel.updateOne(
                { organisationName },
                { $pull: { joinRequests: { _id: requestId } } }
            );
        } else {
            return res.status(400).json({ message: 'Invalid action' });
        }

        res.status(200).json({ message: `Join request ${action}ed successfully` });
    } catch (error) {
        console.error('Error in handleJoinRequestResponse:', error);
        res.status(500).json({ message: 'Error processing join request response' });
    }
};

export const updateUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { organisationName, userName, role } = req.body;
    const userId = req.userId;

    if (!userId) {
      res.status(400).json({ message: 'User not authenticated' });
      return;
    }

    // Get user's organization
    const user = await UserModel.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Find the organization by name
    const organisation = await OrganisationModel.findOne({ organisationName });
    if (!organisation) {
      res.status(404).json({ message: 'Organisation not found' });
      return;
    }

    // Check if the requesting user is an admin of the organization
    const userOrg = user.organisations.find(org => 
      org.organisationId.toString() === organisation._id.toString()
    );
    if (!userOrg || userOrg.position !== 'admin') {
      res.status(403).json({ message: 'Only admins can update user roles' });
      return;
    }

    // Find the user to update
    const userToUpdate = await UserModel.findOne({ userName });
    if (!userToUpdate) {
      res.status(404).json({ message: 'User to update not found' });
      return;
    }

    // Update user's role
    const orgIndex = userToUpdate.organisations.findIndex(org => 
      org.organisationId.toString() === organisation._id.toString()
    );
    if (orgIndex !== -1) {
      userToUpdate.organisations[orgIndex].role = role;
      await userToUpdate.save();
    }

    res.json({ message: 'User role updated successfully' });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Error updating user role', error });
  }
};

export const updateUserRoleHandler: RequestHandler = updateUserRole as unknown as RequestHandler;
