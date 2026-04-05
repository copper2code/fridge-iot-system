import mongoose from 'mongoose';

const sensorReadingSchema = new mongoose.Schema({
    value: Number,
    timestamp: { type: Date, default: Date.now }
}, { _id: false });

const deviceSchema = new mongoose.Schema({
    deviceId: { type: String, unique: true, required: true },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'ALERT'], default: 'INACTIVE' },
    zone: { type: String, default: 'Unassigned' }, // e.g. "Cold Storage A", "Fridge B", "Shelf C"
    temperature: { type: Number, default: null },
    humidity: { type: Number, default: null },
    currentAmps: { type: Number, default: null },
    tempThresholdMin: { type: Number, default: 2 },   // °C — for cold storage compliance
    tempThresholdMax: { type: Number, default: 8 },   // °C
    currentThresholdMax: { type: Number, default: 10 }, // Amps
    temperatureHistory: { type: [sensorReadingSchema], default: [] },
    currentHistory: { type: [sensorReadingSchema], default: [] },
    lastSensorData: Date,
    lastUpdated: Date,
    activatedAt: Date,
    deactivatedAt: Date,
    pendingCommand: { type: String, enum: ['ACTIVATE', 'DEACTIVATE', null], default: null }
});

// Cap history arrays to last 100 entries on save
deviceSchema.pre('save', function (next) {
    if (this.temperatureHistory.length > 100) {
        this.temperatureHistory = this.temperatureHistory.slice(-100);
    }
    if (this.currentHistory.length > 100) {
        this.currentHistory = this.currentHistory.slice(-100);
    }
    next();
});

export default mongoose.model('Device', deviceSchema);
