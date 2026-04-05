import { useState } from 'react';
import { usePharmacy } from '../../context/PharmacyContext';
import { ShieldCheck, Lock } from 'lucide-react';

function AdminLogin() {
    const { login } = usePharmacy();
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        const success = await login(id, password);
        if (success) {
            setError('');
        } else {
            setError('Invalid User ID or Password');
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700">
                <div className="flex flex-col items-center mb-8">
                    <ShieldCheck className="text-emerald-500 mb-4" size={48} />
                    <h1 className="text-2xl font-bold text-white">Admin Login</h1>
                    <p className="text-slate-400 text-sm">PharmaSense Management System</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-slate-400 text-xs font-bold uppercase mb-2">User ID</label>
                        <input
                            type="text"
                            value={id}
                            onChange={(e) => setId(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
                            placeholder="e.g. ADMIN"
                        />
                    </div>

                    <div>
                        <label className="block text-slate-400 text-xs font-bold uppercase mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
                            placeholder="••••••"
                        />
                    </div>

                    {error && <div className="text-red-400 text-sm text-center">{error}</div>}

                    <button
                        type="submit"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <Lock size={18} /> Secure Login
                    </button>
                </form>

                <div className="mt-6 text-center text-slate-600 text-xs">
                    <p>Authorized Personnel Only.</p>
                    <p>Demo Credentials: ID: ADMIN | Pass: 123</p>
                </div>
            </div>
        </div>
    );
}

export default AdminLogin;
