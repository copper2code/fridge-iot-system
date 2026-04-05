import { createContext, useState, useContext, useEffect } from 'react';
import { io } from 'socket.io-client';

const PharmacyContext = createContext();

export const usePharmacy = () => useContext(PharmacyContext);

const SOCKET_URL = 'http://localhost:5000';
const API_URL = 'http://localhost:5000/api';

export const PharmacyProvider = ({ children }) => {
    const [devices, setDevices] = useState([]);
    const [medicineStats, setMedicineStats] = useState({ total: 0, lowStock: 0, expiringSoon: 0, outOfStock: 0 });
    const [orderStats, setOrderStats] = useState({ pending: 0, completed: 0 });
    const [alertStats, setAlertStats] = useState({ unacknowledged: 0 });
    const [currentUser, setCurrentUser] = useState(null);
    const [socket, setSocket] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [lastCachedData, setLastCachedData] = useState(null);

    // Initialize Data and Socket
    useEffect(() => {
        fetchDashboardData();

        const newSocket = io(SOCKET_URL);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to socket server');
            newSocket.emit('join_dashboard');
        });

        newSocket.on('sensor_update', (data) => {
            setDevices(prev => prev.map(d =>
                d.deviceId === data.deviceId
                    ? { ...d, temperature: data.temperature, humidity: data.humidity, currentAmps: data.currentAmps, status: data.status, lastSensorData: data.timestamp }
                    : d
            ));
        });

        newSocket.on('temperature_alert', (data) => {
            setAlerts(prev => [data, ...prev].slice(0, 50));
            setAlertStats(prev => ({ ...prev, unacknowledged: prev.unacknowledged + 1 }));
        });

        newSocket.on('power_alert', (data) => {
            setAlerts(prev => [data, ...prev].slice(0, 50));
            setAlertStats(prev => ({ ...prev, unacknowledged: prev.unacknowledged + 1 }));
        });

        newSocket.on('device_stale', (data) => {
            console.warn(`⚠️ Device stale: ${data.deviceId} — ${data.message}`);
        });

        newSocket.on('device_activated', () => {
            fetchDashboardData();
        });

        newSocket.on('device_deactivated', () => {
            fetchDashboardData();
        });

        newSocket.on('refresh_data', () => {
            fetchDashboardData();
        });

        return () => newSocket.disconnect();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const res = await fetch(`${API_URL}/dashboard-data`);
            const data = await res.json();

            setDevices(data.devices || []);
            setMedicineStats(data.medicineStats || { total: 0, lowStock: 0, expiringSoon: 0, outOfStock: 0 });
            setOrderStats(data.orderStats || { pending: 0, completed: 0 });
            setAlertStats(data.alertStats || { unacknowledged: 0 });

            // Cache last known data for graceful degradation
            setLastCachedData({ devices: data.devices, timestamp: Date.now() });
        } catch (err) {
            console.error("Failed to fetch dashboard data", err);
            // Use cached data if available
            if (lastCachedData) {
                console.log("Using cached data from", new Date(lastCachedData.timestamp).toLocaleTimeString());
            }
        }
    };

    const login = async (id, password) => {
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: id, password })
            });
            const data = await res.json();
            if (data.success) {
                setCurrentUser(data.user);
                return true;
            }
            return false;
        } catch (err) {
            return false;
        }
    };

    const logout = () => setCurrentUser(null);

    // ---- DEVICE ACTIVATE / DEACTIVATE ----

    const activateDevice = async (deviceId, zone, thresholds = {}) => {
        try {
            const res = await fetch(`${API_URL}/device/activate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deviceId, zone, ...thresholds })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            fetchDashboardData();
            return data;
        } catch (err) {
            console.error('Activate failed:', err);
            throw err;
        }
    };

    const deactivateDevice = async (deviceId) => {
        try {
            const res = await fetch(`${API_URL}/device/deactivate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deviceId })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            fetchDashboardData();
            return data;
        } catch (err) {
            console.error('Deactivate failed:', err);
            throw err;
        }
    };

    const acknowledgeAlert = async (alertId) => {
        try {
            const res = await fetch(`${API_URL}/alerts/${alertId}/acknowledge`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser?.id || 'ADMIN' })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setAlerts(prev => prev.filter(a => a.alertId !== alertId));
            setAlertStats(prev => ({ ...prev, unacknowledged: Math.max(0, prev.unacknowledged - 1) }));
            return data;
        } catch (err) {
            console.error('Acknowledge failed:', err);
            throw err;
        }
    };

    const value = {
        devices,
        medicineStats,
        orderStats,
        alertStats,
        alerts,
        currentUser,
        login,
        logout,
        activateDevice,
        deactivateDevice,
        acknowledgeAlert,
        fetchDashboardData
    };

    return (
        <PharmacyContext.Provider value={value}>
            {children}
        </PharmacyContext.Provider>
    );
};
