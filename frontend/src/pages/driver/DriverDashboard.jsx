import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bike, ToggleLeft, ToggleRight, MapPin, Phone, Package, DollarSign, CheckCircle } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import { Loader } from '../../components/common';
import '../restaurant/RestaurantDashboard.css';

export default function DriverDashboard() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [available, setAvailable] = useState(user?.isAvailable || false);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Available');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [avail, mine, statsRes] = await Promise.all([
        api.get('/drivers/available-orders'),
        api.get('/orders'),
        api.get('/drivers/my-stats'),
      ]);
      setAvailableOrders(avail.data || []);
      setMyOrders(mine.data.orders || []);
      setStats(statsRes.data || {});
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const toggleAvailability = async () => {
    try {
      const { data } = await api.put('/drivers/toggle-availability');
      setAvailable(data.isAvailable);
      updateUser(data);
      toast(data.isAvailable ? 'You are now available for deliveries' : 'You are now offline', data.isAvailable ? 'success' : 'info');
    } catch (e) { toast('Failed to update availability', 'error'); }
  };

  const acceptOrder = async (orderId) => {
    try {
      await api.put(`/orders/${orderId}/assign-driver`);
      toast('Order accepted! Head to the restaurant.', 'success');
      fetchAll();
    } catch (e) { toast('Failed to accept order', 'error'); }
  };

  const updateStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      fetchAll();
      toast('Status updated!', 'success');
    } catch (e) { toast('Error updating status', 'error'); }
  };

  if (loading) return <div className="page"><Loader text="Loading driver panel..." /></div>;

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 32, paddingBottom: 64 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 26 }}>Driver Panel</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>Welcome back, {user?.name}</p>
          </div>
          <button className={`btn ${available ? 'btn-primary' : 'btn-secondary'} btn-lg`} onClick={toggleAvailability} style={{ gap: 10 }}>
            {available ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
            {available ? 'Online' : 'Go Online'}
          </button>
        </div>

        {/* Stats */}
        <div className="grid-3" style={{ marginBottom: 32 }}>
          {[
            { label: "Today's Deliveries", value: stats.todayDeliveries || 0, icon: Bike, color: 'var(--brand)' },
            { label: 'Total Deliveries', value: stats.totalDeliveries || 0, icon: Package, color: 'var(--success)' },
            { label: 'Total Earnings', value: `$${stats.earnings?.toFixed(0) || 0}`, icon: DollarSign, color: 'var(--accent)' },
          ].map(s => (
            <div key={s.label} className="card stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{s.label}</p>
                <s.icon size={20} color={s.color} />
              </div>
              <p style={{ fontSize: 30, fontWeight: 800, fontFamily: 'Syne', color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="dash-tabs">
          {['Available', 'My Deliveries'].map(t => (
            <button key={t} className={`dash-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>

        {/* Available Orders */}
        {tab === 'Available' && (
          <div className="animate-in">
            {!available && (
              <div style={{ padding: 24, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 12, marginBottom: 24, textAlign: 'center' }}>
                <p style={{ color: 'var(--warning)', fontWeight: 600 }}>⚠️ You are offline. Go online to see available orders.</p>
              </div>
            )}
            {availableOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                <Bike size={48} style={{ margin: '0 auto 16px', display: 'block', color: 'var(--text-dim)' }} />
                <p style={{ fontSize: 16, fontWeight: 600 }}>No orders available right now</p>
                <p style={{ fontSize: 14, marginTop: 8 }}>Check back soon</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {availableOrders.map(order => (
                  <div key={order._id} className="card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                        <img src={order.restaurant?.image} alt="" style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'cover' }} />
                        <div>
                          <p style={{ fontWeight: 700, fontSize: 15 }}>{order.restaurant?.name}</p>
                          <p style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                            <MapPin size={12} /> {order.restaurant?.address}
                          </p>
                        </div>
                      </div>
                      <p style={{ fontWeight: 800, color: 'var(--brand)', fontSize: 18 }}>${order.total?.toFixed(2)}</p>
                    </div>
                    <div style={{ padding: '14px', background: 'var(--dark3)', borderRadius: 10, marginBottom: 14 }}>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>DELIVER TO</p>
                      <p style={{ fontSize: 14, display: 'flex', gap: 6 }}><MapPin size={14} style={{ color: 'var(--brand)', flexShrink: 0, marginTop: 2 }} />{order.deliveryAddress}</p>
                      {order.customer?.phone && <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8, display: 'flex', gap: 6 }}><Phone size={13} />{order.customer.phone}</p>}
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>{order.items?.map(i => `${i.quantity}× ${i.name}`).join(', ')}</p>
                    <button className="btn btn-primary btn-full" onClick={() => acceptOrder(order._id)}>
                      <Bike size={16} /> Accept Delivery
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Deliveries */}
        {tab === 'My Deliveries' && (
          <div className="animate-in">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {myOrders.map(order => (
                <div key={order._id} className="card" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <p style={{ fontWeight: 700 }}>{order.restaurant?.name}</p>
                    <span className={`badge ${order.status === 'delivered' ? 'badge-success' : order.status === 'cancelled' ? 'badge-error' : 'badge-brand'}`}>
                      {order.status}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>📍 {order.deliveryAddress}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: 'var(--brand)' }}>${order.total?.toFixed(2)}</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {order.status === 'picked_up' && (
                        <button className="btn btn-primary btn-sm" onClick={() => updateStatus(order._id, 'delivered')}>
                          <CheckCircle size={14} /> Mark Delivered
                        </button>
                      )}
                      <Link to={`/order/${order._id}`} className="btn btn-secondary btn-sm">View</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
