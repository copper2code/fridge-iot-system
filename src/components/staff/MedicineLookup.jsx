import { useState } from 'react';
import { Search } from 'lucide-react';

function MedicineLookup({ onLookup, loading, error }) {
    const [query, setQuery] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) onLookup(query);
    };

    return (
        <div className="p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-1">Search Medicine</h2>
            <p className="text-sm text-slate-500 mb-6">Enter a medicine name or ID to look up stock and details</p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="e.g. Paracetamol or MED003"
                        className="w-full p-4 pr-12 border-2 border-slate-200 rounded-xl focus:border-emerald-500 outline-none text-lg"
                    />
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading || !query.trim()}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold rounded-xl transition-colors"
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </form>

            <div className="mt-6 text-center text-slate-400 text-xs">
                <p>Try: Paracetamol, Insulin, MED001, Antibiotic</p>
            </div>
        </div>
    );
}

export default MedicineLookup;
