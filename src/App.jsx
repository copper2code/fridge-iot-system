import { useState } from 'react';
import { PharmacyProvider } from './context/PharmacyContext';
import AdminDashboard from './components/AdminDashboard';
import StaffApp from './components/staff/StaffApp';
import { ShieldCheck, ClipboardList } from 'lucide-react';

function App() {
  const [view, setView] = useState(''); // '' (Landing), 'admin', 'staff'

  if (!view) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 font-sans selection:bg-emerald-500 selection:text-white">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px]"></div>

        <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8 relative z-10">

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full -z-10 animate-pulse-ring"></div>

          {/* Staff Entry */}
          <div
            onClick={() => setView('staff')}
            className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 cursor-pointer hover:scale-[1.02] hover:shadow-2xl transition-all group border border-white/20 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className="relative z-10">
              <div className="bg-emerald-100 w-20 h-20 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-lg group-hover:-translate-y-1">
                <ClipboardList size={40} strokeWidth={1.5} />
              </div>
              <h2 className="text-3xl font-bold text-slate-800 mb-3 tracking-tight">Staff Portal</h2>
              <p className="text-slate-500 leading-relaxed text-sm font-medium">
                Look up medicines, check stock availability, and place quick orders for customers.
              </p>

              <div className="mt-8 flex items-center text-emerald-600 font-bold text-sm bg-emerald-50 w-fit px-4 py-2 rounded-full group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                Enter Portal &rarr;
              </div>
            </div>
          </div>

          {/* Admin Entry */}
          <div
            onClick={() => setView('admin')}
            className="bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 cursor-pointer hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-900/20 transition-all border border-slate-700/50 group hover:border-emerald-500/30 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className="relative z-10">
              <div className="bg-slate-700 w-20 h-20 rounded-2xl flex items-center justify-center text-emerald-400 mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 shadow-inner group-hover:shadow-lg group-hover:-translate-y-1">
                <ShieldCheck size={40} strokeWidth={1.5} />
              </div>
              <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Admin Panel</h2>
              <p className="text-slate-400 leading-relaxed text-sm font-medium">
                Full inventory management, IoT monitoring, alerts, orders, and system analytics.
              </p>

              <div className="mt-8 flex items-center text-emerald-400 font-bold text-sm bg-slate-900/50 w-fit px-4 py-2 rounded-full border border-slate-700 group-hover:border-emerald-500/50 group-hover:text-white transition-colors">
                Admin Login &rarr;
              </div>
            </div>
          </div>

        </div>

        <div className="fixed bottom-6 text-slate-500 text-xs font-medium tracking-widest uppercase opacity-60">
          PharmaSense IoT Platform v1.0
        </div>
      </div>
    );
  }

  return (
    <PharmacyProvider>
      <div className="app-container">
        {view === 'admin' ? <AdminDashboard /> : <StaffApp />}

        <button
          className="fixed bottom-4 right-4 bg-slate-800 text-white px-4 py-2 rounded-full text-xs opacity-50 hover:opacity-100 transition-opacity z-50 shadow-lg hover:shadow-xl"
          onClick={() => setView('')}
        >
          Exit to Home
        </button>
      </div>
    </PharmacyProvider>
  );
}

export default App;
