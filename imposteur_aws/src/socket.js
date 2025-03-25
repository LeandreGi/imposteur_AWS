import { io } from 'socket.io-client';

console.log("URL du backend dans socket.js :", process.env.REACT_APP_BACKEND_URL);

const socket = io(process.env.REACT_APP_BACKEND_URL || 'https://imposteur-aws.onrender.com', {
    transports: ['websocket', 'polling'],
    withCredentials: true,
});

export default socket;
