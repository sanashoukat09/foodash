import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, MapPin, Banknote, Clock, ShieldCheck, Plus, Minus } from 'lucide-react';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import './Cart.css';

export default function Cart() {
  const { items, restaurantId, restaurantName, subtotal, deliveryFee, tax, total, removeItem, addItem, clearCart } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [address, setAddress] = useState(user?.address || '');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async () => {
    if (!address.trim()) {
      toast('Please enter your delivery address', 'error');
      return;
    }
    if (items.length === 0) {
      toast('Your cart is empty', 'error');
      return;
    }
    try {
      setLoading(true);
      const orderItems = items.map(i => ({
        menuItem: i._id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        image: i.image,
      }));

      const { data: order } = await api.post('/orders', {
        restaurantId,
        items: orderItems,
        deliveryAddress: address,
        specialInstructions: note,
        subtotal,
        deliveryFee,
        tax,
        total,
        paymentMethod: 'cash_on_delivery',
      });

      // Mark order as confirmed immediately for COD
      await api.put(`/orders/${order._id}/status`, {
        status: 'confirmed',
        note: 'Cash on delivery order confirmed',
      });

      clearCart();
      toast('Order placed! Pay cash on delivery 💵', 'success');
      navigate(`/order/${order._id}`);
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to place order', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) return (
    <div className="page">
      <div className="container" style={{ textAlign: 'center', paddingTop: 100 }}>
        <p style={{ fontSize: 64, marginBottom: 20 }}>🛒</p>
        <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 28, marginBottom: 12 }}>Your cart is empty</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>Add some delicious items to get started</p>
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/restaurants')}>Browse Restaurants</button>
      </div>
    </div>
  );

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 64 }}>
        <h1 className="section-title">Your Cart</h1>
        <p className="section-sub">From <strong style={{ color: 'var(--brand)' }}>{restaurantName}</strong></p>

        <div className="cart-layout">
          {/* LEFT COLUMN */}
          <div>

            {/* Order Items */}
            <div className="card" style={{ padding: 24, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 17 }}>Order Items</h3>
                <button className="btn btn-ghost btn-sm" onClick={clearCart} style={{ color: 'var(--error)' }}>
                  <Trash2 size={14} /> Clear cart
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {items.map(item => (
                  <div key={item._id} style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{ width: 72, height: 72, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, marginBottom: 4 }}>{item.name}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>${item.price.toFixed(2)} each</p>
                    </div>
                    {/* Qty controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface)', borderRadius: 99, padding: '6px 12px' }}>
                      <button
                        onClick={() => removeItem(item._id)}
                        style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', display: 'flex' }}
                      >
                        <Minus size={14} />
                      </button>
                      <span style={{ fontWeight: 700, minWidth: 16, textAlign: 'center' }}>{item.quantity}</span>
                      <button
                        onClick={() => addItem(item, restaurantId, restaurantName, deliveryFee)}
                        style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', display: 'flex' }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <p style={{ fontWeight: 700, color: 'var(--brand)', fontSize: 16, minWidth: 60, textAlign: 'right' }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="card" style={{ padding: 24, marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'Syne', fontWeight: 700, marginBottom: 16, fontSize: 17 }}>
                <MapPin size={17} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                Delivery Address
              </h3>
              <textarea
                className="input"
                placeholder="Enter your full delivery address (street, city, zip)..."
                rows={3}
                value={address}
                onChange={e => setAddress(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Special Instructions */}
            <div className="card" style={{ padding: 24, marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'Syne', fontWeight: 700, marginBottom: 16, fontSize: 17 }}>
                📝 Special Instructions <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 13 }}>(optional)</span>
              </h3>
              <textarea
                className="input"
                placeholder="E.g. No onions, extra sauce, ring the bell..."
                rows={2}
                value={note}
                onChange={e => setNote(e.target.value)}
                style={{ resize: 'none' }}
              />
            </div>

            {/* Payment Method — COD */}
            <div className="card" style={{ padding: 24, marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'Syne', fontWeight: 700, marginBottom: 16, fontSize: 17 }}>
                💳 Payment Method
              </h3>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '18px 20px',
                background: 'rgba(34,197,94,0.06)',
                border: '2px solid var(--success)',
                borderRadius: 'var(--radius)',
              }}>
                <div style={{
                  width: 48, height: 48, background: 'rgba(34,197,94,0.15)',
                  borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <Banknote size={24} color="var(--success)" />
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 16 }}>Cash on Delivery</p>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                    Pay with cash when your order arrives at your door
                  </p>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <span className="badge badge-success">✓ Selected</span>
                </div>
              </div>

              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 14,
                padding: '12px 16px', background: 'var(--dark3)', borderRadius: 10,
              }}>
                <ShieldCheck size={16} color="var(--success)" style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Please have the exact amount of <strong style={{ color: 'var(--text)' }}>${total.toFixed(2)}</strong> ready when the driver arrives. Drivers may not carry change.
                </p>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              className="btn btn-primary btn-full btn-lg"
              onClick={handlePlaceOrder}
              disabled={loading}
              style={{ fontSize: 16, height: 56 }}
            >
              {loading ? (
                <>
                  <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} className="spinner" />
                  Placing Order...
                </>
              ) : (
                <>🛵 Place Order — ${total.toFixed(2)}</>
              )}
            </button>
          </div>

          {/* RIGHT COLUMN — Order Summary */}
          <div>
            <div className="card" style={{ padding: 24, position: 'sticky', top: 80 }}>
              <h3 style={{ fontFamily: 'Syne', fontWeight: 800, marginBottom: 20 }}>Order Summary</h3>

              {/* Item list mini */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {items.map(item => (
                  <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-muted)' }}>
                    <span>{item.quantity}× {item.name}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  ['Subtotal', `$${subtotal.toFixed(2)}`],
                  ['Delivery Fee', `$${deliveryFee.toFixed(2)}`],
                  ['Tax (8%)', `$${tax.toFixed(2)}`],
                ].map(([label, val]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--text-muted)' }}>
                    <span>{label}</span><span>{val}</span>
                  </div>
                ))}
                <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 20 }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--brand)' }}>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Info boxes */}
              <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ padding: '12px 14px', background: 'rgba(34,197,94,0.08)', borderRadius: 10, border: '1px solid rgba(34,197,94,0.2)' }}>
                  <p style={{ fontSize: 13, color: 'var(--success)', fontWeight: 600 }}>
                    <Clock size={13} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                    Estimated delivery: 30–45 min
                  </p>
                </div>
                <div style={{ padding: '12px 14px', background: 'rgba(255,184,0,0.08)', borderRadius: 10, border: '1px solid rgba(255,184,0,0.2)' }}>
                  <p style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>
                    💵 Pay cash at the door
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                    No card needed — just have cash ready!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}