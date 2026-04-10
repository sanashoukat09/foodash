import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChefHat, User, Mail, Lock, Phone, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import './Auth.css';

const ROLES = [
  { value: 'customer', label: '🛒 Customer – Order food', desc: 'Browse and order from restaurants' },
  { value: 'restaurant_owner', label: '🍽️ Restaurant Owner', desc: 'List your restaurant and manage orders' },
  { value: 'driver', label: '🛵 Delivery Driver', desc: 'Earn by delivering orders' },
];

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer', phone: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast('Password must be at least 6 characters', 'error'); return; }
    try {
      setLoading(true);
      const user = await register(form);
      toast(`Welcome to Foodash, ${user.name.split(' ')[0]}! 🎉`, 'success');
      const map = { admin: '/admin', restaurant_owner: '/restaurant', driver: '/driver', customer: '/' };
      navigate(map[user.role] || '/');
    } catch (err) {
      toast(err.response?.data?.message || 'Registration failed', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-card card animate-in" style={{maxWidth:480}}>
        <div className="auth-logo"><ChefHat size={32} color="var(--brand)" /><span>Foodash</span></div>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-sub">Join thousands of food lovers</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label>Full Name</label>
            <div className="input-icon-wrap">
              <User size={16} className="input-icon" />
              <input type="text" className="input input-with-icon" placeholder="John Doe"
                value={form.name} onChange={e => set('name', e.target.value)} required />
            </div>
          </div>
          <div className="input-group">
            <label>Email</label>
            <div className="input-icon-wrap">
              <Mail size={16} className="input-icon" />
              <input type="email" className="input input-with-icon" placeholder="you@example.com"
                value={form.email} onChange={e => set('email', e.target.value)} required />
            </div>
          </div>
          <div className="input-group">
            <label>Phone (optional)</label>
            <div className="input-icon-wrap">
              <Phone size={16} className="input-icon" />
              <input type="tel" className="input input-with-icon" placeholder="+1 234 567 8900"
                value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
          </div>
          <div className="input-group">
            <label>Password</label>
            <div className="input-icon-wrap">
              <Lock size={16} className="input-icon" />
              <input type="password" className="input input-with-icon" placeholder="Min 6 characters"
                value={form.password} onChange={e => set('password', e.target.value)} required minLength={6} />
            </div>
          </div>

          <div className="input-group">
            <label>I am a...</label>
            <div className="role-grid">
              {ROLES.map(r => (
                <button type="button" key={r.value}
                  className={`role-card ${form.role === r.value ? 'active' : ''}`}
                  onClick={() => set('role', r.value)}>
                  <span className="role-label">{r.label}</span>
                  <span className="role-desc">{r.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}
