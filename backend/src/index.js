const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const passport = require('./config/passport');



const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Pass io to matching engine
// Pass io to matching engine
const matchingEngine = require('./engine/MatchingEngine');
matchingEngine.setIo(io);
matchingEngine.loadOpenOrders();

// Start Simulation
const simulationService = require('./engine/SimulationService');
simulationService.start();

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

app.use(cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.get('/', (req, res) => {
    res.send('Stock Trading Engine API is running...');
});

app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/wallet', require('./routes/walletRoutes'));
app.use('/api/market', require('./routes/marketRoutes'));

const PORT = process.env.PORT || 5001;
console.log('Starting server on port:', PORT);
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
