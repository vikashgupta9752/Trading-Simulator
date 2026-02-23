import io from 'socket.io-client';

// Connect to backend
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const socketUrl = apiUrl.replace('/api', '');

const socket = io(socketUrl, {
    transports: ['websocket', 'polling'],
    withCredentials: true,
    autoConnect: true
});

export default socket;
