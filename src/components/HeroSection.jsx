import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToWatchlist, removeFromWatchlist, selectIsInWatchlist } from '../features/watchlist/watchlistSlice';
import { selectIsAuthenticated } from '../features/auth/authSlice';
import { BACKDROP_ORIG, POSTER_LG } from '../api/tmdb';
import { Play, Bookmark, BookmarkCheck, Star, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function HeroSection({ items = [] }) {
  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState(true);
  const dispatch = useDispatch();
  const isAuth = useSelector(selectIsAuthenticated);

  const featured = items.slice(0, 6);
  const item = featured[current];
  const inWatchlist = useSelector(selectIsInWatchlist(item?.id));

  useEffect(() => {
    if (featured.length < 2) return;
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrent(c => (c + 1) % featured.length);
        setFade(true);
      }, 400);
    }, 6000);
    return () => clearInterval(timer);
  }, [featured.length]);

  const goTo = (idx) => {
    setFade(false);
    setTimeout(() => { setCurrent(idx); setFade(true); }, 300);
  };

  if (!item) return null;

  const backdrop = item.backdrop_path ? `${BACKDROP_ORIG}${item.backdrop_path}` : null;
  const poster = item.poster_path ? `${POSTER_LG}${item.poster_path}` : null;
  const title = item.title || item.name;
  const year = (item.release_date || item.first_air_date || '').slice(0, 4);
  const isTV = item.media_type === 'tv' || item.first_air_date;

  const handleWatchlist = () => {
    if (!isAuth) {
      toast.error('Sign in to use your Watchlist', {
        style: { background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)' },
      });
      return;
    }
    if (inWatchlist) {
      dispatch(removeFromWatchlist(item.id));
      toast.success(`Removed from Watchlist`);
    } else {
      dispatch(addToWatchlist({
        id: item.id, title, poster_path: item.poster_path,
        vote_average: item.vote_average, release_date: item.release_date,
        first_air_date: item.first_air_date,
        media_type: item.media_type || (isTV ? 'tv' : 'movie'),
        overview: item.overview,
      }));
      toast.success(`Added to Watchlist`, {
        style: { background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)' },
        iconTheme: { primary: 'var(--accent)', secondary: '#0a0a0f' },
      });
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: 'min(90vh, 700px)', overflow: 'hidden', background: 'var(--bg-primary)' }}>
      {backdrop && (
        <div style={{
          position: 'absolute', inset: 0,
          opacity: fade ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}>
          <img src={backdrop} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
        </div>
      )}

      <div className="hero-gradient" style={{ position: 'absolute', inset: 0 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)' }} />

      <div style={{
        position: 'absolute', bottom: '12%', left: 0, right: 0,
        padding: '0 max(1.5rem, 4vw)',
        opacity: fade ? 1 : 0,
        transform: fade ? 'translateY(0)' : 'translateY(10px)',
        transition: 'all 0.5s ease',
        display: 'flex', alignItems: 'flex-end', gap: '2rem',
        maxWidth: 1400, margin: '0 auto',
      }}>
        {poster && (
          <img src={poster} alt={title} style={{
            height: 200, width: 'auto', borderRadius: 12,
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            flexShrink: 0, display: 'none',
          }} className="hero-poster" />
        )}

        <div style={{ flex: 1, maxWidth: 600 }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <span className="badge badge-accent">{isTV ? 'TV Series' : 'Movie'}</span>
            {year && <span className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>{year}</span>}
            {item.vote_average > 0 && (
              <span className="badge" style={{ background: 'rgba(255,215,0,0.15)', color: 'var(--gold)', border: '1px solid rgba(255,215,0,0.3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Star size={10} fill="currentColor" /> {item.vote_average.toFixed(1)}
              </span>
            )}
          </div>

          <h1 style={{
            fontFamily: 'Outfit', fontWeight: 800,
            fontSize: 'clamp(1.8rem, 4vw, 3.5rem)',
            color: '#ffffff', lineHeight: 1.1,
            marginBottom: '0.75rem',
            textShadow: '0 2px 20px rgba(0,0,0,0.5)',
          }}>
            {title}
          </h1>

          {item.overview && (
            <p style={{
              color: 'rgba(255,255,255,0.75)', fontSize: 'clamp(0.85rem, 1.5vw, 1rem)',
              lineHeight: 1.6, marginBottom: '1.5rem',
              display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {item.overview}
            </p>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link
              to={isTV ? `/tv/${item.id}` : `/movie/${item.id}`}
              className="btn-accent"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.75rem 1.5rem', borderRadius: '10px',
                textDecoration: 'none', fontSize: '0.9rem',
              }}
              id={`hero-details-${item.id}`}
            >
              <Info size={17} /> View Details
            </Link>
            <button
              onClick={handleWatchlist}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.75rem 1.5rem', borderRadius: '10px',
                fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
                background: inWatchlist ? 'var(--accent-dim)' : 'rgba(255,255,255,0.12)',
                border: inWatchlist ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.25)',
                color: inWatchlist ? 'var(--accent)' : '#fff',
                backdropFilter: 'blur(8px)', transition: 'all 0.25s ease',
              }}
              id={`hero-watchlist-${item.id}`}
            >
              {inWatchlist ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}
              {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
            </button>
          </div>
        </div>
      </div>

      {featured.length > 1 && (
        <div style={{
          position: 'absolute', bottom: '5%', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: '0.5rem', alignItems: 'center',
        }}>
          {featured.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              style={{
                width: i === current ? 28 : 8, height: 8,
                borderRadius: 4, border: 'none', cursor: 'pointer',
                background: i === current ? 'var(--accent)' : 'rgba(255,255,255,0.3)',
                transition: 'all 0.3s ease', padding: 0,
              }}
              id={`hero-dot-${i}`}
            />
          ))}
        </div>
      )}

      {featured.length > 1 && (
        <>
          <button onClick={() => goTo((current - 1 + featured.length) % featured.length)} style={{
            position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
            background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '50%', width: 44, height: 44,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#fff', backdropFilter: 'blur(8px)',
            transition: 'all 0.2s', zIndex: 5,
          }} id="hero-prev">
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => goTo((current + 1) % featured.length)} style={{
            position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
            background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '50%', width: 44, height: 44,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#fff', backdropFilter: 'blur(8px)',
            transition: 'all 0.2s', zIndex: 5,
          }} id="hero-next">
            <ChevronRight size={20} />
          </button>
        </>
      )}

      <style>{`
        @media (min-width: 900px) { .hero-poster { display: block !important; } }
      `}</style>
    </div>
  );
}
