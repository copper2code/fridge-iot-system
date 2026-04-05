import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    userId: { type: String, unique: true, required: true },
    password: { type: String, required: true }, // In production, hash this!
    name: String,
    phone: String,
    role: { type: String, enum: ['ADMIN', 'STAFF'], default: 'STAFF' }
});

export default mongoose.model('User', userSchema);
