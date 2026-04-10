import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, ChefHat, LogOut, User, LayoutDashboard, Truck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const getDashboardLink = () => {
    if (!user) return null;
    const map = { admin: '/admin', restaurant_owner: '/restaurant', driver: '/driver', customer: '/orders' };
    return map[user.role];
  };

  const getDashboardLabel = () => {
    if (!user) return '';
    const map = { admin: 'Admin Panel', restaurant_owner: 'My Restaurant', driver: 'Driver Panel', customer: 'My Orders' };
    return map[user.role];
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        <Link to="/" className="navbar-logo">
          <ChefHat size={28} color="var(--brand)" />
          <span>Foo<span className="logo-accent">dash</span></span>
        </Link>

        <div className="navbar-links">
          <Link to="/" className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}>Home</Link>
          <Link to="/restaurants" className={location.pathname === '/restaurants' ? 'nav-link active' : 'nav-link'}>Restaurants</Link>
        </div>

        <div className="navbar-actions">
          {user ? (
            <>
              <Link to="/cart" className="cart-btn">
                <ShoppingCart size={20} />
                {count > 0 && <span className="cart-badge">{count}</span>}
              </Link>
              <div className="user-menu" onClick={() => setDropdownOpen(!dropdownOpen)}>
                <div className="user-avatar">{user.name?.[0]?.toUpperCase()}</div>
                <span className="user-name">{user.name?.split(' ')[0]}</span>
                {dropdownOpen && (
                  <div className="user-dropdown">
                    <Link to="/profile" className="dropdown-item"><User size={15} /> Profile</Link>
                    <Link to={getDashboardLink()} className="dropdown-item"><LayoutDashboard size={15} /> {getDashboardLabel()}</Link>
                    <div className="dropdown-divider" />
                    <button onClick={handleLogout} className="dropdown-item logout"><LogOut size={15} /> Logout</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
          <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/restaurants" onClick={() => setMenuOpen(false)}>Restaurants</Link>
          {user ? (
            <>
              <Link to="/cart" onClick={() => setMenuOpen(false)}>Cart {count > 0 && `(${count})`}</Link>
              <Link to={getDashboardLink()} onClick={() => setMenuOpen(false)}>{getDashboardLabel()}</Link>
              <button onClick={() => { handleLogout(); setMenuOpen(false); }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
