import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../common/ToastContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    addToast('Logged out successfully');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">TaskTracker</Link>
      </div>
      <div className="navbar-links">
        {user ? (
          <>
            <Link to="/">Dashboard</Link>
            <Link to="/tasks">Tasks</Link>
            <span className="navbar-user">Hi, {user.name}</span>
            <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign Up</Link>
          </>
        )}
        <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </nav>
  );
}
