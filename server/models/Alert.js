import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
    alertId: { type: String, unique: true, required: true },
    deviceId: { type: String, required: true },
    zone: String,
    type: { type: String, enum: ['TEMPERATURE', 'POWER', 'DEVICE_OFFLINE'], required: true },
    value: Number, // the reading that triggered the alert
    threshold: String, // human-readable description, e.g. "Temperature exceeded 8°C (max)"
    message: String,
    acknowledged: { type: Boolean, default: false },
    acknowledgedBy: String,
    acknowledgedAt: Date,
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Alert', alertSchema);
