import Analytics from '../../views/Analytics.jsx';
import AdminRoute from '../../utils/ProtectedRoute';

export default function Page() {
  return (
    <AdminRoute>
      <Analytics />
    </AdminRoute>
  );
}