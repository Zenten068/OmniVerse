import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectWatchlist, removeFromWatchlist } from '../features/watchlist/watchlistSlice';
import { selectUser } from '../features/auth/authSlice';
import { Link } from 'react-router-dom';
import { Bookmark, Trash2, Film, Tv, Star, ArrowRight } from 'lucide-react';
import { POSTER_MD } from '../api/tmdb';
import toast from 'react-hot-toast';

export default function Watchlist() {
  const dispatch = useDispatch();
  const watchlist = useSelector(selectWatchlist);
  const user = useSelector(selectUser);

  useEffect(() => { document.title = 'My Watchlist — OmniVerse'; }, []);

  const handleRemove = (item) => {
    dispatch(removeFromWatchlist(item.id));
    toast.success(`Removed from Watchlist`, {
      style: { background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)' },
    });
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '90px 1.5rem 2rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit', fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            My <span className="gradient-text">Watchlist</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Welcome back, <strong style={{ color: 'var(--accent)' }}>{user?.name?.split(' ')[0]}</strong>! You have {watchlist.length} title{watchlist.length !== 1 ? 's' : ''} saved.
          </p>
        </div>
      </div>

      {watchlist.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '6rem 2rem', background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border)' }}>
          <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'var(--accent-dim)', border: '2px solid rgba(0,200,150,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Bookmark size={44} color="var(--accent)" />
          </div>
          <h2 style={{ fontFamily: 'Outfit', fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Your Watchlist is Empty</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: 400, margin: '0 auto 2rem', lineHeight: 1.6 }}>
            Browse movies and TV shows, then hit the bookmark icon to save them here for later.
          </p>
          <Link to="/explore" className="btn-accent" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.75rem', borderRadius: 10, textDecoration: 'none', fontSize: '0.95rem', fontWeight: 700 }} id="watchlist-explore-btn">
            Start Exploring <ArrowRight size={17} />
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {watchlist.map((item, idx) => {
            const isTV = item.media_type === 'tv';
            const title = item.title || item.name;
            const year = (item.release_date || item.first_air_date || '').slice(0, 4);
            const poster = item.poster_path ? `${POSTER_MD}${item.poster_path}` : null;
            return (
              <div key={item.id} className="fade-in-up" style={{ animationDelay: `${idx * 40}ms`, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', display: 'flex', transition: 'all 0.2s ease' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <Link to={isTV ? `/tv/${item.id}` : `/movie/${item.id}`} style={{ flexShrink: 0, display: 'block' }}>
                  {poster ? (
                    <img src={poster} alt={title} style={{ width: 90, height: '100%', objectFit: 'cover', display: 'block' }} loading="lazy" />
                  ) : (
                    <div style={{ width: 90, minHeight: 130, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isTV ? <Tv size={28} color="var(--text-muted)" /> : <Film size={28} color="var(--text-muted)" />}
                    </div>
                  )}
                </Link>
                <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.4rem' }}>
                      <span className="badge badge-accent">{isTV ? 'TV' : 'Movie'}</span>
                      {year && <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', alignSelf: 'center' }}>{year}</span>}
                    </div>
                    <Link to={isTV ? `/tv/${item.id}` : `/movie/${item.id}`} style={{ textDecoration: 'none' }}>
                      <h3 style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: '0.3rem' }}>{title}</h3>
                    </Link>
                    {item.overview && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.overview}</p>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {item.vote_average > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Star size={13} color="var(--gold)" fill="var(--gold)" />
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.vote_average.toFixed(1)}</span>
                      </div>
                    )}
                    <button onClick={() => handleRemove(item)} id={`watchlist-remove-${item.id}`}
                      style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, padding: '0.35rem 0.6rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--danger)', fontSize: '0.75rem', transition: 'all 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,71,87,0.1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <Trash2 size={13} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
