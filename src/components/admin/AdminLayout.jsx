import { useState } from 'react';
import { usePharmacy } from '../../context/PharmacyContext';
import { LogOut, LayoutDashboard, Activity, Cpu, Package, ShoppingCart, Bell } from 'lucide-react';
import DashboardHome from './DashboardHome';
import LiveMonitoring from './LiveMonitoring';
import DeviceManager from './DeviceManager';
import MedicineInventory from './MedicineInventory';
import OrderManager from './OrderManager';
import AlertsPanel from './AlertsPanel';

function AdminLayout() {
    const { logout, currentUser, alertStats } = usePharmacy();
    const [activeTab, setActiveTab] = useState('DASHBOARD');

    return (
        <div className="flex h-screen bg-slate-100 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl">
                <div className="p-6 border-b border-slate-800">
                    <h2 className="font-bold text-lg tracking-wide">🏥 PHARMASENSE</h2>
                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        System Online
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <NavButton
                        active={activeTab === 'DASHBOARD'}
                        onClick={() => setActiveTab('DASHBOARD')}
                        icon={<LayoutDashboard size={20} />}
                        label="Dashboard"
                    />
                    <NavButton
                        active={activeTab === 'MONITORING'}
                        onClick={() => setActiveTab('MONITORING')}
                        icon={<Activity size={20} />}
                        label="Live Monitoring"
                    />
                    <NavButton
                        active={activeTab === 'DEVICES'}
                        onClick={() => setActiveTab('DEVICES')}
                        icon={<Cpu size={20} />}
                        label="Manage Fridges"
                    />
                    <NavButton
                        active={activeTab === 'INVENTORY'}
                        onClick={() => setActiveTab('INVENTORY')}
                        icon={<Package size={20} />}
                        label="Medicine Inventory"
                    />
                    <NavButton
                        active={activeTab === 'ORDERS'}
                        onClick={() => setActiveTab('ORDERS')}
                        icon={<ShoppingCart size={20} />}
                        label="Orders & Billing"
                    />
                    <NavButton
                        active={activeTab === 'ALERTS'}
                        onClick={() => setActiveTab('ALERTS')}
                        icon={<Bell size={20} />}
                        label="Alerts"
                        badge={alertStats.unacknowledged || 0}
                    />
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="mb-4 text-sm text-slate-400">
                        Logged in as <br />
                        <span className="text-white font-semibold">{currentUser?.name}</span>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 transition-colors"
                    >
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto relative">
                {activeTab === 'DASHBOARD' && <DashboardHome />}
                {activeTab === 'MONITORING' && <LiveMonitoring />}
                {activeTab === 'DEVICES' && <DeviceManager onComplete={() => setActiveTab('DASHBOARD')} />}
                {activeTab === 'INVENTORY' && <MedicineInventory />}
                {activeTab === 'ORDERS' && <OrderManager />}
                {activeTab === 'ALERTS' && <AlertsPanel />}
            </main>
        </div>
    );
}

function NavButton({ active, onClick, icon, label, badge = 0 }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
        >
            {icon}
            <span className="font-medium text-sm flex-1 text-left">{label}</span>
            {badge > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                    {badge}
                </span>
            )}
        </button>
    );
}

export default AdminLayout;
