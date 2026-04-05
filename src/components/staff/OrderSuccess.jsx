import { CheckCircle, RotateCcw, Printer } from 'lucide-react';

function OrderSuccess({ order, onReset }) {
    return (
        <div className="p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-fade-in">
                <CheckCircle className="text-emerald-600" size={36} />
            </div>

            <h2 className="text-xl font-bold text-slate-800 mb-2">Order Created!</h2>
            <p className="text-slate-500 mb-6">Your order has been placed successfully</p>

            <div className="bg-slate-50 p-4 rounded-xl text-left space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Order ID</span>
                    <span className="font-bold font-mono text-slate-800">{order.orderId}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Customer</span>
                    <span className="font-medium text-slate-800">{order.customerName}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Items</span>
                    <span className="font-medium text-slate-800">{order.items?.length || 0} item(s)</span>
                </div>

                {order.items?.map((item, i) => (
                    <div key={i} className="flex justify-between text-xs text-slate-500 pl-4">
                        <span>{item.name} × {item.quantity}</span>
                        <span>₹{(item.quantity * item.unitPrice).toFixed(2)}</span>
                    </div>
                ))}

                <div className="border-t border-slate-200 pt-2 flex justify-between text-sm">
                    <span className="font-bold text-slate-700">Total</span>
                    <span className="font-bold text-emerald-600 text-lg">₹{order.totalAmount?.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Status</span>
                    <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs font-bold">{order.status}</span>
                </div>

                <div className="flex justify-between text-xs text-slate-400">
                    <span>Date</span>
                    <span>{new Date(order.createdAt).toLocaleString()}</span>
                </div>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={onReset}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                    <RotateCcw size={16} /> New Lookup
                </button>
            </div>
        </div>
    );
}

export default OrderSuccess;
