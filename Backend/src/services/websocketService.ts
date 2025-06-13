import { WebSocket } from 'ws';
import { MessageModel } from '../models/message';
import { User, Message } from '../types';
import { UserModel } from '../models/user';

const users = new Map<string, User>(); // userName -> User
const rooms = new Map<string, Set<string>>(); // roomId -> Set of userNames

// Helper function to get user's organization ID
async function getUserOrganisationId(userName: string): Promise<string | null> {
  try {
    const user = await UserModel.findOne({ userName });
    if (!user || !user.organisations || user.organisations.length === 0) {
      return null;
    }
    // Get the first organization's ID (you might want to modify this based on your requirements)
    return user.organisations[0].organisationId.toString();
  } catch (error) {
    console.error('Error getting user organization:', error);
    return null;
  }
}

const broadcastToRoom = (roomId: string, message: Message) => {
  const roomuserNames = rooms.get(roomId);
  if (!roomuserNames) return;

  roomuserNames.forEach(userName => {
    const user = users.get(userName);
    if (user && user.ws.readyState === WebSocket.OPEN) {
      user.ws.send(JSON.stringify(message));
    }
  });
};

// Helper function to get current time
function getCurrentTime(): string {
  return new Date().toISOString();
}

// Helper function to load chat history
async function loadChatHistory(roomId: string, ws: WebSocket) {
  try {
    const messages = await MessageModel.find({ roomId })
      .sort({ time: 1 })
      .limit(10); // Limit to last 10 messages

    const formattedMessages = messages.map(msg => ({
      type: 'message',
      payload: {
        roomId: msg.get('roomId'),
        userName: msg.get('userName'),
        message: msg.get('message'),
        time: msg.get('time').toISOString()
      }
    }));

    const historyMessage: Message = {
      type: 'history',
      payload: {
        roomId,
        userName: 'system',
        message: JSON.stringify(formattedMessages),
        time: getCurrentTime()
      }
    };
    ws.send(JSON.stringify(historyMessage));
  } catch (error) {
    console.error('Error loading chat history:', error);
  }
}

export const handleWebSocketConnection = (ws: WebSocket) => {

  // this can be used if there is no room general.
  // console.log('New client connected');

  ws.on('message', async (data: string) => {
    try {
      const message: Message = JSON.parse(data);

      if (message.type === 'join') {
        // Handle user joining a room
        const userName = message.payload.userName;
        const roomId = message.payload.roomId;

        // Remove user from previous room if they were in one
        const existingUser = users.get(userName);
        if (existingUser) {
          const oldRoom = existingUser.roomId;
          const oldRoomUsers = rooms.get(oldRoom);
          if (oldRoomUsers) {
            oldRoomUsers.delete(userName);
            if (oldRoomUsers.size === 0) {
              rooms.delete(oldRoom);
            }
          }
        }

        // Add user to new room
        const user: User = {
          userName,
          roomId,
          ws
        };
        users.set(userName, user);

        // Add user to room's set of users
        if (!rooms.has(roomId)) {
          rooms.set(roomId, new Set());
        }
        rooms.get(roomId)?.add(userName);

        // Load chat history for the room
        await loadChatHistory(roomId, ws);

        // Only broadcast join message if user is joining a new room
        if (!existingUser || existingUser.roomId !== roomId) {
          broadcastToRoom(roomId, message);
          console.log(`User ${userName} joined room ${roomId}`);
        }
      }
      else if (message.type === 'message') {
        // Get user's organization ID
        const organisationId = await getUserOrganisationId(message.payload.userName);
        if (!organisationId) {
          console.error('No organization found for user:', message.payload.userName);
          return;
        }

        // Save message to MongoDB
        const newMessage = new MessageModel({
          roomId: message.payload.roomId,
          userName: message.payload.userName,
          message: message.payload.message,
          time: new Date(message.payload.time),
          organisationId
        });
        await newMessage.save();

        // Broadcast message to room
        broadcastToRoom(message.payload.roomId, message);
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', async () => {
    // Find and remove the disconnected user
    for (const [userName, user] of users.entries()) {
      if (user.ws === ws) {
        // Remove user from room
        const roomId = user.roomId;
        const roomUsers = rooms.get(roomId);
        if (roomUsers) {
          roomUsers.delete(userName);
          if (roomUsers.size === 0) {
            rooms.delete(roomId);
          }
        }

        // Remove user from users map
        users.delete(userName);

        // Get user's organization ID
        const organisationId = await getUserOrganisationId(userName);
        if (!organisationId) {
          console.error('No organization found for user:', userName);
          return;
        }

        // Create and save leave message to MongoDB
        const leaveMessage: Message = {
          type: 'message' as const,
          payload: {
            roomId,
            userName: 'system',
            message: `${userName} has left the room`,
            time: new Date().toISOString()
          }
        };

        try {
          // Save to MongoDB
          const newMessage = new MessageModel({
            roomId: leaveMessage.payload.roomId,
            userName: leaveMessage.payload.userName,
            message: leaveMessage.payload.message,
            time: new Date(leaveMessage.payload.time),
            organisationId
          });
          await newMessage.save();

          // Broadcast leave message
          broadcastToRoom(roomId, leaveMessage);
          console.log(`User ${userName} disconnected from room ${roomId}`);
        } catch (error) {
          console.error('Error saving leave message:', error);
        }
        break;
      }
    }
  });
};

export { users, rooms };