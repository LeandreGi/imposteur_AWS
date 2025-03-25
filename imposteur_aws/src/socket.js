import { io } from 'socket.io-client';

const socket = io('https://imposteur-aws.onrender.com', {
    transports: ['websocket'],
    withCredentials: true,
});

export default socket;
