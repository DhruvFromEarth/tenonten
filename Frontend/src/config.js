export const WS_PORT = import.meta.env.VITE_WS_PORT || 8083;
export const WS_URL  = `ws://localhost:${WS_PORT}`;
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8083';