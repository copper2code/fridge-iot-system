import { useState, useEffect } from 'react';
import { usePharmacy } from '../../context/PharmacyContext';
import { Bell, AlertTriangle, Thermometer, Zap, CheckCircle, WifiOff, Filter } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

function AlertsPanel() {
    const { acknowledgeAlert } = usePharmacy();
    const [alerts, setAlerts] = useState([]);
    const [stats, setStats] = useState({ total: 0, unacknowledged: 0, temperature: 0, power: 0 });
    const [filterType, setFilterType] = useState('');
    const [filterAcknowledged, setFilterAcknowledged] = useState('false');
    const [acknowledging, setAcknowledging] = useState(null);

    useEffect(() => {
        fetchAlerts();
        fetchStats();
    }, [filterType, filterAcknowledged]);

    const fetchAlerts = async () => {
        try {
            let url = `${API_URL}/alerts?`;
            if (filterType) url += `type=${filterType}&`;
            if (filterAcknowledged) url += `acknowledged=${filterAcknowledged}`;
            setAlerts(await (await fetch(url)).json());
        } catch (err) {
            console.error(err);
        }
    };

    const fetchStats = async () => {
        try {
            setStats(await (await fetch(`${API_URL}/alerts/stats`)).json());
        } catch (err) {
            console.error(err);
        }
    };

    const handleAcknowledge = async (alertId) => {
        setAcknowledging(alertId);
        try {
            await acknowledgeAlert(alertId);
            fetchAlerts();
            fetchStats();
        } catch (err) {
            alert('Failed: ' + err.message);
        }
        setAcknowledging(null);
    };

    const getAlertIcon = (type) => {
        if (type === 'TEMPERATURE') return <Thermometer size={16} className="text-red-500" />;
        if (type === 'POWER') return <Zap size={16} className="text-amber-500" />;
        return <WifiOff size={16} className="text-slate-500" />;
    };

    const getAlertBg = (alert) => {
        if (alert.acknowledged) return 'bg-slate-50 border-slate-200';
        if (alert.type === 'TEMPERATURE') return 'bg-red-50 border-red-200';
        if (alert.type === 'POWER') return 'bg-amber-50 border-amber-200';
        return 'bg-slate-50 border-slate-300';
    };

    const relativeTo = (dateStr) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        return `${days}d ago`;
    };

    return (
        <div className="h-full overflow-auto p-6 bg-slate-100">
            <header className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Bell className="text-red-500" /> Alerts
                </h2>
                <p className="text-slate-500 mt-1">Temperature breaches, power anomalies, and device status alerts</p>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3 mb-6">
                <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
                    <div className="text-xl font-bold text-slate-700">{stats.total}</div>
                    <div className="text-xs text-slate-400 font-bold uppercase">Total</div>
                </div>
                <div className="bg-red-50 p-3 rounded-lg border border-red-200 text-center">
                    <div className="text-xl font-bold text-red-600">{stats.unacknowledged}</div>
                    <div className="text-xs text-red-400 font-bold uppercase">Unread</div>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-200 text-center">
                    <div className="text-xl font-bold text-orange-600">{stats.temperature}</div>
                    <div className="text-xs text-orange-400 font-bold uppercase">Temp Alerts</div>
                </div>
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-center">
                    <div className="text-xl font-bold text-amber-600">{stats.power}</div>
                    <div className="text-xs text-amber-400 font-bold uppercase">Power Alerts</div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Filter size={14} /> Filter:
                </div>
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-none">
                    <option value="">All Types</option>
                    <option value="TEMPERATURE">Temperature</option>
                    <option value="POWER">Power</option>
                    <option value="DEVICE_OFFLINE">Device Offline</option>
                </select>
                <select value={filterAcknowledged} onChange={(e) => setFilterAcknowledged(e.target.value)}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-none">
                    <option value="false">Unacknowledged</option>
                    <option value="true">Acknowledged</option>
                    <option value="">All</option>
                </select>
            </div>

            {/* Alert Timeline */}
            <div className="space-y-3">
                {alerts.length === 0 ? (
                    <div className="text-center py-16 text-slate-400">
                        <CheckCircle size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-medium">All clear!</p>
                        <p className="text-sm">No alerts match the current filter</p>
                    </div>
                ) : (
                    alerts.map(alert => (
                        <div key={alert.alertId} className={`p-4 rounded-xl border ${getAlertBg(alert)} transition-all`}>
                            <div className="flex justify-between items-start">
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5">{getAlertIcon(alert.type)}</div>
                                    <div>
                                        <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                            {alert.type === 'TEMPERATURE' && '🌡️ Temperature Breach'}
                                            {alert.type === 'POWER' && '⚡ Power Anomaly'}
                                            {alert.type === 'DEVICE_OFFLINE' && '📡 Device Offline'}
                                            {!alert.acknowledged && <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-0.5">
                                            {alert.deviceId} · {alert.zone || 'Unknown zone'}
                                        </div>
                                        <div className="text-sm text-slate-600 mt-1">{alert.threshold}</div>
                                        {alert.message && <div className="text-xs text-slate-400 mt-0.5">{alert.message}</div>}
                                        <div className="text-xs text-slate-400 mt-2">
                                            {relativeTo(alert.createdAt)}
                                            {alert.acknowledged && (
                                                <span className="text-emerald-500 ml-2">✓ Acknowledged by {alert.acknowledgedBy}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {!alert.acknowledged && (
                                    <button
                                        onClick={() => handleAcknowledge(alert.alertId)}
                                        disabled={acknowledging === alert.alertId}
                                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                                    >
                                        <CheckCircle size={12} />
                                        {acknowledging === alert.alertId ? '...' : 'Acknowledge'}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default AlertsPanel;
