import { usePharmacy } from '../context/PharmacyContext';
import AdminLogin from './admin/AdminLogin';
import AdminLayout from './admin/AdminLayout';

function AdminDashboard() {
    const { currentUser } = usePharmacy();

    if (!currentUser) {
        return <AdminLogin />;
    }

    return <AdminLayout />;
}

export default AdminDashboard;
