import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import mongoose from 'mongoose';
import cors from 'cors';
import { Server } from 'socket.io';
import apiRoutes from './routes/api.js';
import Device from './models/Device.js';
import Alert from './models/Alert.js';

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow Frontend
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect("mongodb://localhost:27017/pharmacy_management_db")
    .then(() => console.log('✅ MongoDB Connected — pharmacy_management_db'))
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err.message);
        console.log('\n⚠️  MongoDB is not running! Start it with:');
        console.log('   sudo systemctl start mongod');
        console.log('   OR install MongoDB if not installed\n');
    });

// Socket.io Logic
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Join Room based on Type
    socket.on('join_device', (deviceId) => {
        socket.join(`device_${deviceId}`);
        console.log(`Device ${deviceId} connected`);
    });

    socket.on('join_dashboard', () => {
        socket.join('dashboard_monitoring');
        console.log('Dashboard connected');
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Pass IO to routes
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Routes
app.use('/api', apiRoutes);

// ── Device Health Check (every 60s) ──────────────────────────
// Mark devices as having stale data if no sensor reading in 60s
setInterval(async () => {
    try {
        const staleThreshold = new Date(Date.now() - 60000);
        const staleDevices = await Device.find({
            status: { $in: ['ACTIVE', 'ALERT'] },
            lastSensorData: { $lt: staleThreshold }
        });

        for (const device of staleDevices) {
            // Don't change status, but emit a warning
            io.to('dashboard_monitoring').emit('device_stale', {
                deviceId: device.deviceId,
                zone: device.zone,
                lastSeen: device.lastSensorData,
                message: `No data from ${device.deviceId} (${device.zone}) for over 60s`
            });
        }
    } catch (err) {
        // Silently handle — health check is non-critical
    }
}, 60000);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🏥 PharmaSense server running on port ${PORT}`);
});
