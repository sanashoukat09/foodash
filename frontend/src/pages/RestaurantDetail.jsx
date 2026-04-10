import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Clock, MapPin, Phone, Plus, Minus, ShoppingCart, Flame, Leaf } from 'lucide-react';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { Loader } from '../components/common';
import './RestaurantDetail.css';

export default function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items: cartItems, addItem, removeItem, count, total, restaurantId } = useCart();
  const toast = useToast();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState({});
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');

  useEffect(() => {
    fetchRestaurant();
  }, [id]);

  const fetchRestaurant = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/restaurants/${id}`);
      setRestaurant(data.restaurant);
      setMenu(data.menu || {});
      setReviews(data.reviews || []);
      const cats = Object.keys(data.menu || {});
      if (cats.length) setActiveCategory(cats[0]);
    } catch (err) {
      toast('Restaurant not found', 'error');
      navigate('/');
    } finally { setLoading(false); }
  };

  const getItemQty = (itemId) => cartItems.find(i => i._id === itemId)?.quantity || 0;

  const handleAdd = (item) => {
    addItem(item, restaurant._id, restaurant.name, restaurant.deliveryFee);
    toast(`${item.name} added to cart`, 'success');
  };

  if (loading) return <div className="page"><Loader text="Loading restaurant..." /></div>;
  if (!restaurant) return null;

  const categories = Object.keys(menu);

  return (
    <div className="page">
      {/* Cover */}
      <div className="restaurant-cover">
        <img src={restaurant.coverImage || restaurant.image} alt={restaurant.name} />
        <div className="cover-overlay" />
        <div className="container cover-info animate-in">
          <div className="cover-logo">
            <img src={restaurant.image} alt={restaurant.name} />
          </div>
          <div className="cover-text">
            <h1>{restaurant.name}</h1>
            <p>{restaurant.description}</p>
            <div className="cover-meta">
              <span><Star size={14} color="var(--accent)" fill="var(--accent)" /> {restaurant.rating || 'New'} ({restaurant.totalRatings} reviews)</span>
              <span><Clock size={14} /> {restaurant.deliveryTime}</span>
              <span><MapPin size={14} /> {restaurant.address}</span>
              {restaurant.phone && <span><Phone size={14} /> {restaurant.phone}</span>}
            </div>
            <div style={{display:'flex',gap:8,marginTop:12,flexWrap:'wrap'}}>
              {restaurant.tags?.map(t => <span key={t} className="badge badge-muted">{t}</span>)}
              {restaurant.isOpen ? <span className="badge badge-success">Open Now</span> : <span className="badge badge-error">Closed</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="container restaurant-layout">
        {/* LEFT: Menu */}
        <div className="menu-section">
          {/* Category tabs */}
          {categories.length > 0 && (
            <div className="category-tabs">
              {categories.map(cat => (
                <button key={cat} className={`cat-tab ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>
                  {cat}
                </button>
              ))}
            </div>
          )}

          {categories.map(cat => (
            <div key={cat} className={`menu-category ${activeCategory === cat ? 'visible' : 'hidden'}`}>
              <h2 className="cat-title">{cat}</h2>
              <div className="menu-items">
                {menu[cat]?.map(item => {
                  const qty = getItemQty(item._id);
                  return (
                    <div key={item._id} className="menu-item card">
                      <div className="item-info">
                        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                          {item.isVeg ? <Leaf size={14} color="var(--success)" /> : <Flame size={14} color="var(--brand)" />}
                          <h3 className="item-name">{item.name}</h3>
                        </div>
                        <p className="item-desc">{item.description}</p>
                        <div style={{display:'flex',alignItems:'center',gap:12,marginTop:10}}>
                          <span className="item-price">${item.price.toFixed(2)}</span>
                          {item.calories && <span style={{fontSize:12,color:'var(--text-muted)'}}>{item.calories} cal</span>}
                          {item.spiceLevel !== 'mild' && <span className="badge badge-error" style={{fontSize:11}}>{item.spiceLevel}</span>}
                        </div>
                      </div>
                      <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
                        <img src={item.image} alt={item.name} className="item-img" />
                        {item.isAvailable ? (
                          qty > 0 ? (
                            <div className="qty-control">
                              <button onClick={() => removeItem(item._id)}><Minus size={14} /></button>
                              <span>{qty}</span>
                              <button onClick={() => handleAdd(item)}><Plus size={14} /></button>
                            </div>
                          ) : (
                            <button className="btn btn-primary btn-sm add-btn" onClick={() => handleAdd(item)}><Plus size={14} /> Add</button>
                          )
                        ) : (
                          <span style={{fontSize:12,color:'var(--text-dim)'}}>Unavailable</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Reviews */}
          {reviews.length > 0 && (
            <div style={{marginTop:48}}>
              <h2 className="section-title" style={{marginBottom:20}}>Customer Reviews</h2>
              <div style={{display:'flex',flexDirection:'column',gap:16}}>
                {reviews.map(r => (
                  <div key={r._id} className="card" style={{padding:20}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                      <div style={{display:'flex',alignItems:'center',gap:12}}>
                        <div style={{width:36,height:36,background:'var(--brand)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:14}}>
                          {r.customer?.name?.[0]}
                        </div>
                        <div>
                          <p style={{fontWeight:600,fontSize:14}}>{r.customer?.name}</p>
                          <p style={{fontSize:12,color:'var(--text-muted)'}}>{new Date(r.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div style={{display:'flex',gap:2}}>
                        {[1,2,3,4,5].map(s => <span key={s} style={{color:s<=r.rating?'var(--accent)':'var(--surface)',fontSize:14}}>★</span>)}
                      </div>
                    </div>
                    {r.comment && <p style={{fontSize:14,color:'var(--text-muted)',lineHeight:1.6}}>{r.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Cart Sidebar */}
        <div className="cart-sidebar">
          <div className="cart-box card" style={{padding:24}}>
            <h3 style={{fontFamily:'Syne',fontWeight:800,marginBottom:20,fontSize:18}}>
              <ShoppingCart size={18} style={{marginRight:8,verticalAlign:'middle'}} />
              Your Order
            </h3>
            {cartItems.length === 0 ? (
              <div style={{textAlign:'center',padding:'40px 0',color:'var(--text-muted)'}}>
                <p style={{fontSize:36,marginBottom:12}}>🛒</p>
                <p style={{fontSize:14}}>Add items to get started</p>
              </div>
            ) : (
              <>
                {restaurantId !== restaurant._id && (
                  <p style={{fontSize:12,color:'var(--warning)',marginBottom:12,padding:'8px 12px',background:'rgba(245,158,11,0.1)',borderRadius:8}}>
                    Your cart has items from another restaurant
                  </p>
                )}
                <div style={{display:'flex',flexDirection:'column',gap:12,marginBottom:20}}>
                  {cartItems.map(item => (
                    <div key={item._id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:14}}>
                      <div>
                        <p style={{fontWeight:500}}>{item.name}</p>
                        <p style={{color:'var(--text-muted)',fontSize:12}}>${item.price.toFixed(2)} each</p>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <div className="qty-control" style={{transform:'scale(0.9)'}}>
                          <button onClick={() => removeItem(item._id)}><Minus size={12} /></button>
                          <span>{item.quantity}</span>
                          <button onClick={() => handleAdd(item)}><Plus size={12} /></button>
                        </div>
                        <span style={{fontWeight:600,minWidth:50,textAlign:'right'}}>${(item.price*item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{borderTop:'1px solid var(--border)',paddingTop:16,display:'flex',flexDirection:'column',gap:8,marginBottom:20}}>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:14,color:'var(--text-muted)'}}>
                    <span>Subtotal</span><span>${(cartItems.reduce((s,i)=>s+i.price*i.quantity,0)).toFixed(2)}</span>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:14,color:'var(--text-muted)'}}>
                    <span>Delivery fee</span><span>${restaurant.deliveryFee?.toFixed(2)}</span>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:14,color:'var(--text-muted)'}}>
                    <span>Tax (8%)</span><span>${(cartItems.reduce((s,i)=>s+i.price*i.quantity,0)*0.08).toFixed(2)}</span>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:16,fontWeight:700,marginTop:8}}>
                    <span>Total</span><span style={{color:'var(--brand)'}}>${total.toFixed(2)}</span>
                  </div>
                </div>
                <button className="btn btn-primary btn-full btn-lg" onClick={() => user ? navigate('/cart') : navigate('/login')}>
                  {user ? 'Proceed to Checkout' : 'Login to Checkout'}
                </button>
              </>
            )}
          </div>
          <div className="card" style={{padding:20,marginTop:16}}>
            <h4 style={{fontWeight:700,marginBottom:12,fontSize:14}}>Restaurant Info</h4>
            <div style={{display:'flex',flexDirection:'column',gap:8,fontSize:13,color:'var(--text-muted)'}}>
              <span><Clock size={13} style={{marginRight:6,verticalAlign:'middle'}} />{restaurant.deliveryTime} delivery</span>
              <span><MapPin size={13} style={{marginRight:6,verticalAlign:'middle'}} />{restaurant.address}</span>
              {restaurant.minOrder && <span>💰 Min order ${restaurant.minOrder}</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
