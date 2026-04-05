import { useState } from 'react';
import MedicineLookup from './MedicineLookup';
import MedicineCard from './MedicineCard';
import OrderPanel from './OrderPanel';
import OrderSuccess from './OrderSuccess';
import { Pill } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

function StaffApp() {
    const [currentStep, setCurrentStep] = useState('LOOKUP'); // LOOKUP | DETAILS | SUCCESS
    const [medicineData, setMedicineData] = useState(null);
    const [orderResult, setOrderResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [lookupError, setLookupError] = useState('');

    const handleLookup = async (query) => {
        setLoading(true);
        setLookupError('');
        try {
            const normalised = query.trim().toUpperCase();
            // Try exact ID first, then search
            let res = await fetch(`${API_URL}/medicines/${normalised}`);
            if (!res.ok) {
                res = await fetch(`${API_URL}/medicines/search/${encodeURIComponent(query.trim())}`);
                const results = await res.json();
                if (results.length === 0) {
                    setLookupError('No medicines found matching your search.');
                    setLoading(false);
                    return;
                }
                setMedicineData(results[0]); // Take first match
            } else {
                setMedicineData(await res.json());
            }
            setCurrentStep('DETAILS');
        } catch {
            setLookupError('Server error. Please try again.');
        }
        setLoading(false);
    };

    const handleOrderSuccess = (order) => {
        setOrderResult(order);
        setCurrentStep('SUCCESS');
    };

    return (
        <div className="civilian-layout min-h-screen bg-slate-50 flex flex-col items-center p-4">
            <header className="w-full max-w-md flex flex-col items-center mb-8 mt-4">
                <div className="bg-emerald-800 p-3 rounded-full text-white mb-3 shadow-lg">
                    <Pill size={32} />
                </div>
                <h1 className="text-2xl font-bold text-slate-800">PharmaSense Portal</h1>
                <p className="text-slate-500 text-sm">Medicine Lookup & Quick Order</p>
            </header>

            <main className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                {currentStep === 'LOOKUP' && (
                    <MedicineLookup onLookup={handleLookup} loading={loading} error={lookupError} />
                )}

                {currentStep === 'DETAILS' && medicineData && (
                    <div className="animate-fade-in">
                        <MedicineCard medicine={medicineData} />
                        <OrderPanel medicine={medicineData} onSuccess={handleOrderSuccess} />
                    </div>
                )}

                {currentStep === 'SUCCESS' && orderResult && (
                    <OrderSuccess order={orderResult} onReset={() => { setMedicineData(null); setOrderResult(null); setCurrentStep('LOOKUP'); }} />
                )}
            </main>

            <footer className="mt-8 text-center text-slate-400 text-xs">
                <p>PharmaSense IoT Platform</p>
                <p>Pharmacy Management System &copy; 2026</p>
            </footer>
        </div>
    );
}

export default StaffApp;
