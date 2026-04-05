import { useState } from 'react';
import { usePharmacy } from '../../context/PharmacyContext';
import { Search, Thermometer, Zap, AlertTriangle, Package, ShoppingCart, Activity, Power, Droplets } from 'lucide-react';

function DashboardHome() {
    const { devices, medicineStats, orderStats, alertStats, deactivateDevice } = usePharmacy();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [deactivating, setDeactivating] = useState(false);

    const filteredDevices = devices.filter(d =>
        d.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.zone || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activeCount = devices.filter(d => d.status === 'ACTIVE').length;
    const alertCount = devices.filter(d => d.status === 'ALERT').length;
    const inactiveCount = devices.filter(d => d.status === 'INACTIVE').length;
    const alertDevices = devices.filter(d => d.status === 'ALERT');

    const handleDeactivate = async (deviceId) => {
        setDeactivating(true);
        try {
            await deactivateDevice(deviceId);
            setSelectedDevice(null);
        } catch (err) {
            alert('Failed to deactivate: ' + err.message);
        }
        setDeactivating(false);
    };

    const getStatusBadge = (device) => {
        if (device.status === 'ALERT') {
            return <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 animate-pulse"><AlertTriangle size={12} /> ALERT</span>;
        }
        if (device.status === 'ACTIVE') {
            return <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><Activity size={12} /> ACTIVE</span>;
        }
        return <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><Power size={12} /> INACTIVE</span>;
    };

    const getTempColor = (device) => {
        if (device.temperature === null || device.temperature === undefined) return 'text-slate-400';
        if (device.temperature < device.tempThresholdMin || device.temperature > device.tempThresholdMax) return 'text-red-500';
        return 'text-emerald-500';
    };

    return (
        <div className="h-full flex flex-col md:flex-row">
            {/* List Panel */}
            <div className="flex-1 bg-white p-6 border-r border-slate-200 flex flex-col max-w-2xl">
                <header className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">Fridge & Equipment Overview</h2>

                    {/* Stats Bar */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                        <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                            <div className="text-emerald-500 text-xs font-bold uppercase">Active</div>
                            <div className="text-xl font-bold text-emerald-600">{activeCount}</div>
                        </div>
                        <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                            <div className="text-red-500 text-xs font-bold uppercase">Alerts</div>
                            <div className="text-xl font-bold text-red-600">{alertCount}</div>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <div className="text-blue-500 text-xs font-bold uppercase">Medicines</div>
                            <div className="text-xl font-bold text-blue-600">{medicineStats.total}</div>
                        </div>
                        <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                            <div className="text-amber-500 text-xs font-bold uppercase">Low Stock</div>
                            <div className="text-xl font-bold text-amber-600">{medicineStats.lowStock}</div>
                        </div>
                    </div>

                    {/* Quick Info Row */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="bg-orange-50 p-2 rounded-lg border border-orange-100 text-center">
                            <div className="text-orange-500 text-[10px] font-bold uppercase">Expiring Soon</div>
                            <div className="text-lg font-bold text-orange-600">{medicineStats.expiringSoon}</div>
                        </div>
                        <div className="bg-purple-50 p-2 rounded-lg border border-purple-100 text-center">
                            <div className="text-purple-500 text-[10px] font-bold uppercase">Pending Orders</div>
                            <div className="text-lg font-bold text-purple-600">{orderStats.pending}</div>
                        </div>
                        <div className="bg-rose-50 p-2 rounded-lg border border-rose-100 text-center">
                            <div className="text-rose-500 text-[10px] font-bold uppercase">Unread Alerts</div>
                            <div className="text-lg font-bold text-rose-600">{alertStats.unacknowledged}</div>
                        </div>
                    </div>

                    {/* Alert Banners */}
                    {alertDevices.length > 0 && (
                        <div className="mb-4 space-y-2">
                            {alertDevices.map(d => (
                                <div key={d.deviceId} className="bg-red-600 text-white p-3 rounded-lg shadow-lg border-2 border-red-400 animate-pulse">
                                    <div className="flex items-center gap-2 font-bold text-sm mb-1">
                                        <AlertTriangle size={16} /> 🚨 THRESHOLD BREACH — {d.zone || d.deviceId}
                                    </div>
                                    <div className="text-xs text-red-100">
                                        {d.temperature !== null && `Temp: ${d.temperature}°C`}
                                        {d.currentAmps !== null && ` · Current: ${d.currentAmps}A`}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search Fridge ID or Zone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:border-emerald-500 outline-none"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                    </div>
                </header>

                <div className="flex-1 overflow-auto space-y-3 pr-2">
                    {filteredDevices.map(device => (
                        <div
                            key={device.deviceId}
                            onClick={() => setSelectedDevice(device)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedDevice?.deviceId === device.deviceId
                                ? 'border-emerald-500 bg-emerald-50 shadow-md transform scale-[1.02]'
                                : device.status === 'ALERT'
                                    ? 'border-red-300 bg-red-50/30 hover:bg-red-50'
                                    : 'border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <div>
                                    <div className="font-bold text-slate-800 font-mono">{device.deviceId}</div>
                                    <div className="text-xs text-slate-500">
                                        📍 {device.zone || 'Unassigned'}
                                    </div>
                                </div>
                                {getStatusBadge(device)}
                            </div>
                            {device.status !== 'INACTIVE' && (
                                <div className="flex gap-4 mt-2 text-xs">
                                    <span className={`flex items-center gap-1 ${getTempColor(device)}`}>
                                        <Thermometer size={12} />
                                        {device.temperature !== null && device.temperature !== undefined ? `${device.temperature}°C` : '—'}
                                    </span>
                                    <span className="flex items-center gap-1 text-blue-500">
                                        <Droplets size={12} />
                                        {device.humidity !== null && device.humidity !== undefined ? `${device.humidity}%` : '—'}
                                    </span>
                                    <span className="flex items-center gap-1 text-amber-500">
                                        <Zap size={12} />
                                        {device.currentAmps !== null && device.currentAmps !== undefined ? `${device.currentAmps}A` : '—'}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Detail Panel */}
            {selectedDevice ? (
                <div className="w-full md:w-96 bg-slate-50 p-6 shadow-[-4px_0_15px_rgba(0,0,0,0.05)] overflow-auto">
                    <div className="sticky top-0 bg-slate-50 pb-4 border-b border-slate-200 mb-6 z-10">
                        <h2 className="text-xl font-bold text-slate-800">Fridge Details</h2>
                        <div className="text-sm text-slate-500">{selectedDevice.deviceId}</div>
                    </div>

                    <div className="space-y-6">
                        {/* Alert Banner */}
                        {selectedDevice.status === 'ALERT' && (
                            <div className="bg-red-600 text-white p-4 rounded-lg shadow-lg animate-pulse">
                                <div className="flex items-center gap-2 font-bold mb-1">
                                    <AlertTriangle /> THRESHOLD BREACH
                                </div>
                                <p className="text-xs text-red-100">Fridge readings outside safe range. Check temperature and power levels.</p>
                            </div>
                        )}

                        {/* Zone Info */}
                        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Zone & Configuration</h3>
                            <div className="space-y-2">
                                <div className="text-sm">
                                    <span className="text-slate-500 block text-xs">Zone</span>
                                    <span className="font-bold text-slate-800">{selectedDevice.zone || 'Unassigned'}</span>
                                </div>
                                <div className="text-sm">
                                    <span className="text-slate-500 block text-xs">Temp Range</span>
                                    <span className="font-medium text-slate-800">{selectedDevice.tempThresholdMin}°C — {selectedDevice.tempThresholdMax}°C</span>
                                </div>
                                <div className="text-sm">
                                    <span className="text-slate-500 block text-xs">Max Current</span>
                                    <span className="font-medium text-slate-800">{selectedDevice.currentThresholdMax}A</span>
                                </div>
                            </div>
                        </div>

                        {/* Live Readings */}
                        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Live Readings</h3>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="text-center p-2 bg-slate-50 rounded">
                                    <Thermometer className={`mx-auto mb-1 ${getTempColor(selectedDevice)}`} size={20} />
                                    <div className="text-sm font-bold">
                                        {selectedDevice.temperature !== null && selectedDevice.temperature !== undefined ? `${selectedDevice.temperature}°C` : 'N/A'}
                                    </div>
                                    <div className="text-[10px] text-slate-400">Temperature</div>
                                </div>
                                <div className="text-center p-2 bg-slate-50 rounded">
                                    <Droplets className="mx-auto mb-1 text-blue-500" size={20} />
                                    <div className="text-sm font-bold">
                                        {selectedDevice.humidity !== null && selectedDevice.humidity !== undefined ? `${selectedDevice.humidity}%` : 'N/A'}
                                    </div>
                                    <div className="text-[10px] text-slate-400">Humidity</div>
                                </div>
                                <div className="text-center p-2 bg-slate-50 rounded">
                                    <Zap className={`mx-auto mb-1 ${selectedDevice.currentAmps > selectedDevice.currentThresholdMax ? 'text-red-500' : 'text-amber-500'}`} size={20} />
                                    <div className="text-sm font-bold">
                                        {selectedDevice.currentAmps !== null && selectedDevice.currentAmps !== undefined ? `${selectedDevice.currentAmps}A` : 'N/A'}
                                    </div>
                                    <div className="text-[10px] text-slate-400">Current</div>
                                </div>
                            </div>
                        </div>

                        {/* Mini History */}
                        {selectedDevice.temperatureHistory && selectedDevice.temperatureHistory.length > 0 && (
                            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Recent Temperature (Last {selectedDevice.temperatureHistory.length} readings)</h3>
                                <div className="flex items-end gap-1 h-16">
                                    {selectedDevice.temperatureHistory.slice(-20).map((r, i) => {
                                        const min = selectedDevice.tempThresholdMin;
                                        const max = selectedDevice.tempThresholdMax;
                                        const range = max - min + 4;
                                        const height = Math.max(4, ((r.value - min + 2) / range) * 100);
                                        const isAlert = r.value < min || r.value > max;
                                        return (
                                            <div
                                                key={i}
                                                className={`flex-1 rounded-t ${isAlert ? 'bg-red-400' : 'bg-emerald-400'}`}
                                                style={{ height: `${Math.min(100, height)}%` }}
                                                title={`${r.value}°C`}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="space-y-3 pt-4 border-t border-slate-200">
                            {selectedDevice.status !== 'INACTIVE' && (
                                <button
                                    onClick={() => handleDeactivate(selectedDevice.deviceId)}
                                    disabled={deactivating}
                                    className="w-full py-3 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
                                >
                                    <Power size={18} />
                                    {deactivating ? 'Deactivating...' : 'DEACTIVATE DEVICE'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="hidden md:flex flex-col items-center justify-center w-96 bg-slate-50 text-slate-400">
                    <Search size={48} className="mb-4 opacity-20" />
                    <p>Select a fridge to view details</p>
                </div>
            )}
        </div>
    );
}

export default DashboardHome;
