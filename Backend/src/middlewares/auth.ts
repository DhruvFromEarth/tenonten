import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"; // password hashing

import { MessageModel } from '../models/message';
import { TaskModel } from '../models/task';
import { UserModel } from '../models/user';
import { RoomModel } from '../models/room';


export function auth(req: any, res: any, next: express.NextFunction) {
    // Try to get token from different sources
    const token = 
        req.cookies?.token || // Check cookies
        req.headers.authorization?.split(" ")[1] || // Check Authorization header
        req.query?.token; // Check query parameters

    if (!token) {
        return res.status(403).json({ message: "No token provided" });
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    jwt.verify(token, jwtSecret, (err: any, decoded: any) => {
        if (err) {
            return res.status(403).json({ message: "Invalid token" });
        }
        console.log("decoded", decoded);

        // Set user data from decoded token
        req.userId = decoded.userId;
        next();
    });
}
