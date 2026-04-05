import { useState, useEffect } from 'react';
import { ShoppingCart, Search, Plus, CheckCircle, XCircle, Clock, X, Package } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

function OrderManager() {
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [medicines, setMedicines] = useState([]);
    const [newOrder, setNewOrder] = useState({
        customerName: '', customerPhone: '', prescriptionRef: '', notes: '',
        items: [{ medicineId: '', quantity: 1 }]
    });
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState('');

    useEffect(() => {
        fetchOrders();
        fetchStats();
        fetchMedicines();
    }, []);

    const fetchOrders = async () => {
        try {
            const url = filterStatus ? `${API_URL}/orders?status=${filterStatus}` : `${API_URL}/orders`;
            setOrders(await (await fetch(url)).json());
        } catch (err) {
            console.error(err);
        }
    };

    const fetchStats = async () => {
        try {
            setStats(await (await fetch(`${API_URL}/orders/stats`)).json());
        } catch (err) {
            console.error(err);
        }
    };

    const fetchMedicines = async () => {
        try {
            setMedicines(await (await fetch(`${API_URL}/medicines`)).json());
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => { fetchOrders(); }, [filterStatus]);

    const updateOrderStatus = async (orderId, status) => {
        try {
            await fetch(`${API_URL}/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            fetchOrders();
            fetchStats();
            setSelectedOrder(null);
        } catch (err) {
            alert('Failed: ' + err.message);
        }
    };

    const handleCreateOrder = async () => {
        if (!newOrder.customerName.trim()) {
            setCreateError('Customer name is required');
            return;
        }
        const validItems = newOrder.items.filter(i => i.medicineId && i.quantity > 0);
        if (validItems.length === 0) {
            setCreateError('Add at least one medicine');
            return;
        }
        setCreating(true);
        setCreateError('');
        try {
            const res = await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newOrder,
                    items: validItems,
                    createdBy: 'ADMIN'
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setShowCreateForm(false);
            setNewOrder({ customerName: '', customerPhone: '', prescriptionRef: '', notes: '', items: [{ medicineId: '', quantity: 1 }] });
            fetchOrders();
            fetchStats();
            fetchMedicines();
        } catch (err) {
            setCreateError(err.message);
        }
        setCreating(false);
    };

    const addItem = () => {
        setNewOrder(prev => ({ ...prev, items: [...prev.items, { medicineId: '', quantity: 1 }] }));
    };

    const removeItem = (idx) => {
        setNewOrder(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
    };

    const updateItem = (idx, field, value) => {
        setNewOrder(prev => ({
            ...prev,
            items: prev.items.map((item, i) => i === idx ? { ...item, [field]: value } : item)
        }));
    };

    const getStatusIcon = (status) => {
        if (status === 'COMPLETED') return <CheckCircle size={14} className="text-emerald-500" />;
        if (status === 'CANCELLED') return <XCircle size={14} className="text-red-500" />;
        return <Clock size={14} className="text-amber-500" />;
    };

    const getStatusBadge = (status) => {
        const colors = {
            PENDING: 'bg-amber-100 text-amber-700',
            COMPLETED: 'bg-emerald-100 text-emerald-700',
            CANCELLED: 'bg-red-100 text-red-700'
        };
        return <span className={`${colors[status]} px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1`}>{getStatusIcon(status)} {status}</span>;
    };

    const filteredOrders = orders.filter(o =>
        o.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.customerName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getOrderTotal = () => {
        return newOrder.items.reduce((sum, item) => {
            const med = medicines.find(m => m.medicineId === item.medicineId);
            return sum + (med ? med.unitPrice * item.quantity : 0);
        }, 0);
    };

    return (
        <div className="h-full flex flex-col md:flex-row">
            {/* List */}
            <div className="flex-1 bg-white p-6 border-r border-slate-200 flex flex-col">
                <header className="mb-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-slate-800">Orders & Billing</h2>
                        <button onClick={() => setShowCreateForm(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm transition-colors">
                            <Plus size={16} /> New Order
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-2 mb-4 text-center">
                        <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
                            <div className="text-blue-600 text-lg font-bold">{stats.total || 0}</div>
                            <div className="text-blue-400 text-[10px] font-bold uppercase">Total</div>
                        </div>
                        <div className="bg-amber-50 p-2 rounded-lg border border-amber-100">
                            <div className="text-amber-600 text-lg font-bold">{stats.pending || 0}</div>
                            <div className="text-amber-400 text-[10px] font-bold uppercase">Pending</div>
                        </div>
                        <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                            <div className="text-emerald-600 text-lg font-bold">₹{((stats.totalRevenue || 0) / 1000).toFixed(1)}k</div>
                            <div className="text-emerald-400 text-[10px] font-bold uppercase">Revenue</div>
                        </div>
                        <div className="bg-purple-50 p-2 rounded-lg border border-purple-100">
                            <div className="text-purple-600 text-lg font-bold">₹{((stats.pendingRevenue || 0) / 1000).toFixed(1)}k</div>
                            <div className="text-purple-400 text-[10px] font-bold uppercase">Pending ₹</div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <input type="text" placeholder="Search orders..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:border-emerald-500 outline-none text-sm" />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        </div>
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-none">
                            <option value="">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>
                </header>

                <div className="flex-1 overflow-auto space-y-2">
                    {filteredOrders.map(order => (
                        <div key={order.orderId} onClick={() => { setSelectedOrder(order); setShowCreateForm(false); }}
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedOrder?.orderId === order.orderId ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-bold text-slate-800 text-sm font-mono">{order.orderId}</div>
                                    <div className="text-xs text-slate-500">{order.customerName} · {order.items?.length || 0} items</div>
                                    <div className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    {getStatusBadge(order.status)}
                                    <span className="text-xs font-bold text-slate-600">₹{order.totalAmount}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Detail / Create Panel */}
            <div className="w-full md:w-96 bg-slate-50 p-6 shadow-[-4px_0_15px_rgba(0,0,0,0.05)] overflow-auto">
                {showCreateForm ? (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-800">Create Order</h3>
                            <button onClick={() => setShowCreateForm(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Customer Name *</label>
                                <input type="text" value={newOrder.customerName} onChange={(e) => setNewOrder(p => ({ ...p, customerName: e.target.value }))}
                                    className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Phone</label>
                                <input type="text" value={newOrder.customerPhone} onChange={(e) => setNewOrder(p => ({ ...p, customerPhone: e.target.value }))}
                                    className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Prescription Ref</label>
                                <input type="text" value={newOrder.prescriptionRef} onChange={(e) => setNewOrder(p => ({ ...p, prescriptionRef: e.target.value }))}
                                    className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-none" placeholder="Optional" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Medicines</label>
                                {newOrder.items.map((item, idx) => (
                                    <div key={idx} className="flex gap-2 mb-2">
                                        <select value={item.medicineId} onChange={(e) => updateItem(idx, 'medicineId', e.target.value)}
                                            className="flex-1 p-2 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-none">
                                            <option value="">Select medicine</option>
                                            {medicines.filter(m => m.quantity > 0).map(m => (
                                                <option key={m.medicineId} value={m.medicineId}>{m.name} (₹{m.unitPrice}, Stock: {m.quantity})</option>
                                            ))}
                                        </select>
                                        <input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
                                            className="w-16 p-2 border border-slate-300 rounded-lg text-sm text-center focus:border-emerald-500 outline-none" />
                                        {newOrder.items.length > 1 && (
                                            <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600"><X size={16} /></button>
                                        )}
                                    </div>
                                ))}
                                <button onClick={addItem} className="text-sm text-emerald-600 hover:text-emerald-700 font-bold">+ Add Item</button>
                            </div>

                            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-right">
                                <span className="text-sm text-slate-500">Estimated Total: </span>
                                <span className="text-lg font-bold text-emerald-700">₹{getOrderTotal().toFixed(2)}</span>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Notes</label>
                                <textarea value={newOrder.notes} onChange={(e) => setNewOrder(p => ({ ...p, notes: e.target.value }))}
                                    className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-none" rows={2} />
                            </div>

                            {createError && <div className="text-red-500 text-xs">{createError}</div>}
                            <button onClick={handleCreateOrder} disabled={creating}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-lg font-bold transition-colors">
                                {creating ? 'Creating...' : 'Create Order'}
                            </button>
                        </div>
                    </div>
                ) : selectedOrder ? (
                    <div>
                        <div className="border-b border-slate-200 pb-4 mb-4">
                            <h3 className="text-lg font-bold text-slate-800 font-mono">{selectedOrder.orderId}</h3>
                            <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-white p-3 rounded-lg border border-slate-200">
                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Customer</h4>
                                <div className="text-sm font-medium text-slate-800">{selectedOrder.customerName}</div>
                                {selectedOrder.customerPhone && <div className="text-xs text-slate-500">{selectedOrder.customerPhone}</div>}
                                {selectedOrder.prescriptionRef && <div className="text-xs text-blue-500 mt-1">Rx: {selectedOrder.prescriptionRef}</div>}
                            </div>

                            <div className="bg-white p-3 rounded-lg border border-slate-200">
                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Items</h4>
                                <div className="space-y-2">
                                    {selectedOrder.items?.map((item, i) => (
                                        <div key={i} className="flex justify-between text-sm">
                                            <div>
                                                <span className="font-medium">{item.name}</span>
                                                <span className="text-slate-400 ml-2">×{item.quantity}</span>
                                            </div>
                                            <span className="font-bold">₹{(item.quantity * item.unitPrice).toFixed(2)}</span>
                                        </div>
                                    ))}
                                    <div className="border-t pt-2 flex justify-between font-bold">
                                        <span>Total</span>
                                        <span className="text-emerald-600">₹{selectedOrder.totalAmount}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs text-slate-500">
                                <div>Created: {new Date(selectedOrder.createdAt).toLocaleString()}</div>
                                {selectedOrder.completedAt && <div>Completed: {new Date(selectedOrder.completedAt).toLocaleString()}</div>}
                                {selectedOrder.notes && <div className="mt-1 text-slate-600">Note: {selectedOrder.notes}</div>}
                            </div>

                            {selectedOrder.status === 'PENDING' && (
                                <div className="flex gap-2">
                                    <button onClick={() => updateOrderStatus(selectedOrder.orderId, 'COMPLETED')}
                                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2">
                                        <CheckCircle size={14} /> Complete
                                    </button>
                                    <button onClick={() => updateOrderStatus(selectedOrder.orderId, 'CANCELLED')}
                                        className="py-2 px-4 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg font-bold text-sm flex items-center justify-center gap-2">
                                        <XCircle size={14} /> Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <ShoppingCart size={48} className="mb-4 opacity-20" />
                        <p>Select an order to view details</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default OrderManager;
