import mongoose from 'mongoose'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { UserModel } from '../models/user';
import { updateUserPosition } from '../services/userService';


export const createUser = async (req: Request, res: Response): Promise<any> => {
  const { userName, password } = req.body;
  console.log(`username: ${userName} and password: ${password}`);

  try {
    // check user name is already exists or not 
    const existingUser = await UserModel.findOne({
      userName: userName,
    });

    if (existingUser) {
      console.log("user already exists.");
      return res.status(400).json({ message: 'User already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModel({ userName, password: hashedPassword, rooms: [] });
    await newUser.save();

    // Generate JWT token for auto-login
    const tokenData = {
      userId: newUser._id,
      userName: newUser.userName,
    };
    const token = jwt.sign(tokenData, process.env.JWT_SECRET || "secretkey", { expiresIn: '24h' });
    res.cookie('token', token, { expires: new Date(Date.now() + 3600000), httpOnly: true });

    console.log('User created and logged in successfully:', newUser);
    res.status(201).json({ message: 'User created and logged in successfully', token });

  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { userName, password } = req.body; //from user input
    const user = await UserModel.findOne({ userName }); //from DataBase

    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    // compare the password 
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Invalid password');
      return res.status(401).json({ message: 'Invalid password' });
    }

    // generate JWT token
    const tokenData = {
      userId: user._id,
      userName: user.userName,
    };

    // TODO : const tokenExpiry = process.env.JWT_EXPIRATION as string ?? '24h';
    const token = jwt.sign(tokenData, process.env.JWT_SECRET || "secretkey", { expiresIn: '24h' });
    res.cookie('token', token, { expires: new Date(Date.now() + 3600000), httpOnly: true });

    console.log('Login successful:', user);
    return res.status(200).json({ message: 'Login successful', token });

  } catch (error) {

    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Error logging in.' });
  }
}

export async function handleUpdateUserPosition(req: Request, res: Response) {
  try {
    const { userId, organisationId, newPosition } = req.body;

    if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(organisationId)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const userObjectId = new mongoose.Types.ObjectId(String(userId));
    const orgObjectId = new mongoose.Types.ObjectId(String(organisationId));

    await updateUserPosition(userObjectId, orgObjectId, newPosition);

    res.status(200).json({ message: 'User position updated successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}