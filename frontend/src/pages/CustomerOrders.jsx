import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ChevronRight, Star } from 'lucide-react';
import api from '../utils/api';
import { Loader, StatusBadge } from '../components/common';
import './CustomerOrders.css';

export default function CustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', foodRating: 5, deliveryRating: 5 });

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders');
      setOrders(data.orders || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const submitReview = async () => {
    try {
      await api.post('/reviews', {
        restaurantId: reviewModal.restaurant._id,
        orderId: reviewModal._id,
        ...reviewForm
      });
      setReviewModal(null);
      fetchOrders();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 64 }}>
        <h1 className="section-title">My Orders</h1>
        <p className="section-sub">Your full order history</p>

        {loading ? <Loader text="Loading orders..." /> : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: 48, marginBottom: 16 }}>📦</p>
            <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No orders yet</p>
            <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>Order Now</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {orders.map(order => (
              <div key={order._id} className="card order-row animate-in">
                <div className="order-row-left">
                  <img src={order.restaurant?.image} alt="" className="order-rest-img" />
                  <div>
                    <p className="order-rest-name">{order.restaurant?.name}</p>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0' }}>
                      {order.items?.map(i => `${i.quantity}× ${i.name}`).join(', ')}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12, color: 'var(--text-muted)' }}>
                      <span><Clock size={11} style={{ marginRight: 4, verticalAlign: 'middle' }} />{new Date(order.createdAt).toLocaleDateString()}</span>
                      <span style={{ fontWeight: 700, color: 'var(--brand)' }}>${order.total?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <div className="order-row-right">
                  <StatusBadge status={order.status} />
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <Link to={`/order/${order._id}`} className="btn btn-secondary btn-sm">
                      Track <ChevronRight size={13} />
                    </Link>
                    {order.status === 'delivered' && (
                      <button className="btn btn-outline btn-sm" onClick={() => setReviewModal(order)}>
                        <Star size={13} /> Review
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div className="modal-overlay" onClick={() => setReviewModal(null)}>
          <div className="modal-box card animate-in" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'Syne', fontWeight: 800, marginBottom: 6 }}>Leave a Review</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>{reviewModal.restaurant?.name}</p>

            {[['Overall Rating', 'rating'], ['Food Quality', 'foodRating'], ['Delivery', 'deliveryRating']].map(([label, key]) => (
              <div key={key} className="field" style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>{label}</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setReviewForm(p => ({ ...p, [key]: n }))}
                      style={{ fontSize: 28, background: 'none', border: 'none', cursor: 'pointer', color: n <= reviewForm[key] ? 'var(--accent)' : 'var(--surface)', transition: 'color 0.15s' }}>
                      ★
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>Comment (optional)</label>
              <textarea className="input" rows={3} placeholder="How was your experience?" value={reviewForm.comment}
                onChange={e => setReviewForm(p => ({ ...p, comment: e.target.value }))} style={{ resize: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary btn-full" onClick={() => setReviewModal(null)}>Cancel</button>
              <button className="btn btn-primary btn-full" onClick={submitReview}>Submit Review</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
