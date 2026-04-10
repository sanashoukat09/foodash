import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { CheckCircle, Clock, ChefHat, Bike, Home, Package, MessageCircle, Send, Star } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { Loader, StatusBadge } from '../components/common';

const STEPS = [
  { key: 'pending',   label: 'Order Placed', icon: Package },
  { key: 'confirmed', label: 'Confirmed',    icon: CheckCircle },
  { key: 'preparing', label: 'Preparing',    icon: ChefHat },
  { key: 'ready',     label: 'Ready',        icon: Clock },
  { key: 'picked_up', label: 'On the Way',   icon: Bike },
  { key: 'delivered', label: 'Delivered',    icon: Home },
];

export default function OrderTracking() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewed, setReviewed] = useState(false);
  const socketRef = useRef(null);
  const msgEndRef = useRef(null);

  useEffect(() => {
    fetchOrder();
    const socket = io('/', { transports: ['websocket'] });
    socketRef.current = socket;
    socket.emit('track_order', id);
    if (user?._id) socket.emit('join_customer', user._id);
    socket.on('order_updated', (updated) => {
      if (updated._id === id) { setOrder(updated); toast('Order status updated!', 'info'); }
    });
    socket.on('receive_message', (msg) => {
      setMessages(prev => [...prev, msg]);
      setTimeout(() => msgEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    return () => socket.disconnect();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const { data } = await api.get(`/orders/${id}`);
      setOrder(data);
    } catch { toast('Order not found', 'error'); }
    finally { setLoading(false); }
  };

  const sendMessage = () => {
    if (!msgInput.trim()) return;
    socketRef.current?.emit('send_message', { orderId: id, message: msgInput, senderId: user._id, senderName: user.name });
    setMessages(prev => [...prev, { message: msgInput, senderName: 'You', senderId: user._id, time: new Date() }]);
    setMsgInput('');
  };

  const submitReview = async () => {
    try {
      await api.post('/reviews', { restaurantId: order.restaurant._id, orderId: id, ...reviewForm });
      setReviewed(true);
      toast('Review submitted! ⭐', 'success');
    } catch (err) { toast(err.response?.data?.message || 'Failed to submit review', 'error'); }
  };

  if (loading) return <div className="page"><Loader text="Loading your order..." /></div>;
  if (!order) return <div className="page"><div className="container" style={{textAlign:'center',paddingTop:80}}><p>Order not found</p></div></div>;

  const currentStep = STEPS.findIndex(s => s.key === order.status);

  return (
    <div className="page">
      <div className="container animate-in" style={{paddingTop:40,paddingBottom:60}}>
        {/* Header */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:32,flexWrap:'wrap',gap:12}}>
          <div>
            <h1 className="section-title">Live Order Tracking</h1>
            <p style={{color:'var(--text-muted)',fontSize:14,fontFamily:'monospace'}}>#{order._id?.slice(-8).toUpperCase()}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* Step Tracker */}
        <div className="card" style={{padding:'32px 24px',marginBottom:24}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',position:'relative'}}>
            <div style={{position:'absolute',top:20,left:'5%',right:'5%',height:2,background:'var(--border)',zIndex:0}} />
            <div style={{position:'absolute',top:20,left:'5%',height:2,background:'var(--brand)',zIndex:1,width:`${Math.max(0,currentStep/(STEPS.length-1)*90)}%`,transition:'width 0.6s ease'}} />
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const done = i <= currentStep;
              return (
                <div key={step.key} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8,zIndex:2,flex:1}}>
                  <div style={{
                    width:40,height:40,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',
                    background: done ? 'var(--brand)' : 'var(--dark3)',
                    border: `2px solid ${done ? 'var(--brand)' : 'var(--border)'}`,
                    transition:'all 0.3s',
                    boxShadow: i===currentStep ? '0 0 0 6px rgba(255,69,0,0.2)' : 'none'
                  }}>
                    <Icon size={16} color={done?'white':'var(--text-dim)'} />
                  </div>
                  <span style={{fontSize:11,color:done?'var(--text)':'var(--text-dim)',fontWeight:done?600:400,textAlign:'center'}}>{step.label}</span>
                </div>
              );
            })}
          </div>
          {order.status !== 'delivered' && order.status !== 'cancelled' && (
            <div style={{marginTop:24,padding:'12px 20px',background:'rgba(255,184,0,0.08)',border:'1px solid rgba(255,184,0,0.2)',borderRadius:10,display:'flex',alignItems:'center',gap:10,fontSize:14}}>
              <Clock size={16} color="var(--accent)" />
              <span>Estimated delivery: <strong>{order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) : '~45 min'}</strong></span>
            </div>
          )}
          {order.status === 'delivered' && (
            <div style={{marginTop:24,padding:'12px 20px',background:'rgba(34,197,94,0.08)',border:'1px solid rgba(34,197,94,0.2)',borderRadius:10,display:'flex',alignItems:'center',gap:10,fontSize:14}}>
              <CheckCircle size={16} color="var(--success)" />
              <span style={{color:'var(--success)'}}>🎉 Your order has been delivered! Enjoy your meal.</span>
            </div>
          )}
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 360px',gap:24,alignItems:'start'}}>
          {/* Left */}
          <div style={{display:'flex',flexDirection:'column',gap:20}}>
            {/* Items */}
            <div className="card" style={{padding:24}}>
              <h3 style={{fontFamily:'Syne',fontWeight:700,marginBottom:16}}>Order from {order.restaurant?.name}</h3>
              <div style={{display:'flex',flexDirection:'column',gap:12,marginBottom:16}}>
                {order.items?.map((item,i) => (
                  <div key={i} style={{display:'flex',gap:14,alignItems:'center'}}>
                    {item.image && <img src={item.image} alt={item.name} style={{width:56,height:56,borderRadius:10,objectFit:'cover',flexShrink:0}} />}
                    <div style={{flex:1}}>
                      <p style={{fontWeight:600,fontSize:14}}>{item.quantity}× {item.name}</p>
                      <p style={{color:'var(--text-muted)',fontSize:13}}>${item.price.toFixed(2)} each</p>
                    </div>
                    <p style={{fontWeight:700,color:'var(--brand)'}}>${(item.price*item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div style={{borderTop:'1px solid var(--border)',paddingTop:14,display:'flex',justifyContent:'space-between',fontWeight:700,fontSize:16}}>
                <span>Total</span><span style={{color:'var(--brand)'}}>${order.total?.toFixed(2)}</span>
              </div>
            </div>

            {/* Driver info */}
            {order.driver && (
              <div className="card" style={{padding:24}}>
                <h3 style={{fontFamily:'Syne',fontWeight:700,marginBottom:14}}>🛵 Your Driver</h3>
                <div style={{display:'flex',alignItems:'center',gap:14}}>
                  <div style={{width:52,height:52,background:'var(--brand)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,fontWeight:700,color:'white'}}>
                    {order.driver.name?.[0]}
                  </div>
                  <div>
                    <p style={{fontWeight:600,fontSize:16}}>{order.driver.name}</p>
                    <p style={{color:'var(--text-muted)',fontSize:13}}>{order.driver.phone || 'Contact via chat below'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Review form (after delivery) */}
            {order.status === 'delivered' && !reviewed && (
              <div className="card" style={{padding:24}}>
                <h3 style={{fontFamily:'Syne',fontWeight:700,marginBottom:16}}>⭐ Rate Your Experience</h3>
                <div style={{display:'flex',gap:8,marginBottom:16}}>
                  {[1,2,3,4,5].map(s => (
                    <button key={s} onClick={() => setReviewForm(prev=>({...prev,rating:s}))}
                      style={{fontSize:28,background:'none',border:'none',cursor:'pointer',color:s<=reviewForm.rating?'var(--accent)':'var(--surface)',transition:'color 0.2s'}}>★</button>
                  ))}
                </div>
                <textarea className="input" rows={3} placeholder="How was your food and delivery experience?"
                  value={reviewForm.comment} onChange={e => setReviewForm(prev=>({...prev,comment:e.target.value}))}
                  style={{resize:'none',marginBottom:12}} />
                <button className="btn btn-primary" onClick={submitReview}>Submit Review</button>
              </div>
            )}
            {reviewed && <div className="card" style={{padding:20,textAlign:'center',color:'var(--success)'}}>✅ Thanks for your review!</div>}
          </div>

          {/* Right */}
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            {/* Status History */}
            <div className="card" style={{padding:20}}>
              <h4 style={{fontFamily:'Syne',fontWeight:700,marginBottom:16}}>Status Timeline</h4>
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                {order.statusHistory?.slice().reverse().map((h,i) => (
                  <div key={i} style={{display:'flex',gap:12,fontSize:13}}>
                    <div style={{width:8,height:8,borderRadius:'50%',background:i===0?'var(--brand)':'var(--border)',marginTop:5,flexShrink:0}} />
                    <div>
                      <p style={{fontWeight:600,textTransform:'capitalize'}}>{h.status?.replace('_',' ')}</p>
                      {h.note && <p style={{color:'var(--text-muted)',fontSize:12}}>{h.note}</p>}
                      <p style={{color:'var(--text-dim)',fontSize:11}}>{new Date(h.time).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Chat */}
            <div className="card" style={{overflow:'hidden'}}>
              <div onClick={() => setChatOpen(!chatOpen)}
                style={{padding:'14px 20px',borderBottom:chatOpen?'1px solid var(--border)':'none',cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div style={{display:'flex',alignItems:'center',gap:10,fontWeight:700,fontSize:14}}>
                  <MessageCircle size={16} color="var(--brand)" /> Live Chat
                  {messages.length>0 && <span className="badge badge-brand">{messages.length}</span>}
                </div>
                <span style={{fontSize:12,color:'var(--text-muted)'}}>{chatOpen?'▲':'▼'}</span>
              </div>
              {chatOpen && (
                <>
                  <div style={{height:200,overflowY:'auto',padding:16,display:'flex',flexDirection:'column',gap:8}}>
                    {messages.length===0 && <p style={{color:'var(--text-muted)',fontSize:13,textAlign:'center',margin:'auto'}}>No messages yet</p>}
                    {messages.map((m,i) => (
                      <div key={i} style={{display:'flex',justifyContent:m.senderId===user?._id?'flex-end':'flex-start'}}>
                        <div style={{background:m.senderId===user?._id?'var(--brand)':'var(--surface)',padding:'8px 12px',borderRadius:12,maxWidth:'80%',fontSize:13}}>
                          {m.senderId!==user?._id && <p style={{fontSize:10,opacity:0.7,marginBottom:2}}>{m.senderName}</p>}
                          {m.message}
                        </div>
                      </div>
                    ))}
                    <div ref={msgEndRef} />
                  </div>
                  <div style={{padding:10,borderTop:'1px solid var(--border)',display:'flex',gap:8}}>
                    <input className="input" style={{padding:'9px 12px',fontSize:13}} placeholder="Message..."
                      value={msgInput} onChange={e=>setMsgInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendMessage()} />
                    <button className="btn btn-primary btn-sm" onClick={sendMessage}><Send size={13}/></button>
                  </div>
                </>
              )}
            </div>

            <div className="card" style={{padding:16}}>
              <p style={{fontSize:13,color:'var(--text-muted)',marginBottom:6}}>📍 Delivering to:</p>
              <p style={{fontSize:14,fontWeight:600}}>{order.deliveryAddress}</p>
            </div>

            <Link to="/orders" className="btn btn-secondary btn-full">View All Orders</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
