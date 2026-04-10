import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Bell, TrendingUp, ShoppingBag, DollarSign, Star } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import { Loader, StatusBadge } from '../../components/common';
import './RestaurantDashboard.css';

const TABS = ['Overview', 'Orders', 'Menu', 'Settings'];

export default function RestaurantDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const socketRef = useRef(null);
  const [tab, setTab] = useState('Overview');
  const [restaurant, setRestaurant] = useState(null);
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '', category: '', image: '', isVeg: false, spiceLevel: 'mild', calories: '' });
  const [editItem, setEditItem] = useState(null);
  const [newOrders, setNewOrders] = useState([]);

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (!restaurant) return;
    const socket = io(window.location.origin);
    socketRef.current = socket;
    socket.emit('join_restaurant', restaurant._id);
    socket.on('new_order', (order) => {
      setOrders(prev => [order, ...prev]);
      setNewOrders(prev => [...prev, order._id]);
      toast(`New order from ${order.customer?.name}! 🔔`, 'success');
    });
    return () => socket.disconnect();
  }, [restaurant]);

  const fetchAll = async () => {
    try {
      const [restRes, ordersRes] = await Promise.all([
        api.get('/restaurants/owner/me'),
        api.get('/orders')
      ]);
      setRestaurant(restRes.data);
      setOrders(ordersRes.data.orders || []);
      if (restRes.data?._id) {
        const menuRes = await api.get(`/menu/${restRes.data._id}`);
        setMenuItems(menuRes.data.items || []);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
      setNewOrders(prev => prev.filter(id => id !== orderId));
      toast(`Order status updated to ${status}`, 'success');
    } catch (e) { toast('Failed to update status', 'error'); }
  };

  const addMenuItem = async () => {
    if (!newItem.name || !newItem.price || !newItem.category) { toast('Fill in required fields', 'error'); return; }
    try {
      const { data } = await api.post('/menu', { ...newItem, price: parseFloat(newItem.price), calories: newItem.calories ? parseInt(newItem.calories) : undefined });
      setMenuItems(prev => [...prev, data]);
      setNewItem({ name: '', description: '', price: '', category: '', image: '', isVeg: false, spiceLevel: 'mild', calories: '' });
      toast('Menu item added!', 'success');
    } catch (e) { toast('Failed to add item', 'error'); }
  };

  const deleteMenuItem = async (id) => {
    try {
      await api.delete(`/menu/${id}`);
      setMenuItems(prev => prev.filter(i => i._id !== id));
      toast('Item removed', 'success');
    } catch (e) { toast('Failed to delete', 'error'); }
  };

  const toggleOpen = async () => {
    try {
      const { data } = await api.put(`/restaurants/${restaurant._id}`, { isOpen: !restaurant.isOpen });
      setRestaurant(data);
      toast(data.isOpen ? 'Restaurant is now Open' : 'Restaurant is now Closed', data.isOpen ? 'success' : 'info');
    } catch (e) {}
  };

  if (loading) return <div className="page"><Loader text="Loading dashboard..." /></div>;

  const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString());
  const revenue = orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.total, 0);
  const pendingCount = orders.filter(o => ['pending','confirmed','preparing'].includes(o.status)).length;

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 32, paddingBottom: 64 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 26 }}>{restaurant?.name || 'My Restaurant'}</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>{restaurant?.cuisine} · {restaurant?.address}</p>
          </div>
          <div style={{ display: 'flex', align: 'center', gap: 12 }}>
            {!restaurant?.isApproved && <span className="badge badge-warning">Pending Approval</span>}
            <button className={`btn ${restaurant?.isOpen ? 'btn-outline' : 'btn-primary'}`} onClick={toggleOpen} style={{ gap: 8 }}>
              {restaurant?.isOpen ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
              {restaurant?.isOpen ? 'Open' : 'Closed'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="dash-tabs">
          {TABS.map(t => <button key={t} className={`dash-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>)}
        </div>

        {/* OVERVIEW */}
        {tab === 'Overview' && (
          <div className="animate-in">
            <div className="grid-4" style={{ marginBottom: 32 }}>
              {[
                { label: "Today's Orders", value: todayOrders.length, icon: ShoppingBag, color: 'var(--brand)' },
                { label: 'Total Revenue', value: `$${revenue.toFixed(0)}`, icon: DollarSign, color: 'var(--success)' },
                { label: 'Pending Orders', value: pendingCount, icon: Bell, color: 'var(--warning)' },
                { label: 'Rating', value: restaurant?.rating || 'N/A', icon: Star, color: 'var(--accent)' },
              ].map(s => (
                <div key={s.label} className="card stat-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{s.label}</p>
                    <s.icon size={20} color={s.color} />
                  </div>
                  <p style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Syne', color: s.color }}>{s.value}</p>
                </div>
              ))}
            </div>

            <h3 style={{ fontFamily: 'Syne', fontWeight: 700, marginBottom: 16 }}>Recent Orders</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {orders.slice(0, 5).map(o => (
                <div key={o._id} className={`card order-item ${newOrders.includes(o._id) ? 'new-order' : ''}`} style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontWeight: 600 }}>{o.customer?.name} {newOrders.includes(o._id) && <span className="badge badge-brand" style={{ marginLeft: 8 }}>New!</span>}</p>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{o.items?.map(i => i.name).join(', ')}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: 700, color: 'var(--brand)' }}>${o.total?.toFixed(2)}</p>
                      <StatusBadge status={o.status} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ORDERS */}
        {tab === 'Orders' && (
          <div className="animate-in">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {orders.map(o => (
                <div key={o._id} className={`card ${newOrders.includes(o._id) ? 'new-order' : ''}`} style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <p style={{ fontWeight: 700 }}>{o.customer?.name} <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>· {o.customer?.phone}</span></p>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{new Date(o.createdAt).toLocaleString()}</p>
                      <p style={{ fontSize: 13, marginTop: 6 }}>{o.items?.map(i => `${i.quantity}× ${i.name}`).join(' · ')}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: 700, color: 'var(--brand)', fontSize: 18 }}>${o.total?.toFixed(2)}</p>
                      <StatusBadge status={o.status} />
                    </div>
                  </div>
                  {['pending', 'confirmed', 'preparing'].includes(o.status) && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                      {o.status === 'pending' && <button className="btn btn-primary btn-sm" onClick={() => updateOrderStatus(o._id, 'confirmed')}>✅ Accept</button>}
                      {o.status === 'confirmed' && <button className="btn btn-primary btn-sm" onClick={() => updateOrderStatus(o._id, 'preparing')}>👨‍🍳 Start Cooking</button>}
                      {o.status === 'preparing' && <button className="btn btn-primary btn-sm" onClick={() => updateOrderStatus(o._id, 'ready')}>🍽️ Mark Ready</button>}
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--error)' }} onClick={() => updateOrderStatus(o._id, 'cancelled')}>✗ Cancel</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MENU */}
        {tab === 'Menu' && (
          <div className="animate-in">
            <div className="card" style={{ padding: 24, marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'Syne', fontWeight: 700, marginBottom: 20 }}>Add Menu Item</h3>
              <div className="grid-2" style={{ marginBottom: 12 }}>
                <input className="input" placeholder="Item name *" value={newItem.name} onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))} />
                <input className="input" placeholder="Category * (e.g. Burgers)" value={newItem.category} onChange={e => setNewItem(p => ({ ...p, category: e.target.value }))} />
              </div>
              <textarea className="input" placeholder="Description" rows={2} value={newItem.description} onChange={e => setNewItem(p => ({ ...p, description: e.target.value }))} style={{ marginBottom: 12, resize: 'none' }} />
              <div className="grid-4" style={{ marginBottom: 12 }}>
                <input className="input" placeholder="Price ($) *" type="number" value={newItem.price} onChange={e => setNewItem(p => ({ ...p, price: e.target.value }))} />
                <input className="input" placeholder="Calories" type="number" value={newItem.calories} onChange={e => setNewItem(p => ({ ...p, calories: e.target.value }))} />
                <select className="input" value={newItem.spiceLevel} onChange={e => setNewItem(p => ({ ...p, spiceLevel: e.target.value }))}>
                  {['mild','medium','hot','extra-hot'].map(s => <option key={s}>{s}</option>)}
                </select>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
                  <input type="checkbox" checked={newItem.isVeg} onChange={e => setNewItem(p => ({ ...p, isVeg: e.target.checked }))} />
                  Vegetarian
                </label>
              </div>
              <input className="input" placeholder="Image URL (optional)" value={newItem.image} onChange={e => setNewItem(p => ({ ...p, image: e.target.value }))} style={{ marginBottom: 16 }} />
              <button className="btn btn-primary" onClick={addMenuItem}><Plus size={16} /> Add Item</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {menuItems.map(item => (
                <div key={item._id} className="card" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <img src={item.image} alt={item.name} style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600 }}>{item.name} <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>· {item.category}</span></p>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{item.description}</p>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--brand)', fontSize: 16 }}>${item.price}</span>
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--error)' }} onClick={() => deleteMenuItem(item._id)}>
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {tab === 'Settings' && (
          <div className="animate-in">
            {!restaurant ? (
              <RegisterRestaurant onCreated={r => setRestaurant(r)} />
            ) : (
              <div className="card" style={{ padding: 32, maxWidth: 600 }}>
                <h3 style={{ fontFamily: 'Syne', fontWeight: 700, marginBottom: 24 }}>Restaurant Settings</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[['Restaurant Name', 'name'], ['Description', 'description'], ['Cuisine', 'cuisine'], ['Address', 'address'], ['Phone', 'phone'], ['Delivery Time', 'deliveryTime']].map(([label, key]) => (
                    <div key={key}>
                      <label style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>{label}</label>
                      <input className="input" value={restaurant[key] || ''} onChange={e => setRestaurant(p => ({ ...p, [key]: e.target.value }))} />
                    </div>
                  ))}
                  <button className="btn btn-primary" onClick={async () => {
                    await api.put(`/restaurants/${restaurant._id}`, restaurant);
                    toast('Settings saved!', 'success');
                  }}>Save Changes</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function RegisterRestaurant({ onCreated }) {
  const toast = useToast();
  const [form, setForm] = useState({ name: '', cuisine: '', address: '', phone: '', deliveryFee: 2.99, minOrder: 10, deliveryTime: '30-45 min' });
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const submit = async () => {
    try {
      const { data } = await api.post('/restaurants', form);
      toast('Restaurant registered! Awaiting admin approval.', 'success');
      onCreated(data);
    } catch (e) { toast(e.response?.data?.message || 'Error', 'error'); }
  };
  return (
    <div className="card" style={{ padding: 32, maxWidth: 600 }}>
      <h3 style={{ fontFamily: 'Syne', fontWeight: 700, marginBottom: 24 }}>Register Your Restaurant</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[['Restaurant Name','name'],['Cuisine Type','cuisine'],['Address','address'],['Phone','phone'],['Delivery Time (e.g. 30-45 min)','deliveryTime']].map(([l,k]) => (
          <div key={k}><label style={{ fontSize:13,color:'var(--text-muted)',display:'block',marginBottom:6 }}>{l}</label><input className="input" value={form[k]} onChange={set(k)} /></div>
        ))}
        <div className="grid-2">
          <div><label style={{ fontSize:13,color:'var(--text-muted)',display:'block',marginBottom:6 }}>Delivery Fee ($)</label><input className="input" type="number" value={form.deliveryFee} onChange={set('deliveryFee')} /></div>
          <div><label style={{ fontSize:13,color:'var(--text-muted)',display:'block',marginBottom:6 }}>Min Order ($)</label><input className="input" type="number" value={form.minOrder} onChange={set('minOrder')} /></div>
        </div>
        <button className="btn btn-primary btn-lg" onClick={submit}>Register Restaurant</button>
      </div>
    </div>
  );
}
