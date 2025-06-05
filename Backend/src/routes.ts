import express, { Router, RequestHandler } from 'express';
import { auth } from './middlewares/auth';
import { createUser, loginUser, handleUpdateUserPosition } from './controllers/userController';
import { createRoom, addUserToRoom } from './controllers/roomController';
import {
    handleCreateOrganisation,
    handleJoinOrganisation,
    handleGetUserOrganisations,
    handleGetOrgUsers,
    handleJoinRequest,
    handleGetJoinRequests,
    handleJoinRequestResponse,
    addUserToOrganisation,
    removeUserFromOrganisation,
    checkUserIsAdmin,
    updateUserRoleHandler
} from './controllers/organisationController';
import { getTasks, createTask, updateTaskStatus, updateTask, deleteTask } from './controllers/taskController';

const router: Router = express.Router();

// User routes
router.post('/user/create-user', createUser); //signup
router.post('/user/login', loginUser); //login
router.put('/user/update-position', auth, handleUpdateUserPosition as RequestHandler); // Update user position (admin/member)

// room routes
router.post('/room/', auth, createRoom); // Create a new room
router.post('/room/:roomId', auth, addUserToRoom); // Add user to room

// Task routes
router.get('/task', auth, getTasks as RequestHandler); // Get all tasks for a user
router.post('/task', auth, createTask as RequestHandler); // Create a new task
router.patch('/task/:taskId/status', auth, updateTaskStatus as unknown as RequestHandler); // Update task status
router.patch('/task/:taskId', auth, updateTask as unknown as RequestHandler); // Update task details
router.delete('/task/:taskId', auth, deleteTask as unknown as RequestHandler); // Delete a task

//organisation routes
router.post('/org/create', auth, handleCreateOrganisation as unknown as RequestHandler);
router.post('/org/join', auth, handleJoinOrganisation as unknown as RequestHandler);
router.post('/org/join-request', auth, handleJoinRequest as unknown as RequestHandler);
router.post('/org/join-requests', auth, handleGetJoinRequests as unknown as RequestHandler);
router.post('/org/join-request-response', auth, handleJoinRequestResponse as unknown as RequestHandler);
router.get('/org/organisations', auth, handleGetUserOrganisations as unknown as RequestHandler);
router.post('/org/users', auth, handleGetOrgUsers as unknown as RequestHandler);
router.post('/org/add-user', auth, addUserToOrganisation as unknown as RequestHandler);
router.post('/org/remove-user', auth, removeUserFromOrganisation as unknown as RequestHandler);
router.post('/org/check-admin', auth, checkUserIsAdmin as unknown as RequestHandler);
router.post('/org/update-role', auth, updateUserRoleHandler);

export default router;