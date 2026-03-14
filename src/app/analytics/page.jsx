import Analytics from '@views/Analytics';
import AdminRoute from '@utils/ProtectedRoute';

export default function Page() {
  return (
    <AdminRoute>
      <Analytics />
    </AdminRoute>
  );
}
