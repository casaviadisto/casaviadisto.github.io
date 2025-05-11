import { Navigate, Outlet } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase-config';

export default function PrivateRoute() {
    const [user, loading] = useAuthState(auth);

    if (loading) return <div>Завантаження...</div>;
    return user ? <Outlet /> : <Navigate to="/login" replace />;
}