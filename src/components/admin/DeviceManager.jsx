import { useState, useEffect } from 'react';
import { usePharmacy } from '../../context/PharmacyContext';
import { Cpu, Search, CheckCircle, MapPin, Thermometer, Zap, AlertCircle } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

function DeviceManager({ onComplete }) {
    const { activateDevice } = usePharmacy();
    const [step, setStep] = useState(1); // 1: select device, 2: configure zone, 3: confirm
    const [availableDevices, setAvailableDevices] = useState([]);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [zone, setZone] = useState('');
    const [tempMin, setTempMin] = useState(2);
    const [tempMax, setTempMax] = useState(8);
    const [currentMax, setCurrentMax] = useState(10);
    const [activateResult, setActivateResult] = useState(null);
    const [activating, setActivating] = useState(false);
    const [activateError, setActivateError] = useState('');

    useEffect(() => {
        fetchAvailableDevices();
    }, []);

    const fetchAvailableDevices = async () => {
        try {
            const res = await fetch(`${API_URL}/devices/available`);
            const data = await res.json();
            setAvailableDevices(data);
        } catch (err) {
            console.error('Failed to fetch devices:', err);
        }
    };

    const handleActivate = async () => {
        setActivating(true);
        setActivateError('');
        try {
            const result = await activateDevice(selectedDevice.deviceId, zone, {
                tempThresholdMin: tempMin,
                tempThresholdMax: tempMax,
                currentThresholdMax: currentMax
            });
            setActivateResult(result);
            setStep(4);
        } catch (err) {
            setActivateError(err.message || 'Failed to activate device');
        }
        setActivating(false);
    };

    const resetForm = () => {
        setStep(1);
        setSelectedDevice(null);
        setZone('');
        setTempMin(2);
        setTempMax(8);
        setCurrentMax(10);
        setActivateResult(null);
        setActivateError('');
        fetchAvailableDevices();
    };

    const presetZones = [
        { label: 'Cold Storage (2-8°C)', zone: 'Cold Storage', min: 2, max: 8 },
        { label: 'Vaccine Fridge (2-8°C)', zone: 'Vaccine Fridge', min: 2, max: 8 },
        { label: 'Main Floor (15-30°C)', zone: 'Main Floor', min: 15, max: 30 },
        { label: 'Warehouse (10-25°C)', zone: 'Warehouse', min: 10, max: 25 },
    ];

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <header className="mb-8 border-b border-slate-200 pb-4">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Cpu className="text-emerald-500" /> Manage Devices
                </h2>
                <p className="text-slate-500 mt-1">Select a sensor node, assign a zone, and activate monitoring.</p>
            </header>

            {/* Step Indicators */}
            <div className="flex items-center gap-4 mb-8">
                {['Select Device', 'Configure Zone', 'Confirm'].map((label, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step > i + 1 ? 'bg-emerald-500 text-white' : step === i + 1 ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-200 text-slate-500'}`}>
                            {step > i + 1 ? '✓' : i + 1}
                        </div>
                        <span className={`text-sm font-medium ${step === i + 1 ? 'text-emerald-600' : 'text-slate-400'}`}>{label}</span>
                        {i < 2 && <div className={`w-8 h-px ${step > i + 1 ? 'bg-emerald-400' : 'bg-slate-200'}`}></div>}
                    </div>
                ))}
            </div>

            {/* Step 1: Select Device */}
            {step === 1 && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-700 mb-4">Available Devices</h3>
                    {availableDevices.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            <AlertCircle className="mx-auto mb-2" size={32} />
                            <p>No available devices. All devices are currently active.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {availableDevices.map(device => (
                                <div
                                    key={device.deviceId}
                                    onClick={() => { setSelectedDevice(device); setStep(2); }}
                                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md hover:border-emerald-400 ${selectedDevice?.deviceId === device.deviceId ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="font-bold text-slate-800 font-mono">{device.deviceId}</div>
                                            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                                <span className="inline-block w-2 h-2 rounded-full bg-slate-400"></span>
                                                Inactive — Ready to activate
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Step 2: Configure Zone */}
            {step === 2 && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="mb-4">
                        <button onClick={() => setStep(1)} className="text-sm text-slate-400 hover:text-slate-600 transition-colors">← Back to device selection</button>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg mb-6 flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                            <Cpu size={20} />
                        </div>
                        <div>
                            <div className="text-xs text-slate-400">Selected Device</div>
                            <div className="font-bold font-mono text-slate-800">{selectedDevice?.deviceId}</div>
                        </div>
                    </div>

                    {/* Quick Presets */}
                    <h3 className="font-bold text-slate-700 mb-3">Zone Presets</h3>
                    <div className="grid grid-cols-2 gap-2 mb-6">
                        {presetZones.map((preset, i) => (
                            <button
                                key={i}
                                onClick={() => { setZone(preset.zone); setTempMin(preset.min); setTempMax(preset.max); }}
                                className={`p-3 rounded-lg border text-left text-sm transition-all ${zone === preset.zone ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 hover:border-emerald-300 text-slate-600'}`}
                            >
                                <div className="font-bold">{preset.label}</div>
                            </button>
                        ))}
                    </div>

                    <h3 className="font-bold text-slate-700 mb-3">Custom Configuration</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Zone Name</label>
                            <input
                                type="text"
                                value={zone}
                                onChange={(e) => setZone(e.target.value)}
                                placeholder="e.g. Cold Storage A"
                                className="w-full p-3 border border-slate-300 rounded-lg focus:border-emerald-500 outline-none"
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Min Temp (°C)</label>
                                <input type="number" value={tempMin} onChange={(e) => setTempMin(Number(e.target.value))} className="w-full p-3 border border-slate-300 rounded-lg focus:border-emerald-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Max Temp (°C)</label>
                                <input type="number" value={tempMax} onChange={(e) => setTempMax(Number(e.target.value))} className="w-full p-3 border border-slate-300 rounded-lg focus:border-emerald-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Max Current (A)</label>
                                <input type="number" value={currentMax} onChange={(e) => setCurrentMax(Number(e.target.value))} className="w-full p-3 border border-slate-300 rounded-lg focus:border-emerald-500 outline-none" />
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => { if (zone.trim()) setStep(3); }}
                        disabled={!zone.trim()}
                        className="w-full mt-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-lg font-bold transition-colors"
                    >
                        Continue to Review
                    </button>
                </div>
            )}

            {/* Step 3: Review & Confirm */}
            {step === 3 && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="mb-4">
                        <button onClick={() => setStep(2)} className="text-sm text-slate-400 hover:text-slate-600 transition-colors">← Change configuration</button>
                    </div>

                    <h3 className="font-bold text-slate-700 mb-4">Review & Confirm</h3>

                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Device</h4>
                            <div className="text-lg font-bold font-mono text-slate-800">{selectedDevice?.deviceId}</div>
                        </div>

                        <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">Configuration</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <MapPin size={14} className="text-emerald-500" />
                                    <span className="font-bold text-slate-800">{zone}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Thermometer size={14} className="text-blue-500" />
                                    <span className="text-slate-700">{tempMin}°C — {tempMax}°C</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Zap size={14} className="text-amber-500" />
                                    <span className="text-slate-700">Max {currentMax}A</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {activateError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
                            <AlertCircle size={16} /> {activateError}
                        </div>
                    )}

                    <button
                        onClick={handleActivate}
                        disabled={activating}
                        className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white rounded-lg font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98]"
                    >
                        <Cpu size={22} />
                        {activating ? 'Activating...' : 'Confirm & Activate Monitoring'}
                    </button>
                    <p className="text-center text-xs text-slate-400 mt-2">
                        This will start temperature and power monitoring for this zone.
                    </p>
                </div>
            )}

            {/* Step 4: Success */}
            {step === 4 && activateResult && (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-emerald-200 text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="text-emerald-600" size={36} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Device Activated!</h3>
                    <p className="text-slate-500 mb-6">
                        <span className="font-mono font-bold">{activateResult.device?.deviceId}</span> is now monitoring <span className="font-bold">{activateResult.device?.zone}</span>
                    </p>

                    <div className="bg-slate-50 p-4 rounded-lg text-left inline-block text-sm space-y-1 mb-6">
                        <div><span className="text-slate-400">Zone:</span> <span className="font-medium">{activateResult.device?.zone}</span></div>
                        <div><span className="text-slate-400">Temp Range:</span> <span className="font-medium">{activateResult.device?.tempThresholdMin}°C — {activateResult.device?.tempThresholdMax}°C</span></div>
                        <div><span className="text-slate-400">Max Current:</span> <span className="font-medium">{activateResult.device?.currentThresholdMax}A</span></div>
                    </div>

                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={resetForm}
                            className="px-6 py-2 border-2 border-slate-200 text-slate-600 rounded-lg font-bold hover:bg-slate-50 transition-colors"
                        >
                            Activate Another
                        </button>
                        <button
                            onClick={onComplete}
                            className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-colors"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DeviceManager;
