import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, Store, ShoppingBag, DollarSign, CheckCircle, X, Eye } from 'lucide-react';
import api from '../../utils/api';
import { useToast } from '../../components/common/Toast';
import { Loader, StatusBadge } from '../../components/common';
import '../restaurant/RestaurantDashboard.css';
import './AdminDashboard.css';

const TABS = ['Overview', 'Restaurants', 'Users', 'Orders'];

export default function AdminDashboard() {
  const toast = useToast();
  const [tab, setTab] = useState('Overview');
  const [stats, setStats] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, [tab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (tab === 'Overview' || !stats) {
        const { data } = await api.get('/admin/stats');
        setStats(data);
      }
      if (tab === 'Restaurants') {
        const { data } = await api.get('/admin/restaurants');
        setRestaurants(data.restaurants || []);
      }
      if (tab === 'Users') {
        const { data } = await api.get('/admin/users');
        setUsers(data.users || []);
      }
      if (tab === 'Orders') {
        const { data } = await api.get('/admin/orders');
        setOrders(data.orders || []);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const approveRestaurant = async (id) => {
    try {
      await api.put(`/admin/restaurants/${id}/approve`);
      setRestaurants(prev => prev.map(r => r._id === id ? { ...r, isApproved: true } : r));
      toast('Restaurant approved!', 'success');
    } catch (e) { toast('Error', 'error'); }
  };

  const toggleUser = async (id, current) => {
    try {
      await api.put(`/admin/users/${id}`, { isActive: !current });
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: !current } : u));
      toast('User updated', 'success');
    } catch (e) {}
  };

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const chartData = stats?.monthlyRevenue?.map(m => ({
    name: MONTHS[m._id.month - 1],
    revenue: Math.round(m.revenue),
    orders: m.count
  })) || [];

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 32, paddingBottom: 64 }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 28 }}>Admin Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>Platform overview & management</p>
        </div>

        <div className="dash-tabs">
          {TABS.map(t => <button key={t} className={`dash-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>)}
        </div>

        {loading ? <Loader /> : (
          <>
            {/* OVERVIEW */}
            {tab === 'Overview' && stats && (
              <div className="animate-in">
                <div className="grid-4" style={{ marginBottom: 32 }}>
                  {[
                    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'var(--brand)' },
                    { label: 'Restaurants', value: stats.totalRestaurants, icon: Store, color: 'var(--success)' },
                    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'var(--warning)' },
                    { label: 'Total Revenue', value: `$${stats.totalRevenue?.toFixed(0)}`, icon: DollarSign, color: 'var(--accent)' },
                  ].map(s => (
                    <div key={s.label} className="card stat-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{s.label}</p>
                        <s.icon size={20} color={s.color} />
                      </div>
                      <p style={{ fontSize: 30, fontWeight: 800, fontFamily: 'Syne', color: s.color }}>{s.value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid-2" style={{ marginBottom: 24 }}>
                  <div className="card" style={{ padding: 24 }}>
                    <h3 style={{ fontFamily: 'Syne', fontWeight: 700, marginBottom: 20, fontSize: 16 }}>Monthly Revenue</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={chartData}>
                        <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                        <YAxis stroke="var(--text-muted)" fontSize={12} />
                        <Tooltip contentStyle={{ background: 'var(--dark2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }} />
                        <Bar dataKey="revenue" fill="var(--brand)" radius={[6,6,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="card" style={{ padding: 24 }}>
                    <h3 style={{ fontFamily: 'Syne', fontWeight: 700, marginBottom: 20, fontSize: 16 }}>Monthly Orders</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={chartData}>
                        <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                        <YAxis stroke="var(--text-muted)" fontSize={12} />
                        <Tooltip contentStyle={{ background: 'var(--dark2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }} />
                        <Line type="monotone" dataKey="orders" stroke="var(--accent)" strokeWidth={2} dot={{ fill: 'var(--accent)', r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid-2">
                  <div className="card" style={{ padding: 20 }}>
                    <p style={{ fontWeight: 700, marginBottom: 4 }}>Today's Orders</p>
                    <p style={{ fontSize: 32, fontWeight: 800, color: 'var(--brand)', fontFamily: 'Syne' }}>{stats.todayOrders}</p>
                  </div>
                  <div className="card" style={{ padding: 20 }}>
                    <p style={{ fontWeight: 700, marginBottom: 4 }}>Pending Approvals</p>
                    <p style={{ fontSize: 32, fontWeight: 800, color: 'var(--warning)', fontFamily: 'Syne' }}>{stats.pendingRestaurants}</p>
                  </div>
                </div>
              </div>
            )}

            {/* RESTAURANTS */}
            {tab === 'Restaurants' && (
              <div className="animate-in">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {restaurants.map(r => (
                    <div key={r._id} className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                      <img src={r.image} alt="" style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                          <p style={{ fontWeight: 700 }}>{r.name}</p>
                          <span className={`badge ${r.isApproved ? 'badge-success' : 'badge-warning'}`}>{r.isApproved ? 'Approved' : 'Pending'}</span>
                          <span className={`badge ${r.isOpen ? 'badge-brand' : 'badge-muted'}`}>{r.isOpen ? 'Open' : 'Closed'}</span>
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{r.cuisine} · {r.address} · Owner: {r.owner?.name}</p>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {!r.isApproved && (
                          <button className="btn btn-primary btn-sm" onClick={() => approveRestaurant(r._id)}>
                            <CheckCircle size={14} /> Approve
                          </button>
                        )}
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>⭐{r.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* USERS */}
            {tab === 'Users' && (
              <div className="animate-in">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {users.map(u => (
                    <div key={u._id} className="card" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ width: 40, height: 40, background: 'var(--brand)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                        {u.name?.[0]}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600 }}>{u.name}</p>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{u.email} · {u.phone}</p>
                      </div>
                      <span className={`badge badge-muted`}>{u.role}</span>
                      <span className={`badge ${u.isActive ? 'badge-success' : 'badge-error'}`}>{u.isActive ? 'Active' : 'Banned'}</span>
                      <button className="btn btn-ghost btn-sm" style={{ color: u.isActive ? 'var(--error)' : 'var(--success)' }} onClick={() => toggleUser(u._id, u.isActive)}>
                        {u.isActive ? <X size={15} /> : <CheckCircle size={15} />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ORDERS */}
            {tab === 'Orders' && (
              <div className="animate-in">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {orders.map(o => (
                    <div key={o._id} className="card" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                          <p style={{ fontWeight: 600 }}>{o.customer?.name}</p>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>→ {o.restaurant?.name}</span>
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{new Date(o.createdAt).toLocaleString()} · {o.items?.length} items</p>
                      </div>
                      <span style={{ fontWeight: 700, color: 'var(--brand)' }}>${o.total?.toFixed(2)}</span>
                      <StatusBadge status={o.status} />
                      <StatusBadge status={o.paymentStatus} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
