import { useState, useEffect } from 'react';
import { usePharmacy } from '../../context/PharmacyContext';
import { Thermometer, Zap, Droplets, AlertTriangle, Activity } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';

const API_URL = 'http://localhost:5000/api';

function LiveMonitoring() {
    const { devices } = usePharmacy();
    const [selectedDeviceId, setSelectedDeviceId] = useState(null);
    const [detailedDevice, setDetailedDevice] = useState(null);

    const activeDevices = devices.filter(d => d.status !== 'INACTIVE');

    // When a device is selected or devices update, find the detailed data
    useEffect(() => {
        if (selectedDeviceId) {
            const dev = devices.find(d => d.deviceId === selectedDeviceId);
            setDetailedDevice(dev || null);
        } else if (activeDevices.length > 0 && !selectedDeviceId) {
            setSelectedDeviceId(activeDevices[0].deviceId);
        }
    }, [selectedDeviceId, devices]);

    const formatTime = (ts) => {
        if (!ts) return '';
        const d = new Date(ts);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const tempChartData = detailedDevice?.temperatureHistory?.map(r => ({
        time: formatTime(r.timestamp),
        temperature: r.value,
        min: detailedDevice.tempThresholdMin,
        max: detailedDevice.tempThresholdMax
    })) || [];

    const currentChartData = detailedDevice?.currentHistory?.map(r => ({
        time: formatTime(r.timestamp),
        current: r.value,
        maxThreshold: detailedDevice.currentThresholdMax
    })) || [];

    // Overview bar data for all devices
    const overviewData = activeDevices.map(d => ({
        device: d.deviceId.replace('SENSOR_', 'S'),
        zone: d.zone,
        temperature: d.temperature || 0,
        current: d.currentAmps || 0,
        isAlert: d.status === 'ALERT'
    }));

    return (
        <div className="h-full overflow-auto p-6 bg-slate-100">
            <header className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Activity className="text-emerald-500" /> Live Monitoring
                </h2>
                <p className="text-slate-500 mt-1">Real-time temperature and power consumption tracking</p>
            </header>

            {/* Zone Cards Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {activeDevices.map(d => (
                    <div
                        key={d.deviceId}
                        onClick={() => setSelectedDeviceId(d.deviceId)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                            selectedDeviceId === d.deviceId
                                ? 'border-emerald-500 bg-emerald-50 shadow-md'
                                : d.status === 'ALERT'
                                    ? 'border-red-300 bg-red-50 animate-pulse'
                                    : 'border-slate-200 bg-white hover:border-emerald-300'
                        }`}
                    >
                        <div className="text-xs font-bold text-slate-400 uppercase mb-1">{d.zone}</div>
                        <div className="font-mono text-xs text-slate-500 mb-2">{d.deviceId}</div>
                        <div className="flex items-center gap-3">
                            <span className={`flex items-center gap-1 text-sm font-bold ${
                                d.temperature !== null && (d.temperature < d.tempThresholdMin || d.temperature > d.tempThresholdMax)
                                    ? 'text-red-500' : 'text-emerald-600'
                            }`}>
                                <Thermometer size={14} />
                                {d.temperature !== null ? `${d.temperature}°C` : '—'}
                            </span>
                            <span className="flex items-center gap-1 text-sm font-bold text-amber-600">
                                <Zap size={14} />
                                {d.currentAmps !== null ? `${d.currentAmps}A` : '—'}
                            </span>
                        </div>
                        {d.status === 'ALERT' && (
                            <div className="flex items-center gap-1 text-red-500 text-xs font-bold mt-2">
                                <AlertTriangle size={12} /> Threshold Breach
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {activeDevices.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                    <Activity size={64} className="mx-auto mb-4 opacity-20" />
                    <p className="text-lg font-medium">No active sensor devices</p>
                    <p className="text-sm">Activate a device from the Manage Devices panel</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Temperature Chart */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-700 mb-1 flex items-center gap-2">
                            <Thermometer size={18} className="text-emerald-500" />
                            Temperature History
                        </h3>
                        <p className="text-xs text-slate-400 mb-4">
                            {detailedDevice?.zone || 'Select a device'} — {detailedDevice?.deviceId || ''}
                        </p>
                        {tempChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={tempChartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                                    <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" domain={['auto', 'auto']} unit="°C" />
                                    <Tooltip
                                        contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                                        labelStyle={{ fontWeight: 'bold' }}
                                    />
                                    <ReferenceLine y={detailedDevice?.tempThresholdMax} stroke="#ef4444" strokeDasharray="5 5" label={{ value: `Max ${detailedDevice?.tempThresholdMax}°C`, fill: '#ef4444', fontSize: 10 }} />
                                    <ReferenceLine y={detailedDevice?.tempThresholdMin} stroke="#3b82f6" strokeDasharray="5 5" label={{ value: `Min ${detailedDevice?.tempThresholdMin}°C`, fill: '#3b82f6', fontSize: 10 }} />
                                    <Line type="monotone" dataKey="temperature" stroke="#059669" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[250px] flex items-center justify-center text-slate-400 text-sm">
                                No temperature data available
                            </div>
                        )}
                    </div>

                    {/* Current/Power Chart */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-700 mb-1 flex items-center gap-2">
                            <Zap size={18} className="text-amber-500" />
                            Power Consumption
                        </h3>
                        <p className="text-xs text-slate-400 mb-4">
                            {detailedDevice?.zone || 'Select a device'} — {detailedDevice?.deviceId || ''}
                        </p>
                        {currentChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={currentChartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                                    <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" unit="A" />
                                    <Tooltip
                                        contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                                        labelStyle={{ fontWeight: 'bold' }}
                                    />
                                    <ReferenceLine y={detailedDevice?.currentThresholdMax} stroke="#ef4444" strokeDasharray="5 5" label={{ value: `Max ${detailedDevice?.currentThresholdMax}A`, fill: '#ef4444', fontSize: 10 }} />
                                    <Bar dataKey="current" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[250px] flex items-center justify-center text-slate-400 text-sm">
                                No power data available
                            </div>
                        )}
                    </div>

                    {/* All Devices Overview */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 md:col-span-2">
                        <h3 className="font-bold text-slate-700 mb-1 flex items-center gap-2">
                            <Activity size={18} className="text-blue-500" />
                            All Devices — Current Readings
                        </h3>
                        <p className="text-xs text-slate-400 mb-4">Temperature and power comparison across all active zones</p>
                        {overviewData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={overviewData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="zone" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                                    <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                                    <Tooltip
                                        contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                                        labelStyle={{ fontWeight: 'bold' }}
                                    />
                                    <Legend />
                                    <Bar dataKey="temperature" fill="#059669" name="Temp (°C)" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="current" fill="#f59e0b" name="Current (A)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">
                                No device data
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default LiveMonitoring;
