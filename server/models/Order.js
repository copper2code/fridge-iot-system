import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    medicineId: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    orderId: { type: String, unique: true, required: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, default: 0 },
    customerName: String,
    customerPhone: String,
    prescriptionRef: String, // optional prescription reference
    status: { type: String, enum: ['PENDING', 'COMPLETED', 'CANCELLED'], default: 'PENDING' },
    createdBy: String, // staff/admin userId
    createdAt: { type: Date, default: Date.now },
    completedAt: Date,
    notes: String
});

export default mongoose.model('Order', orderSchema);
