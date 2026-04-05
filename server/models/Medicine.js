import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
    medicineId: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    genericName: String,
    category: { type: String, default: 'General' }, // Antibiotic, Analgesic, Vaccine, etc.
    manufacturer: String,
    batchNumber: String,
    expiryDate: { type: Date, required: true },
    quantity: { type: Number, required: true, default: 0 },
    unitPrice: { type: Number, default: 0 },
    storageRequirement: { type: String, default: 'Room Temperature' }, // Cold Storage, Room Temperature, etc.
    reorderLevel: { type: Number, default: 10 },
    location: String, // shelf/zone e.g. "Shelf A3", "Cold Storage 1"
    description: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Virtual status field
medicineSchema.virtual('status').get(function () {
    if (new Date() > this.expiryDate) return 'Expired';
    if (this.quantity === 0) return 'Out of Stock';
    if (this.quantity <= this.reorderLevel) return 'Low Stock';
    return 'In Stock';
});

medicineSchema.set('toJSON', { virtuals: true });
medicineSchema.set('toObject', { virtuals: true });

medicineSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

export default mongoose.model('Medicine', medicineSchema);
