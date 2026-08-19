import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/common/Spinner';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="center-screen"><Spinner size="lg" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
