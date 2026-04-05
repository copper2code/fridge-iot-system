import express from 'express';
import Medicine from '../models/Medicine.js';
import Device from '../models/Device.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Alert from '../models/Alert.js';

const router = express.Router();

// ========================================
// SEED DATA — supports both GET and POST
// ========================================
const seedHandler = async (req, res) => {
    try {
        await Medicine.deleteMany({});
        await Device.deleteMany({});
        await Order.deleteMany({});
        await User.deleteMany({});
        await Alert.deleteMany({});

        // Create Medicines
        await Medicine.create([
            {
                medicineId: 'MED001', name: 'Amoxicillin 500mg', genericName: 'Amoxicillin',
                category: 'Antibiotic', manufacturer: 'Cipla Ltd', batchNumber: 'BN-20260101',
                expiryDate: new Date('2027-06-15'), quantity: 250, unitPrice: 12.50,
                storageRequirement: 'Room Temperature', reorderLevel: 30, location: 'Shelf A1',
                description: 'Broad-spectrum antibiotic capsules'
            },
            {
                medicineId: 'MED002', name: 'Insulin Glargine', genericName: 'Insulin',
                category: 'Hormone', manufacturer: 'Sanofi India', batchNumber: 'BN-20260205',
                expiryDate: new Date('2026-12-01'), quantity: 45, unitPrice: 850.00,
                storageRequirement: 'Cold Storage (2-8°C)', reorderLevel: 15, location: 'Cold Storage A',
                description: 'Long-acting insulin injection'
            },
            {
                medicineId: 'MED003', name: 'Paracetamol 650mg', genericName: 'Acetaminophen',
                category: 'Analgesic', manufacturer: 'Sun Pharma', batchNumber: 'BN-20260310',
                expiryDate: new Date('2028-03-20'), quantity: 500, unitPrice: 5.00,
                storageRequirement: 'Room Temperature', reorderLevel: 50, location: 'Shelf B2',
                description: 'Fever and pain relief tablets'
            },
            {
                medicineId: 'MED004', name: 'COVID-19 Vaccine (Covishield)', genericName: 'ChAdOx1-S',
                category: 'Vaccine', manufacturer: 'Serum Institute', batchNumber: 'BN-20260415',
                expiryDate: new Date('2026-08-30'), quantity: 8, unitPrice: 225.00,
                storageRequirement: 'Cold Storage (2-8°C)', reorderLevel: 10, location: 'Cold Storage B',
                description: 'COVID-19 vaccine for immunization'
            },
            {
                medicineId: 'MED005', name: 'Metformin 500mg', genericName: 'Metformin',
                category: 'Antidiabetic', manufacturer: 'Dr. Reddy\'s', batchNumber: 'BN-20260520',
                expiryDate: new Date('2027-11-10'), quantity: 180, unitPrice: 8.00,
                storageRequirement: 'Room Temperature', reorderLevel: 25, location: 'Shelf A3',
                description: 'Oral antidiabetic medication'
            },
            {
                medicineId: 'MED006', name: 'Azithromycin 250mg', genericName: 'Azithromycin',
                category: 'Antibiotic', manufacturer: 'Zydus Cadila', batchNumber: 'BN-20260601',
                expiryDate: new Date('2026-05-01'), quantity: 5, unitPrice: 65.00,
                storageRequirement: 'Room Temperature', reorderLevel: 10, location: 'Shelf C1',
                description: 'Macrolide antibiotic tablets — EXPIRING SOON'
            },
            {
                medicineId: 'MED007', name: 'Atorvastatin 20mg', genericName: 'Atorvastatin',
                category: 'Cardiovascular', manufacturer: 'Lupin Ltd', batchNumber: 'BN-20260715',
                expiryDate: new Date('2028-01-15'), quantity: 120, unitPrice: 15.00,
                storageRequirement: 'Room Temperature', reorderLevel: 20, location: 'Shelf B1',
                description: 'Cholesterol-lowering statin'
            },
            {
                medicineId: 'MED008', name: 'Cetirizine 10mg', genericName: 'Cetirizine',
                category: 'Antihistamine', manufacturer: 'Cipla Ltd', batchNumber: 'BN-20260801',
                expiryDate: new Date('2027-09-01'), quantity: 300, unitPrice: 3.50,
                storageRequirement: 'Room Temperature', reorderLevel: 40, location: 'Shelf A2',
                description: 'Allergy relief tablets'
            }
        ]);

        // Create Devices (Fridge/Equipment Monitors)
        await Device.create([
            {
                deviceId: 'FRIDGE_001', status: 'ACTIVE', zone: 'Cold Storage A',
                temperature: 4.2, humidity: 62, currentAmps: 3.5,
                tempThresholdMin: 2, tempThresholdMax: 8, currentThresholdMax: 10,
                lastSensorData: new Date(), activatedAt: new Date(),
                temperatureHistory: [
                    { value: 4.5, timestamp: new Date(Date.now() - 300000) },
                    { value: 4.3, timestamp: new Date(Date.now() - 240000) },
                    { value: 4.2, timestamp: new Date(Date.now() - 180000) },
                    { value: 4.1, timestamp: new Date(Date.now() - 120000) },
                    { value: 4.2, timestamp: new Date(Date.now() - 60000) }
                ],
                currentHistory: [
                    { value: 3.4, timestamp: new Date(Date.now() - 300000) },
                    { value: 3.5, timestamp: new Date(Date.now() - 240000) },
                    { value: 3.6, timestamp: new Date(Date.now() - 180000) },
                    { value: 3.5, timestamp: new Date(Date.now() - 120000) },
                    { value: 3.5, timestamp: new Date(Date.now() - 60000) }
                ]
            },
            {
                deviceId: 'FRIDGE_002', status: 'ACTIVE', zone: 'Cold Storage B',
                temperature: 5.8, humidity: 58, currentAmps: 4.1,
                tempThresholdMin: 2, tempThresholdMax: 8, currentThresholdMax: 10,
                lastSensorData: new Date(), activatedAt: new Date(),
                temperatureHistory: [
                    { value: 5.5, timestamp: new Date(Date.now() - 300000) },
                    { value: 5.6, timestamp: new Date(Date.now() - 240000) },
                    { value: 5.7, timestamp: new Date(Date.now() - 180000) },
                    { value: 5.9, timestamp: new Date(Date.now() - 120000) },
                    { value: 5.8, timestamp: new Date(Date.now() - 60000) }
                ],
                currentHistory: [
                    { value: 4.0, timestamp: new Date(Date.now() - 300000) },
                    { value: 4.1, timestamp: new Date(Date.now() - 240000) },
                    { value: 4.2, timestamp: new Date(Date.now() - 180000) },
                    { value: 4.1, timestamp: new Date(Date.now() - 120000) },
                    { value: 4.1, timestamp: new Date(Date.now() - 60000) }
                ]
            },
            {
                deviceId: 'FRIDGE_003', status: 'ACTIVE', zone: 'Main Floor',
                temperature: 24.5, humidity: 45, currentAmps: 1.2,
                tempThresholdMin: 15, tempThresholdMax: 30, currentThresholdMax: 5,
                lastSensorData: new Date(), activatedAt: new Date(),
                temperatureHistory: [
                    { value: 24.2, timestamp: new Date(Date.now() - 300000) },
                    { value: 24.3, timestamp: new Date(Date.now() - 240000) },
                    { value: 24.5, timestamp: new Date(Date.now() - 180000) },
                    { value: 24.4, timestamp: new Date(Date.now() - 120000) },
                    { value: 24.5, timestamp: new Date(Date.now() - 60000) }
                ],
                currentHistory: [
                    { value: 1.1, timestamp: new Date(Date.now() - 300000) },
                    { value: 1.2, timestamp: new Date(Date.now() - 240000) },
                    { value: 1.2, timestamp: new Date(Date.now() - 180000) },
                    { value: 1.3, timestamp: new Date(Date.now() - 120000) },
                    { value: 1.2, timestamp: new Date(Date.now() - 60000) }
                ]
            },
            {
                deviceId: 'FRIDGE_004', status: 'INACTIVE', zone: 'Unassigned',
                tempThresholdMin: 2, tempThresholdMax: 8, currentThresholdMax: 10
            }
        ]);

        // Create sample orders
        await Order.create([
            {
                orderId: 'ORD-100001',
                items: [
                    { medicineId: 'MED001', name: 'Amoxicillin 500mg', quantity: 10, unitPrice: 12.50 },
                    { medicineId: 'MED003', name: 'Paracetamol 650mg', quantity: 20, unitPrice: 5.00 }
                ],
                totalAmount: 225.00, customerName: 'Rahul Sharma', customerPhone: '9876543210',
                status: 'COMPLETED', createdBy: 'ADMIN', completedAt: new Date('2026-03-15'),
                createdAt: new Date('2026-03-15'), notes: 'Regular prescription refill'
            },
            {
                orderId: 'ORD-100002',
                items: [
                    { medicineId: 'MED002', name: 'Insulin Glargine', quantity: 2, unitPrice: 850.00 }
                ],
                totalAmount: 1700.00, customerName: 'Priya Desai', customerPhone: '9988776655',
                prescriptionRef: 'RX-2026-00451',
                status: 'COMPLETED', createdBy: 'ADMIN', completedAt: new Date('2026-03-20'),
                createdAt: new Date('2026-03-20'), notes: 'Insulin for diabetic patient'
            },
            {
                orderId: 'ORD-100003',
                items: [
                    { medicineId: 'MED005', name: 'Metformin 500mg', quantity: 30, unitPrice: 8.00 },
                    { medicineId: 'MED007', name: 'Atorvastatin 20mg', quantity: 15, unitPrice: 15.00 }
                ],
                totalAmount: 465.00, customerName: 'Amit Patil', customerPhone: '9123456780',
                prescriptionRef: 'RX-2026-00523',
                status: 'PENDING', createdBy: 'ADMIN',
                createdAt: new Date('2026-04-02'), notes: 'Monthly medication'
            },
            {
                orderId: 'ORD-100004',
                items: [
                    { medicineId: 'MED008', name: 'Cetirizine 10mg', quantity: 10, unitPrice: 3.50 },
                    { medicineId: 'MED003', name: 'Paracetamol 650mg', quantity: 10, unitPrice: 5.00 }
                ],
                totalAmount: 85.00, customerName: 'Sneha Joshi', customerPhone: '9871234560',
                status: 'PENDING', createdBy: 'ADMIN',
                createdAt: new Date('2026-04-04'), notes: 'Cold and flu medication'
            }
        ]);

        // Create Admin User
        await User.create({
            userId: 'ADMIN', password: '123', name: 'Dr. Arjun Mehta',
            phone: '9800000001', role: 'ADMIN'
        });

        // Create sample alert
        await Alert.create({
            alertId: 'ALT-SEED-001', deviceId: 'FRIDGE_002', zone: 'Cold Storage B',
            type: 'TEMPERATURE', value: 9.2,
            threshold: 'Temperature exceeded 8°C (max)',
            message: 'Cold Storage B temperature rose above safe threshold',
            acknowledged: true, acknowledgedBy: 'ADMIN',
            acknowledgedAt: new Date('2026-03-30'),
            createdAt: new Date('2026-03-30')
        });

        res.json({
            message: '✅ Pharmacy Database Seeded Successfully',
            stats: { medicines: 8, devices: 4, orders: 4, users: 1, alerts: 1 }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
router.get('/seed', seedHandler);
router.post('/seed', seedHandler);

// ========================================
// MEDICINE INVENTORY CRUD
// ========================================

// GET /api/medicines — List all medicines
router.get('/medicines', async (req, res) => {
    try {
        const filter = {};
        if (req.query.category) filter.category = req.query.category;
        if (req.query.storage) filter.storageRequirement = new RegExp(req.query.storage, 'i');

        const medicines = await Medicine.find(filter).sort({ name: 1 });
        res.json(medicines);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/medicines/expiring — Medicines expiring within N days (default 30)
router.get('/medicines/expiring', async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const cutoff = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
        const medicines = await Medicine.find({ expiryDate: { $lte: cutoff } }).sort({ expiryDate: 1 });
        res.json(medicines);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/medicines/low-stock — Medicines at or below reorder level
router.get('/medicines/low-stock', async (req, res) => {
    try {
        const medicines = await Medicine.find({
            $expr: { $lte: ['$quantity', '$reorderLevel'] }
        }).sort({ quantity: 1 });
        res.json(medicines);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/medicines/stats — Inventory statistics
router.get('/medicines/stats', async (req, res) => {
    try {
        const total = await Medicine.countDocuments();
        const now = new Date();
        const thirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        const expired = await Medicine.countDocuments({ expiryDate: { $lt: now } });
        const expiringSoon = await Medicine.countDocuments({ expiryDate: { $gte: now, $lte: thirtyDays } });
        const lowStock = await Medicine.countDocuments({ $expr: { $lte: ['$quantity', '$reorderLevel'] } });
        const outOfStock = await Medicine.countDocuments({ quantity: 0 });

        const totalValue = await Medicine.aggregate([
            { $group: { _id: null, total: { $sum: { $multiply: ['$quantity', '$unitPrice'] } } } }
        ]);

        const categories = await Medicine.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        res.json({
            total, expired, expiringSoon, lowStock, outOfStock,
            totalInventoryValue: totalValue[0]?.total || 0,
            categories
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/medicines/:medicineId — Lookup single medicine
router.get('/medicines/:medicineId', async (req, res) => {
    try {
        const medicine = await Medicine.findOne({ medicineId: req.params.medicineId });
        if (!medicine) return res.status(404).json({ error: 'Medicine not found' });
        res.json(medicine);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/medicines — Create a new medicine
router.post('/medicines', async (req, res) => {
    try {
        const medicine = await Medicine.create(req.body);
        req.io.to('dashboard_monitoring').emit('refresh_data');
        res.json({ success: true, medicine });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ error: 'Medicine with this ID already exists' });
        }
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/medicines/:medicineId — Update a medicine
router.put('/medicines/:medicineId', async (req, res) => {
    try {
        const medicine = await Medicine.findOneAndUpdate(
            { medicineId: req.params.medicineId },
            { ...req.body, updatedAt: Date.now() },
            { new: true }
        );
        if (!medicine) return res.status(404).json({ error: 'Medicine not found' });
        req.io.to('dashboard_monitoring').emit('refresh_data');
        res.json({ success: true, medicine });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/medicines/:medicineId — Delete a medicine
router.delete('/medicines/:medicineId', async (req, res) => {
    try {
        const medicine = await Medicine.findOneAndDelete({ medicineId: req.params.medicineId });
        if (!medicine) return res.status(404).json({ error: 'Medicine not found' });
        req.io.to('dashboard_monitoring').emit('refresh_data');
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/medicines/search/:query — Search medicines by name
router.get('/medicines/search/:query', async (req, res) => {
    try {
        const medicines = await Medicine.find({
            $or: [
                { name: new RegExp(req.params.query, 'i') },
                { genericName: new RegExp(req.params.query, 'i') },
                { medicineId: new RegExp(req.params.query, 'i') },
                { category: new RegExp(req.params.query, 'i') }
            ]
        }).sort({ name: 1 });
        res.json(medicines);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========================================
// ORDER MANAGEMENT
// ========================================

// GET /api/orders — List all orders
router.get('/orders', async (req, res) => {
    try {
        const filter = {};
        if (req.query.status) filter.status = req.query.status;
        const orders = await Order.find(filter).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/orders/stats — Order statistics
router.get('/orders/stats', async (req, res) => {
    try {
        const total = await Order.countDocuments();
        const pending = await Order.countDocuments({ status: 'PENDING' });
        const completed = await Order.countDocuments({ status: 'COMPLETED' });
        const cancelled = await Order.countDocuments({ status: 'CANCELLED' });

        const totalRevenue = await Order.aggregate([
            { $match: { status: 'COMPLETED' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const pendingRevenue = await Order.aggregate([
            { $match: { status: 'PENDING' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        res.json({
            total, pending, completed, cancelled,
            totalRevenue: totalRevenue[0]?.total || 0,
            pendingRevenue: pendingRevenue[0]?.total || 0
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/orders/:orderId — Single order
router.get('/orders/:orderId', async (req, res) => {
    try {
        const order = await Order.findOne({ orderId: req.params.orderId });
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/orders — Create a new order
router.post('/orders', async (req, res) => {
    try {
        const { items, customerName, customerPhone, prescriptionRef, createdBy, notes } = req.body;

        // Calculate total and validate stock
        let totalAmount = 0;
        for (const item of items) {
            const medicine = await Medicine.findOne({ medicineId: item.medicineId });
            if (!medicine) return res.status(400).json({ error: `Medicine ${item.medicineId} not found` });
            if (medicine.quantity < item.quantity) {
                return res.status(400).json({ error: `Insufficient stock for ${medicine.name}. Available: ${medicine.quantity}` });
            }
            item.name = medicine.name;
            item.unitPrice = medicine.unitPrice;
            totalAmount += item.quantity * item.unitPrice;
        }

        // Deduct stock
        for (const item of items) {
            await Medicine.findOneAndUpdate(
                { medicineId: item.medicineId },
                { $inc: { quantity: -item.quantity }, updatedAt: Date.now() }
            );
        }

        const order = await Order.create({
            orderId: `ORD-${Date.now().toString().slice(-6)}`,
            items, totalAmount, customerName, customerPhone,
            prescriptionRef, createdBy, notes
        });

        req.io.to('dashboard_monitoring').emit('refresh_data');
        res.json({ success: true, order });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/orders/:orderId — Update order status
router.put('/orders/:orderId', async (req, res) => {
    try {
        const update = { ...req.body };
        if (req.body.status === 'COMPLETED') update.completedAt = Date.now();

        // If cancelling, restore stock
        if (req.body.status === 'CANCELLED') {
            const order = await Order.findOne({ orderId: req.params.orderId });
            if (order && order.status !== 'CANCELLED') {
                for (const item of order.items) {
                    await Medicine.findOneAndUpdate(
                        { medicineId: item.medicineId },
                        { $inc: { quantity: item.quantity }, updatedAt: Date.now() }
                    );
                }
            }
        }

        const order = await Order.findOneAndUpdate(
            { orderId: req.params.orderId },
            update,
            { new: true }
        );
        if (!order) return res.status(404).json({ error: 'Order not found' });
        req.io.to('dashboard_monitoring').emit('refresh_data');
        res.json({ success: true, order });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========================================
// DEVICE / SENSOR ENDPOINTS
// ========================================

// GET /api/devices — All devices
router.get('/devices', async (req, res) => {
    try {
        const devices = await Device.find({}).sort({ deviceId: 1 });
        res.json(devices);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/devices/available — Inactive devices available to activate
router.get('/devices/available', async (req, res) => {
    try {
        const devices = await Device.find({ status: 'INACTIVE' });
        res.json(devices);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/device/activate — Activate monitoring on a device
router.post('/device/activate', async (req, res) => {
    const { deviceId, zone, tempThresholdMin, tempThresholdMax, currentThresholdMax } = req.body;
    if (!deviceId) return res.status(400).json({ error: 'Missing deviceId' });

    try {
        const device = await Device.findOne({ deviceId });
        if (!device) return res.status(404).json({ error: 'Device not found' });
        if (device.status === 'ACTIVE') return res.status(400).json({ error: 'Device is already active' });

        device.status = 'ACTIVE';
        device.zone = zone || device.zone;
        device.activatedAt = Date.now();
        device.pendingCommand = 'ACTIVATE';
        if (tempThresholdMin !== undefined) device.tempThresholdMin = tempThresholdMin;
        if (tempThresholdMax !== undefined) device.tempThresholdMax = tempThresholdMax;
        if (currentThresholdMax !== undefined) device.currentThresholdMax = currentThresholdMax;
        await device.save();

        req.io.to(`device_${deviceId}`).emit('command', { action: 'ACTIVATE' });
        req.io.to('dashboard_monitoring').emit('device_activated', { deviceId, zone: device.zone });
        req.io.to('dashboard_monitoring').emit('refresh_data');

        res.json({ success: true, device });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/device/deactivate — Deactivate monitoring
router.post('/device/deactivate', async (req, res) => {
    const { deviceId } = req.body;
    if (!deviceId) return res.status(400).json({ error: 'Missing deviceId' });

    try {
        const device = await Device.findOne({ deviceId });
        if (!device) return res.status(404).json({ error: 'Device not found' });
        if (device.status === 'INACTIVE') return res.status(400).json({ error: 'Device is already inactive' });

        device.status = 'INACTIVE';
        device.deactivatedAt = Date.now();
        device.pendingCommand = 'DEACTIVATE';
        await device.save();

        req.io.to(`device_${deviceId}`).emit('command', { action: 'DEACTIVATE' });
        req.io.to('dashboard_monitoring').emit('device_deactivated', { deviceId });
        req.io.to('dashboard_monitoring').emit('refresh_data');

        res.json({ success: true, device });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/device/command/:deviceId — ESP32 polls for commands
router.get('/device/command/:deviceId', async (req, res) => {
    try {
        const device = await Device.findOne({ deviceId: req.params.deviceId });
        if (!device) return res.status(404).json({ error: 'Device not found' });

        const command = device.pendingCommand || 'NONE';

        // Clear command after delivery (acknowledge pattern)
        if (device.pendingCommand) {
            device.pendingCommand = null;
            await device.save();
        }

        res.json({
            command,
            deviceId: device.deviceId,
            currentStatus: device.status,
            zone: device.zone,
            tempThresholdMin: device.tempThresholdMin,
            tempThresholdMax: device.tempThresholdMax,
            currentThresholdMax: device.currentThresholdMax
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/device/sensor-data — ESP32 sends temperature + current readings
router.post('/device/sensor-data', async (req, res) => {
    const { deviceId, temperature, humidity, currentAmps } = req.body;
    if (!deviceId) return res.status(400).json({ error: 'Missing deviceId' });

    try {
        let device = await Device.findOne({ deviceId });
        if (!device) {
            device = new Device({ deviceId, status: 'ACTIVE' });
        }

        const now = new Date();
        device.lastSensorData = now;
        device.lastUpdated = now;

        if (temperature !== undefined) {
            device.temperature = temperature;
            device.temperatureHistory.push({ value: temperature, timestamp: now });
        }
        if (humidity !== undefined) device.humidity = humidity;
        if (currentAmps !== undefined) {
            device.currentAmps = currentAmps;
            device.currentHistory.push({ value: currentAmps, timestamp: now });
        }

        // Check temperature thresholds
        let tempAlert = false;
        if (temperature !== undefined && device.status === 'ACTIVE') {
            if (temperature < device.tempThresholdMin || temperature > device.tempThresholdMax) {
                tempAlert = true;
                device.status = 'ALERT';

                const alert = await Alert.create({
                    alertId: `ALT-${Date.now().toString().slice(-8)}`,
                    deviceId, zone: device.zone, type: 'TEMPERATURE',
                    value: temperature,
                    threshold: temperature > device.tempThresholdMax
                        ? `Temperature ${temperature}°C exceeded max ${device.tempThresholdMax}°C`
                        : `Temperature ${temperature}°C below min ${device.tempThresholdMin}°C`,
                    message: `Temperature breach in ${device.zone}`
                });

                req.io.to('dashboard_monitoring').emit('temperature_alert', {
                    deviceId, zone: device.zone, temperature, humidity,
                    threshold: alert.threshold, alertId: alert.alertId, timestamp: now
                });
            }
        }

        // Check current threshold
        let powerAlert = false;
        if (currentAmps !== undefined && device.status !== 'INACTIVE') {
            if (currentAmps > device.currentThresholdMax) {
                powerAlert = true;
                if (device.status !== 'ALERT') device.status = 'ALERT';

                const alert = await Alert.create({
                    alertId: `ALT-${Date.now().toString().slice(-8)}-P`,
                    deviceId, zone: device.zone, type: 'POWER',
                    value: currentAmps,
                    threshold: `Current ${currentAmps}A exceeded max ${device.currentThresholdMax}A`,
                    message: `Power anomaly in ${device.zone}`
                });

                req.io.to('dashboard_monitoring').emit('power_alert', {
                    deviceId, zone: device.zone, currentAmps,
                    threshold: alert.threshold, alertId: alert.alertId, timestamp: now
                });
            }
        }

        // Reset from ALERT to ACTIVE if readings are back to normal
        if (device.status === 'ALERT' && !tempAlert && !powerAlert) {
            const hasTemp = temperature !== undefined;
            const hasCurr = currentAmps !== undefined;
            const tempOk = !hasTemp || (temperature >= device.tempThresholdMin && temperature <= device.tempThresholdMax);
            const currOk = !hasCurr || (currentAmps <= device.currentThresholdMax);
            if (tempOk && currOk) {
                device.status = 'ACTIVE';
            }
        }

        await device.save();

        // Push real-time sensor update to dashboard
        req.io.to('dashboard_monitoring').emit('sensor_update', {
            deviceId, temperature, humidity, currentAmps,
            status: device.status, zone: device.zone, timestamp: now
        });

        res.json({ success: true, status: device.status, alerts: { tempAlert, powerAlert } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========================================
// ALERTS
// ========================================

// GET /api/alerts — List alerts
router.get('/alerts', async (req, res) => {
    try {
        const filter = {};
        if (req.query.acknowledged === 'false') filter.acknowledged = false;
        if (req.query.acknowledged === 'true') filter.acknowledged = true;
        if (req.query.type) filter.type = req.query.type;
        if (req.query.deviceId) filter.deviceId = req.query.deviceId;

        const alerts = await Alert.find(filter).sort({ createdAt: -1 }).limit(100);
        res.json(alerts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/alerts/stats — Alert statistics
router.get('/alerts/stats', async (req, res) => {
    try {
        const total = await Alert.countDocuments();
        const unacknowledged = await Alert.countDocuments({ acknowledged: false });
        const temperature = await Alert.countDocuments({ type: 'TEMPERATURE', acknowledged: false });
        const power = await Alert.countDocuments({ type: 'POWER', acknowledged: false });
        res.json({ total, unacknowledged, temperature, power });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/alerts/:alertId/acknowledge — Acknowledge an alert
router.post('/alerts/:alertId/acknowledge', async (req, res) => {
    try {
        const alert = await Alert.findOneAndUpdate(
            { alertId: req.params.alertId },
            { acknowledged: true, acknowledgedBy: req.body.userId || 'ADMIN', acknowledgedAt: Date.now() },
            { new: true }
        );
        if (!alert) return res.status(404).json({ error: 'Alert not found' });

        // If device was in ALERT and all alerts are now acknowledged, reset to ACTIVE
        const remaining = await Alert.countDocuments({ deviceId: alert.deviceId, acknowledged: false });
        if (remaining === 0) {
            const device = await Device.findOne({ deviceId: alert.deviceId });
            if (device && device.status === 'ALERT') {
                device.status = 'ACTIVE';
                await device.save();
            }
        }

        req.io.to('dashboard_monitoring').emit('refresh_data');
        res.json({ success: true, alert });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========================================
// AUTH
// ========================================

router.post('/auth/login', async (req, res) => {
    const { userId, password } = req.body;
    const user = await User.findOne({ userId, password });
    if (user) {
        res.json({ success: true, user: { name: user.name, id: user.userId, role: user.role } });
    } else {
        res.status(401).json({ error: 'Invalid Credentials' });
    }
});

// ========================================
// DASHBOARD DATA (Aggregated View)
// ========================================

router.get('/dashboard-data', async (req, res) => {
    try {
        const devices = await Device.find({});
        const medicineStats = {
            total: await Medicine.countDocuments(),
            lowStock: await Medicine.countDocuments({ $expr: { $lte: ['$quantity', '$reorderLevel'] } }),
            expiringSoon: await Medicine.countDocuments({
                expiryDate: { $gte: new Date(), $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
            }),
            outOfStock: await Medicine.countDocuments({ quantity: 0 })
        };
        const orderStats = {
            pending: await Order.countDocuments({ status: 'PENDING' }),
            completed: await Order.countDocuments({ status: 'COMPLETED' })
        };
        const alertStats = {
            unacknowledged: await Alert.countDocuments({ acknowledged: false })
        };

        res.json({ devices, medicineStats, orderStats, alertStats });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
