import { Request, Response } from 'express';
import { TaskModel } from '../models/task';
import mongoose from 'mongoose';
import { UserModel } from '../models/user';
import { OrganisationModel, IOrganisation } from '../models/organisation';
import { AuthRequest } from '../middlewares/authMiddleware';

// Get all tasks for a user's organization
export const getTasks = async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    const { organisationName } = req.query;
    
    if (!organisationName) {
      return res.status(400).json({ message: 'Organisation name is required' });
    }
    
    // Get user's organization
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the organization by name
    const organisation = await OrganisationModel.findOne({ organisationName }) as IOrganisation;
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

    // Get tasks for the organization
    let tasks = await TaskModel.findOne({ organisationId: organisation._id });
    if (!tasks) {
      tasks = new TaskModel({ 
        organisationId: organisation._id, 
        tasks: [] 
      });
      await tasks.save();
    }
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error });
  }
};

// Create a new task
export const createTask = async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    const { taskTitle, taskDescription, assignedTo, status, organisationName } = req.body;

    if (!organisationName) {
      return res.status(400).json({ message: 'Organisation name is required' });
    }

    // Get user's organization
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the organization by name
    const organisation = await OrganisationModel.findOne({ organisationName }) as IOrganisation;
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

    // First, try to find existing tasks document for the organization
    let tasksDoc = await TaskModel.findOne({ organisationId: organisation._id });

    // If no document exists, create one
    if (!tasksDoc) {
      tasksDoc = new TaskModel({
        organisationId: organisation._id,
        tasks: []
      });
      await tasksDoc.save();
    }

    // Create the new task
    const task = {
      taskTitle,
      taskDescription,
      status,
      createdBy: userId,
      timestamp: { todo: { date: new Date(), userId } },
      assignedTo: assignedTo || []
    };

    // Add the task to the existing document
    tasksDoc.tasks.push(task);
    await tasksDoc.save();

    res.json(tasksDoc);
  } catch (error) {
    res.status(500).json({ message: 'Error creating task', error });
  }
};

// Update task status
export const updateTaskStatus = async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    const taskId = req.params.taskId;
    const { status } = req.body;
    const { organisationName } = req.query;

    if (!organisationName) {
      return res.status(400).json({ message: 'Organisation name is required' });
    }

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

    const tasksDoc = await TaskModel.findOne({ 
      organisationId: organisation._id
    });

    if (!tasksDoc) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Find and update the specific task
    const task = tasksDoc.tasks.find(t => t._id && t._id.toString() === taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const currentTime = new Date();

    // Handle status changes and timestamps
    if (status === 'todo') {
      // Moving to todo - clear other timestamps
      task.timestamp.doing = undefined;
      task.timestamp.done = undefined;
      task.timestamp.todo = { date: currentTime, userId };
    } else if (status === 'doing') {
      // Moving to doing - clear done timestamp
      task.timestamp.done = undefined;
      task.timestamp.doing = { date: currentTime, userId };
    } else if (status === 'done') {
      // Moving to done
      if (task.status === 'todo') {
        // If jumping from todo to done, set both doing and done timestamps
        task.timestamp.doing = { date: currentTime, userId };
        task.timestamp.done = { date: currentTime, userId };
      } else {
        // Normal move to done
        task.timestamp.done = { date: currentTime, userId };
      }
    }

    // Update the task status
    task.status = status;

    await tasksDoc.save();
    res.json(tasksDoc);
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ message: 'Error updating task status', error });
  }
};

// Update task details
export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const taskId = req.params.taskId;
    const { taskTitle, taskDescription, assignedTo, organisationName } = req.body;

    if (!organisationName) {
      res.status(400).json({ message: 'Organisation name is required' });
      return;
    }

    // Find the organization
    const organisation = await OrganisationModel.findOne({ organisationName });
    if (!organisation) {
      res.status(404).json({ message: 'Organisation not found' });
      return;
    }

    // Find the tasks document for this organization
    const tasksDoc = await TaskModel.findOne({ organisationId: organisation._id });
    if (!tasksDoc) {
      res.status(404).json({ message: 'Tasks document not found' });
      return;
    }

    // Find and update the specific task
    const task = tasksDoc.tasks.find(t => t._id && t._id.toString() === taskId);
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    task.taskTitle = taskTitle;
    task.taskDescription = taskDescription;
    task.assignedTo = assignedTo;
    await tasksDoc.save();

    res.json({ message: 'Task updated successfully', tasks: tasksDoc.tasks });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Error updating task' });
  }
};

// Delete a task
export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;
    const { organisationName } = req.query;
    const userId = req.userId;

    if (!organisationName) {
      res.status(400).json({ message: 'Organisation name is required' });
      return;
    }

    // Find the organization
    const organisation = await OrganisationModel.findOne({ organisationName });
    if (!organisation) {
      res.status(404).json({ message: 'Organisation not found' });
      return;
    }

    // Check if user is admin
    const user = await UserModel.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const userOrg = user.organisations.find(org => 
      org.organisationId.toString() === organisation._id.toString()
    );

    if (!userOrg || userOrg.position !== 'admin') {
      res.status(403).json({ message: 'Only admins can delete tasks' });
      return;
    }

    // Find the tasks document for this organization
    const tasksDoc = await TaskModel.findOne({ organisationId: organisation._id });
    if (!tasksDoc) {
      res.status(404).json({ message: 'Tasks document not found' });
      return;
    }

    // Remove the task from the tasks array
    tasksDoc.tasks = tasksDoc.tasks.filter(task => task._id && task._id.toString() !== taskId);
    await tasksDoc.save();

    res.json({ message: 'Task deleted successfully', tasks: tasksDoc.tasks });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Error deleting task' });
  }
};
