import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Loader = ({ size = 40, text = '' }) => (
  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, minHeight:200 }}>
    <div style={{ width:size, height:size, border:`3px solid var(--border)`, borderTopColor:'var(--brand)', borderRadius:'50%' }} className="spinner" />
    {text && <p style={{ color:'var(--text-muted)', fontSize:14 }}>{text}</p>}
  </div>
);

export const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

export const StarRating = ({ rating, size = 16 }) => {
  return (
    <div style={{ display:'flex', gap:2 }}>
      {[1,2,3,4,5].map(s => (
        <span key={s} style={{ color: s <= rating ? 'var(--accent)' : 'var(--surface)', fontSize:size }}>★</span>
      ))}
    </div>
  );
};

export const StatusBadge = ({ status }) => {
  const map = {
    pending:   { cls:'badge-warning', label:'Pending' },
    confirmed: { cls:'badge-brand',   label:'Confirmed' },
    preparing: { cls:'badge-warning', label:'Preparing' },
    ready:     { cls:'badge-brand',   label:'Ready' },
    picked_up: { cls:'badge-brand',   label:'On the way' },
    delivered: { cls:'badge-success', label:'Delivered' },
    cancelled: { cls:'badge-error',   label:'Cancelled' },
    paid:      { cls:'badge-success', label:'Paid' },
    refunded:  { cls:'badge-error',   label:'Refunded' },
  };
  const s = map[status] || { cls:'badge-muted', label:status };
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
};
