import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ChefHat, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import './Auth.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const user = await login(form.email, form.password);
      toast(`Welcome back, ${user.name.split(' ')[0]}! 👋`, 'success');
      const redirectMap = { admin: '/admin', restaurant_owner: '/restaurant', driver: '/driver' };
      navigate(redirectMap[user.role] || from);
    } catch (err) {
      toast(err.response?.data?.message || 'Login failed', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-card card animate-in">
        <div className="auth-logo">
          <ChefHat size={32} color="var(--brand)" />
          <span>Foodash</span>
        </div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label>Email</label>
            <div className="input-icon-wrap">
              <Mail size={16} className="input-icon" />
              <input type="email" className="input input-with-icon" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
          </div>
          <div className="input-group">
            <label>Password</label>
            <div className="input-icon-wrap">
              <Lock size={16} className="input-icon" />
              <input type={showPass ? 'text' : 'password'} className="input input-with-icon input-with-icon-right"
                placeholder="Your password" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} required />
              <button type="button" className="input-icon-right" onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-demo">
          <p style={{fontSize:12,color:'var(--text-muted)',marginBottom:10,fontWeight:600,textAlign:'center'}}>QUICK DEMO LOGIN</p>
          <div className="demo-grid">
            {[{role:'Customer',email:'customer@demo.com'},{role:'Restaurant',email:'owner@demo.com'},{role:'Driver',email:'driver@demo.com'},{role:'Admin',email:'admin@demo.com'}]
              .map(d => (
                <button key={d.role} className="demo-btn" onClick={() => setForm({email:d.email,password:'demo1234'})}>
                  {d.role}
                </button>
              ))}
          </div>
        </div>
        <p className="auth-footer">Don't have an account? <Link to="/register">Sign up</Link></p>
      </div>
    </div>
  );
}
