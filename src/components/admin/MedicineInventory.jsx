import { useState, useEffect } from 'react';
import { Package, Search, Plus, Edit3, Trash2, AlertTriangle, Calendar, X, CheckCircle } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

function MedicineInventory() {
    const [medicines, setMedicines] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingMedicine, setEditingMedicine] = useState(null);
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const [stats, setStats] = useState({});
    const [filterCategory, setFilterCategory] = useState('');
    const [form, setForm] = useState({
        medicineId: '', name: '', genericName: '', category: 'General',
        manufacturer: '', batchNumber: '', expiryDate: '',
        quantity: 0, unitPrice: 0, storageRequirement: 'Room Temperature',
        reorderLevel: 10, location: '', description: ''
    });
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchMedicines();
        fetchStats();
    }, []);

    const fetchMedicines = async () => {
        try {
            const res = await fetch(`${API_URL}/medicines`);
            setMedicines(await res.json());
        } catch (err) {
            console.error('Failed to fetch medicines:', err);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await fetch(`${API_URL}/medicines/stats`);
            setStats(await res.json());
        } catch (err) {
            console.error(err);
        }
    };

    const handleSave = async () => {
        if (!form.medicineId || !form.name || !form.expiryDate) {
            setFormError('Medicine ID, Name, and Expiry Date are required.');
            return;
        }
        setSaving(true);
        setFormError('');
        try {
            const url = editingMedicine
                ? `${API_URL}/medicines/${editingMedicine.medicineId}`
                : `${API_URL}/medicines`;
            const method = editingMedicine ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setShowForm(false);
            setEditingMedicine(null);
            resetForm();
            fetchMedicines();
            fetchStats();
        } catch (err) {
            setFormError(err.message);
        }
        setSaving(false);
    };

    const handleDelete = async (medicineId) => {
        if (!confirm(`Delete medicine ${medicineId}? This cannot be undone.`)) return;
        try {
            await fetch(`${API_URL}/medicines/${medicineId}`, { method: 'DELETE' });
            setSelectedMedicine(null);
            fetchMedicines();
            fetchStats();
        } catch (err) {
            alert('Delete failed: ' + err.message);
        }
    };

    const startEdit = (medicine) => {
        setEditingMedicine(medicine);
        setForm({
            medicineId: medicine.medicineId,
            name: medicine.name,
            genericName: medicine.genericName || '',
            category: medicine.category || 'General',
            manufacturer: medicine.manufacturer || '',
            batchNumber: medicine.batchNumber || '',
            expiryDate: medicine.expiryDate ? new Date(medicine.expiryDate).toISOString().split('T')[0] : '',
            quantity: medicine.quantity || 0,
            unitPrice: medicine.unitPrice || 0,
            storageRequirement: medicine.storageRequirement || 'Room Temperature',
            reorderLevel: medicine.reorderLevel || 10,
            location: medicine.location || '',
            description: medicine.description || ''
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setForm({
            medicineId: '', name: '', genericName: '', category: 'General',
            manufacturer: '', batchNumber: '', expiryDate: '',
            quantity: 0, unitPrice: 0, storageRequirement: 'Room Temperature',
            reorderLevel: 10, location: '', description: ''
        });
        setFormError('');
    };

    const categories = [...new Set(medicines.map(m => m.category).filter(Boolean))];

    const filteredMedicines = medicines.filter(m => {
        const matchSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.medicineId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (m.genericName || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchCategory = !filterCategory || m.category === filterCategory;
        return matchSearch && matchCategory;
    });

    const getStatusBadge = (medicine) => {
        const now = new Date();
        const expiry = new Date(medicine.expiryDate);
        const daysToExpiry = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

        if (expiry < now) return <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-bold">Expired</span>;
        if (medicine.quantity === 0) return <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-xs font-bold">Out of Stock</span>;
        if (daysToExpiry <= 30) return <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded text-xs font-bold">Expiring Soon</span>;
        if (medicine.quantity <= medicine.reorderLevel) return <span className="bg-amber-100 text-amber-600 px-2 py-0.5 rounded text-xs font-bold">Low Stock</span>;
        return <span className="bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded text-xs font-bold">In Stock</span>;
    };

    return (
        <div className="h-full flex flex-col md:flex-row">
            {/* List */}
            <div className="flex-1 bg-white p-6 border-r border-slate-200 flex flex-col">
                <header className="mb-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-slate-800">Medicine Inventory</h2>
                        <button
                            onClick={() => { setShowForm(true); setEditingMedicine(null); resetForm(); }}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm transition-colors"
                        >
                            <Plus size={16} /> Add Medicine
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-5 gap-2 mb-4 text-center">
                        <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
                            <div className="text-blue-600 text-lg font-bold">{stats.total || 0}</div>
                            <div className="text-blue-400 text-[10px] font-bold uppercase">Total</div>
                        </div>
                        <div className="bg-amber-50 p-2 rounded-lg border border-amber-100">
                            <div className="text-amber-600 text-lg font-bold">{stats.lowStock || 0}</div>
                            <div className="text-amber-400 text-[10px] font-bold uppercase">Low Stock</div>
                        </div>
                        <div className="bg-orange-50 p-2 rounded-lg border border-orange-100">
                            <div className="text-orange-600 text-lg font-bold">{stats.expiringSoon || 0}</div>
                            <div className="text-orange-400 text-[10px] font-bold uppercase">Expiring</div>
                        </div>
                        <div className="bg-red-50 p-2 rounded-lg border border-red-100">
                            <div className="text-red-600 text-lg font-bold">{stats.expired || 0}</div>
                            <div className="text-red-400 text-[10px] font-bold uppercase">Expired</div>
                        </div>
                        <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                            <div className="text-emerald-600 text-lg font-bold">₹{((stats.totalInventoryValue || 0) / 1000).toFixed(1)}k</div>
                            <div className="text-emerald-400 text-[10px] font-bold uppercase">Value</div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <input type="text" placeholder="Search medicines..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:border-emerald-500 outline-none text-sm" />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        </div>
                        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
                            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-none">
                            <option value="">All Categories</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </header>

                <div className="flex-1 overflow-auto space-y-2">
                    {filteredMedicines.map(med => (
                        <div
                            key={med.medicineId}
                            onClick={() => setSelectedMedicine(med)}
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedMedicine?.medicineId === med.medicineId ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:bg-slate-50'}`}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-bold text-slate-800 text-sm">{med.name}</div>
                                    <div className="text-xs text-slate-500">{med.medicineId} · {med.category} · {med.manufacturer}</div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    {getStatusBadge(med)}
                                    <span className="text-xs text-slate-400">Qty: {med.quantity}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Detail / Form Panel */}
            <div className="w-full md:w-96 bg-slate-50 p-6 shadow-[-4px_0_15px_rgba(0,0,0,0.05)] overflow-auto">
                {showForm ? (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-800">{editingMedicine ? 'Edit Medicine' : 'Add Medicine'}</h3>
                            <button onClick={() => { setShowForm(false); setEditingMedicine(null); }} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Medicine ID *</label>
                                <input type="text" value={form.medicineId} onChange={(e) => setForm({ ...form, medicineId: e.target.value.toUpperCase() })}
                                    disabled={!!editingMedicine} className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-none disabled:bg-slate-100" placeholder="e.g. MED009" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Name *</label>
                                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Generic Name</label>
                                <input type="text" value={form.genericName} onChange={(e) => setForm({ ...form, genericName: e.target.value })}
                                    className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Category</label>
                                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                                        className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-none">
                                        {['General', 'Antibiotic', 'Analgesic', 'Antidiabetic', 'Cardiovascular', 'Hormone', 'Vaccine', 'Antihistamine', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Storage</label>
                                    <select value={form.storageRequirement} onChange={(e) => setForm({ ...form, storageRequirement: e.target.value })}
                                        className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-none">
                                        {['Room Temperature', 'Cold Storage (2-8°C)', 'Freezer (-20°C)', 'Cool & Dry'].map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Manufacturer</label>
                                    <input type="text" value={form.manufacturer} onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
                                        className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Batch Number</label>
                                    <input type="text" value={form.batchNumber} onChange={(e) => setForm({ ...form, batchNumber: e.target.value })}
                                        className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Expiry Date *</label>
                                <input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                                    className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-none" />
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Quantity</label>
                                    <input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                                        className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Unit Price ₹</label>
                                    <input type="number" step="0.01" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: Number(e.target.value) })}
                                        className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Reorder At</label>
                                    <input type="number" value={form.reorderLevel} onChange={(e) => setForm({ ...form, reorderLevel: Number(e.target.value) })}
                                        className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Location</label>
                                <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                                    className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-none" placeholder="e.g. Shelf A1" />
                            </div>
                            {formError && <div className="text-red-500 text-xs">{formError}</div>}
                            <button onClick={handleSave} disabled={saving}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-lg font-bold transition-colors">
                                {saving ? 'Saving...' : editingMedicine ? 'Update Medicine' : 'Add Medicine'}
                            </button>
                        </div>
                    </div>
                ) : selectedMedicine ? (
                    <div>
                        <div className="border-b border-slate-200 pb-4 mb-4">
                            <h3 className="text-lg font-bold text-slate-800">{selectedMedicine.name}</h3>
                            <div className="text-sm text-slate-500 font-mono">{selectedMedicine.medicineId}</div>
                            <div className="mt-2">{getStatusBadge(selectedMedicine)}</div>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-white p-3 rounded-lg border border-slate-200">
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div><span className="text-slate-400 text-xs block">Generic Name</span><span className="font-medium">{selectedMedicine.genericName || '—'}</span></div>
                                    <div><span className="text-slate-400 text-xs block">Category</span><span className="font-medium">{selectedMedicine.category}</span></div>
                                    <div><span className="text-slate-400 text-xs block">Manufacturer</span><span className="font-medium">{selectedMedicine.manufacturer}</span></div>
                                    <div><span className="text-slate-400 text-xs block">Batch</span><span className="font-medium font-mono">{selectedMedicine.batchNumber}</span></div>
                                    <div><span className="text-slate-400 text-xs block">Storage</span><span className="font-medium">{selectedMedicine.storageRequirement}</span></div>
                                    <div><span className="text-slate-400 text-xs block">Location</span><span className="font-medium">{selectedMedicine.location}</span></div>
                                </div>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-slate-200">
                                <div className="grid grid-cols-3 gap-3 text-center">
                                    <div>
                                        <div className="text-lg font-bold text-slate-800">{selectedMedicine.quantity}</div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase">In Stock</div>
                                    </div>
                                    <div>
                                        <div className="text-lg font-bold text-slate-800">₹{selectedMedicine.unitPrice}</div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase">Unit Price</div>
                                    </div>
                                    <div>
                                        <div className="text-lg font-bold text-slate-800 flex items-center justify-center gap-1">
                                            <Calendar size={14} /> {new Date(selectedMedicine.expiryDate).toLocaleDateString()}
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase">Expires</div>
                                    </div>
                                </div>
                            </div>
                            {selectedMedicine.description && (
                                <div className="bg-white p-3 rounded-lg border border-slate-200 text-sm text-slate-600">
                                    {selectedMedicine.description}
                                </div>
                            )}
                            <div className="flex gap-2 pt-2">
                                <button onClick={() => startEdit(selectedMedicine)}
                                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2">
                                    <Edit3 size={14} /> Edit
                                </button>
                                <button onClick={() => handleDelete(selectedMedicine.medicineId)}
                                    className="py-2 px-4 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg font-bold text-sm flex items-center justify-center gap-2">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <Package size={48} className="mb-4 opacity-20" />
                        <p>Select a medicine to view details</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MedicineInventory;
