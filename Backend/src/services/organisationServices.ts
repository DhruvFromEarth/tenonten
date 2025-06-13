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

interface ProjectMember {
  userName: string;
  position: string;
  role: string;
  skills: string[];
  projects: {
    projectName: string;
    position: string;
  }[];
}

export async function getRecursiveProjectMembers(
  organisationName: string,
  visitedUsers: Set<string> = new Set(),
  visitedProjects: Set<string> = new Set(),
  adminLevel: number = 0,
  currentLevel: number = 0
): Promise<ProjectMember[]> {
  try {
    // If we've already visited this project, return empty array to avoid cycles
    if (visitedProjects.has(organisationName)) {
      return [];
    }
    visitedProjects.add(organisationName);

    // Find the organization
    const organisation = await OrganisationModel.findOne({ organisationName });
    if (!organisation) {
      return [];
    }

    // Get all users in this organization
    const users = await UserModel.find({
      'organisations.organisationId': organisation._id
    }).select('userName organisations skills');

    const allMembers: ProjectMember[] = [];

    // If this is the root level (adminLevel = 0), find the admin
    let rootAdmin: string | null = null;
    if (adminLevel === 0) {
      const adminUser = users.find(user => {
        const userOrg = user.organisations.find(org => 
          org.organisationId.toString() === organisation._id.toString()
        );
        return userOrg?.position === 'admin';
      });
      if (adminUser) {
        rootAdmin = adminUser.userName;
        // Add admin to the list first
        const adminOrg = adminUser.organisations.find(org => 
          org.organisationId.toString() === organisation._id.toString()
        );
        const adminProjects = await Promise.all(
          adminUser.organisations.map(async (org) => {
            const project = await OrganisationModel.findById(org.organisationId);
            return {
              projectName: project?.organisationName || '',
              position: org.position
            };
          })
        );
        allMembers.push({
          userName: adminUser.userName,
          position: adminOrg?.position || 'admin',
          role: adminOrg?.role || '',
          skills: adminUser.skills || [],
          projects: adminProjects
        });
        // Add admin to visited users to prevent re-inclusion in downstream projects
        visitedUsers.add(rootAdmin);
      }
    }

    // Process each user
    for (const user of users) {
      // Skip if we've already processed this user
      if (visitedUsers.has(user.userName)) {
        continue;
      }

      // Get user's position in current organization
      const userOrg = user.organisations.find(org => 
        org.organisationId.toString() === organisation._id.toString()
      );

      // Skip if user is admin at current level (unless it's the root admin)
      if (userOrg?.position === 'admin' && user.userName !== rootAdmin) {
        continue;
      }

      // Skip if this is the root level and user is not a direct member
      if (adminLevel === 0 && userOrg?.position !== 'member') {
        continue;
      }

      visitedUsers.add(user.userName);

      // Get all projects this user is involved in
      const userProjects = await Promise.all(
        user.organisations.map(async (org) => {
          const project = await OrganisationModel.findById(org.organisationId);
          return {
            projectName: project?.organisationName || '',
            position: org.position
          };
        })
      );

      // Add user to members list
      allMembers.push({
        userName: user.userName,
        position: userOrg?.position || 'member',
        role: userOrg?.role || '',
        skills: user.skills || [],
        projects: userProjects
      });

      // Recursively get members from user's other projects
      for (const org of user.organisations) {
        const project = await OrganisationModel.findById(org.organisationId);
        if (project && !visitedProjects.has(project.organisationName)) {
          const nestedMembers = await getRecursiveProjectMembers(
            project.organisationName,
            visitedUsers,
            visitedProjects,
            adminLevel,
            currentLevel + 1
          );
          allMembers.push(...nestedMembers);
        }
      }
    }

    // Remove duplicates based on userName
    const uniqueMembers = Array.from(
      new Map(allMembers.map(member => [member.userName, member])).values()
    );

    return uniqueMembers;
  } catch (error) {
    console.error('Error in getRecursiveProjectMembers:', error);
    throw error;
  }
}
