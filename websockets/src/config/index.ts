import dotenv from 'dotenv';
dotenv.config();

// parseInt will give you a number, or fall back to 8080 if WS_PORT is missing/invalid
export const PORT = parseInt(process.env.WS_PORT || '8080', 10);