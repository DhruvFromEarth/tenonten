import { Request, Response } from 'express';
import { RoomModel } from '../models/room';
import { UserModel } from '../models/user';

export const createRoom = async (req: Request, res: Response) => {
  const { roomName } = req.body;
  try {
    const newRoom = new RoomModel({ roomName, usersList: [] });
    await newRoom.save();
    res.status(201).json(newRoom);
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ message: 'Error creating room' });
  }
};

export const addUserToRoom = async (req: Request, res: Response) => {
  const { roomId, userId } = req.params;
  try {
    await RoomModel.findByIdAndUpdate(roomId, { $addToSet: { usersList: userId } });
    await UserModel.findByIdAndUpdate(userId, { $addToSet: { rooms: roomId } });
    res.status(200).json({ message: 'User added to room successfully' });
  } catch (error) {
    console.error('Error adding user to room:', error);
    res.status(500).json({ message: 'Error adding user to room' });
  }
};
