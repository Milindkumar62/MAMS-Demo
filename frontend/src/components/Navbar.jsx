import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, can } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">MAMS</div>
      <div className="navbar-links">
        <NavLink to="/" end>Dashboard</NavLink>
        <NavLink to="/purchases">Purchases</NavLink>
        <NavLink to="/transfers">Transfers</NavLink>
        {can.manageAssignments && <NavLink to="/assignments">Assignments</NavLink>}
        {user.role === 'admin' && <NavLink to="/users">Users</NavLink>}
      </div>
      <div className="navbar-user">
        <span className="user-chip">{user.name} · {user.role.replace('_', ' ')}</span>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}
