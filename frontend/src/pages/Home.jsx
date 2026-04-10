import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, Clock, ChevronRight, Flame, Zap, Award } from 'lucide-react';
import api from '../utils/api';
import { Loader, StarRating } from '../components/common';
import './Home.css';

const CUISINES = ['All','Pizza','Burgers','Sushi','Indian','Chinese','Mexican','Italian','Thai','Desserts'];

export default function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cuisine, setCuisine] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    fetchRestaurants();
  }, [cuisine]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const params = {};
      if (cuisine !== 'All') params.cuisine = cuisine;
      if (search) params.search = search;
      const { data } = await api.get('/restaurants', { params });
      setRestaurants(data.restaurants || []);
    } catch { setRestaurants([]); } 
    finally { setLoading(false); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRestaurants();
  };

  return (
    <div>
      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="container hero-content animate-in">
          <div className="hero-badge"><Flame size={14} /> Hot & Fresh Delivery</div>
          <h1 className="hero-title">
            Hungry? <br />
            <span className="hero-gradient">We've got you</span><br />
            covered. 🍕
          </h1>
          <p className="hero-sub">Order from the best restaurants in your city. Fast delivery, every time.</p>

          <form className="search-bar" onSubmit={handleSearch}>
            <MapPin size={18} color="var(--brand)" />
            <input
              className="search-input"
              placeholder="Search restaurants, cuisines..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              <Search size={16} /> Search
            </button>
          </form>

          <div className="hero-stats">
            <div className="stat"><Zap size={18} color="var(--accent)" /><span><b>30 min</b> avg delivery</span></div>
            <div className="stat"><Award size={18} color="var(--success)" /><span><b>500+</b> restaurants</span></div>
            <div className="stat"><Star size={18} color="var(--brand)" /><span><b>4.8★</b> avg rating</span></div>
          </div>
        </div>
      </section>

      {/* CUISINES */}
      <section className="container" style={{paddingTop:48}}>
        <div className="cuisine-scroll">
          {CUISINES.map(c => (
            <button
              key={c}
              className={`cuisine-pill ${cuisine === c ? 'active' : ''}`}
              onClick={() => setCuisine(c)}
            >{c}</button>
          ))}
        </div>
      </section>

      {/* RESTAURANTS */}
      <section className="container" style={{paddingTop:32, paddingBottom:64}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
          <div>
            <h2 className="section-title">
              {cuisine === 'All' ? 'All Restaurants' : `${cuisine} Restaurants`}
            </h2>
            <p style={{color:'var(--text-muted)',fontSize:14}}>{restaurants.length} places found</p>
          </div>
          <Link to="/restaurants" className="btn btn-ghost btn-sm" style={{gap:4}}>
            View All <ChevronRight size={14} />
          </Link>
        </div>

        {loading ? <Loader text="Finding restaurants near you..." /> : (
          restaurants.length === 0 ? (
            <div style={{textAlign:'center',padding:'80px 0',color:'var(--text-muted)'}}>
              <p style={{fontSize:48,marginBottom:16}}>🍽️</p>
              <p style={{fontSize:18,fontWeight:600,marginBottom:8}}>No restaurants found</p>
              <p style={{fontSize:14}}>Try a different search or cuisine filter</p>
            </div>
          ) : (
            <div className="restaurants-grid">
              {restaurants.map((r, i) => (
                <Link to={`/restaurant/${r._id}`} key={r._id} className="card restaurant-card animate-in" style={{animationDelay:`${i*0.05}s`}}>
                  <div className="restaurant-img-wrap">
                    <img src={r.image} alt={r.name} className="restaurant-img" />
                    {!r.isOpen && <div className="closed-overlay">Closed</div>}
                    <span className="cuisine-tag">{r.cuisine}</span>
                  </div>
                  <div className="restaurant-body">
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
                      <h3 className="restaurant-name">{r.name}</h3>
                      <div style={{display:'flex',alignItems:'center',gap:4}}>
                        <Star size={13} color="var(--accent)" fill="var(--accent)" />
                        <span style={{fontSize:13,fontWeight:600}}>{r.rating || 'New'}</span>
                      </div>
                    </div>
                    <p className="restaurant-desc">{r.description || 'Delicious food delivered fast'}</p>
                    <div className="restaurant-meta">
                      <span><Clock size={12} /> {r.deliveryTime}</span>
                      <span><MapPin size={12} /> ${r.deliveryFee} delivery</span>
                      {r.minOrder && <span>Min ${r.minOrder}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}
      </section>
    </div>
  );
}
