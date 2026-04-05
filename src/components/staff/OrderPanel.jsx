import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

function OrderPanel({ medicine, onSuccess }) {
    const [quantity, setQuantity] = useState(1);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const total = quantity * medicine.unitPrice;
    const isExpired = new Date(medicine.expiryDate) < new Date();
    const outOfStock = medicine.quantity === 0;
    const insufficientStock = quantity > medicine.quantity;

    const handleOrder = async () => {
        if (!customerName.trim()) {
            setError('Please enter customer name');
            return;
        }
        if (insufficientStock) {
            setError(`Only ${medicine.quantity} units available`);
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: [{ medicineId: medicine.medicineId, quantity }],
                    customerName: customerName.trim(),
                    customerPhone: customerPhone.trim(),
                    createdBy: 'STAFF'
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            onSuccess(data.order);
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    if (isExpired || outOfStock) {
        return (
            <div className="p-6 text-center">
                <div className={`${isExpired ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'} p-4 rounded-lg`}>
                    <p className="font-bold">{isExpired ? '⚠️ This medicine has expired' : '📦 Out of Stock'}</p>
                    <p className="text-xs mt-1">{isExpired ? 'Cannot dispense expired medication' : 'This item is currently unavailable'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h3 className="text-sm font-bold text-slate-700 mb-4">Quick Order</h3>

            <div className="space-y-3">
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Quantity</label>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-10 h-10 rounded-lg border border-slate-300 text-slate-600 font-bold hover:bg-slate-50">-</button>
                        <input type="number" min="1" max={medicine.quantity} value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                            className="w-20 p-2 border border-slate-300 rounded-lg text-center text-lg font-bold focus:border-emerald-500 outline-none" />
                        <button onClick={() => setQuantity(Math.min(medicine.quantity, quantity + 1))}
                            className="w-10 h-10 rounded-lg border border-slate-300 text-slate-600 font-bold hover:bg-slate-50">+</button>
                        <span className="text-xs text-slate-400">Max: {medicine.quantity}</span>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Customer Name *</label>
                    <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-none" />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Phone</label>
                    <input type="text" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-none" />
                </div>

                <div className="bg-emerald-50 p-3 rounded-lg text-right border border-emerald-200">
                    <span className="text-sm text-slate-500">{quantity} × ₹{medicine.unitPrice} = </span>
                    <span className="text-xl font-bold text-emerald-700">₹{total.toFixed(2)}</span>
                </div>

                {error && <div className="text-red-500 text-xs">{error}</div>}

                <button
                    onClick={handleOrder}
                    disabled={loading || insufficientStock}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                    <ShoppingCart size={18} />
                    {loading ? 'Processing...' : `Place Order — ₹${total.toFixed(2)}`}
                </button>
            </div>
        </div>
    );
}

export default OrderPanel;
