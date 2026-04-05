import { Package, Calendar, MapPin, Thermometer, Tag } from 'lucide-react';

function MedicineCard({ medicine }) {
    const now = new Date();
    const expiry = new Date(medicine.expiryDate);
    const daysToExpiry = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    const isExpired = expiry < now;
    const isExpiringSoon = daysToExpiry <= 30 && !isExpired;
    const isLowStock = medicine.quantity <= medicine.reorderLevel;

    return (
        <div className="p-6 border-b border-slate-100">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">{medicine.name}</h3>
                    <p className="text-sm text-slate-500">{medicine.genericName || medicine.category}</p>
                    <p className="text-xs text-slate-400 font-mono">{medicine.medicineId}</p>
                </div>
                <div className="text-right">
                    {isExpired && <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold">Expired</span>}
                    {isExpiringSoon && <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded text-xs font-bold">Expiring Soon</span>}
                    {isLowStock && !isExpired && <span className="bg-amber-100 text-amber-600 px-2 py-1 rounded text-xs font-bold mt-1 block">Low Stock</span>}
                    {!isExpired && !isExpiringSoon && !isLowStock && <span className="bg-emerald-100 text-emerald-600 px-2 py-1 rounded text-xs font-bold">In Stock</span>}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-slate-500 text-xs mb-1"><Package size={12} /> Stock</div>
                    <div className="text-lg font-bold text-slate-800">{medicine.quantity} units</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-slate-500 text-xs mb-1"><Tag size={12} /> Price</div>
                    <div className="text-lg font-bold text-slate-800">₹{medicine.unitPrice}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-slate-500 text-xs mb-1"><Calendar size={12} /> Expiry</div>
                    <div className={`text-sm font-bold ${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-orange-600' : 'text-slate-800'}`}>
                        {expiry.toLocaleDateString()}
                        {isExpiringSoon && <span className="text-xs ml-1">({daysToExpiry}d)</span>}
                    </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-slate-500 text-xs mb-1"><Thermometer size={12} /> Storage</div>
                    <div className="text-sm font-bold text-slate-800">{medicine.storageRequirement}</div>
                </div>
            </div>

            {medicine.manufacturer && (
                <div className="mt-3 text-xs text-slate-500">
                    <span className="font-medium">Manufacturer:</span> {medicine.manufacturer}
                    {medicine.batchNumber && <span> · Batch: {medicine.batchNumber}</span>}
                </div>
            )}
            {medicine.location && (
                <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                    <MapPin size={10} /> {medicine.location}
                </div>
            )}
        </div>
    );
}

export default MedicineCard;
