import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, Clock, MapPin, SlidersHorizontal } from 'lucide-react';
import api from '../utils/api';
import { Loader } from '../components/common';

const CUISINES = ['All','Pizza','Burgers','Sushi','Indian','Chinese','Mexican','Italian','Thai','Desserts'];

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cuisine, setCuisine] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { fetch(); }, [cuisine, page]);

  const fetch = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 12 };
      if (cuisine !== 'All') params.cuisine = cuisine;
      if (search) params.search = search;
      const { data } = await api.get('/restaurants', { params });
      setRestaurants(data.restaurants || []);
      setTotalPages(data.pages || 1);
    } catch (e) { setRestaurants([]); }
    finally { setLoading(false); }
  };

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 40 }}>
        <h1 className="section-title">All Restaurants</h1>
        <p className="section-sub">Find something delicious near you</p>

        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 260, display: 'flex', alignItems: 'center', gap: 10, background: 'var(--dark2)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 16px' }}>
            <Search size={16} color="var(--text-dim)" />
            <input style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 14, flex: 1 }}
              placeholder="Search restaurants..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetch()}
            />
          </div>
          <button className="btn btn-secondary" onClick={fetch}><SlidersHorizontal size={15} /> Filter</button>
        </div>

        <div className="cuisine-scroll" style={{ marginBottom: 32 }}>
          {CUISINES.map(c => (
            <button key={c} className={`cuisine-pill ${cuisine === c ? 'active' : ''}`} onClick={() => { setCuisine(c); setPage(1); }}>{c}</button>
          ))}
        </div>

        {loading ? <Loader text="Searching restaurants..." /> : (
          <>
            <div className="restaurants-grid">
              {restaurants.map((r, i) => (
                <Link to={`/restaurant/${r._id}`} key={r._id} className="card restaurant-card animate-in" style={{ animationDelay: `${i * 0.04}s` }}>
                  <div className="restaurant-img-wrap">
                    <img src={r.image} alt={r.name} className="restaurant-img" />
                    {!r.isOpen && <div className="closed-overlay">Closed</div>}
                    <span className="cuisine-tag">{r.cuisine}</span>
                  </div>
                  <div className="restaurant-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <h3 className="restaurant-name">{r.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Star size={13} color="var(--accent)" fill="var(--accent)" />
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{r.rating || 'New'}</span>
                      </div>
                    </div>
                    <p className="restaurant-desc">{r.description || 'Delicious food delivered fast'}</p>
                    <div className="restaurant-meta">
                      <span><Clock size={12} /> {r.deliveryTime}</span>
                      <span><MapPin size={12} /> ${r.deliveryFee} delivery</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} className={`btn ${p === page ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setPage(p)}>{p}</button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
