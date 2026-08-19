import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../common/ToastContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = async () => {
    await logout();
    addToast('Signed out');
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
            <Link to="/" className={pathname === '/' ? 'active' : ''}>Dashboard</Link>
            <Link to="/tasks" className={pathname === '/tasks' ? 'active' : ''}>Tasks</Link>
            <div className="navbar-divider" />
            <span className="navbar-user">{user.name}</span>
            <button
              className="btn btn-ghost btn-sm"
              onClick={handleLogout}
              style={{ fontSize: '0.8125rem' }}
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>Sign up</Link>
          </>
        )}
        <button className="theme-toggle" onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </nav>
  );
}
