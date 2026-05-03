import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToWatchlist, removeFromWatchlist, selectIsInWatchlist } from '../features/watchlist/watchlistSlice';
import { selectIsAuthenticated } from '../features/auth/authSlice';
import { POSTER_MD } from '../api/tmdb';
import { Bookmark, BookmarkCheck, Star, Film, Tv } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MovieCard({ item, size = 'md' }) {
  const dispatch = useDispatch();
  const isAuth = useSelector(selectIsAuthenticated);
  const inWatchlist = useSelector(selectIsInWatchlist(item.id));

  const isTV = item.media_type === 'tv' || item.first_air_date;
  const title = item.title || item.name || 'Unknown';
  const year = (item.release_date || item.first_air_date || '').slice(0, 4);
  const rating = item.vote_average?.toFixed(1) || 'N/A';
  const poster = item.poster_path ? `${POSTER_MD}${item.poster_path}` : null;

  const widths = { sm: 140, md: 180, lg: 220 };
  const width = widths[size] || 180;

  const handleWatchlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuth) {
      toast.error('Sign in to use your Watchlist', {
        style: { background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)' },
        iconTheme: { primary: 'var(--danger)', secondary: '#fff' },
      });
      return;
    }
    if (inWatchlist) {
      dispatch(removeFromWatchlist(item.id));
      toast.success(`Removed "${title}" from Watchlist`, {
        style: { background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)' },
      });
    } else {
      dispatch(addToWatchlist({
        id: item.id, title, poster_path: item.poster_path,
        vote_average: item.vote_average, release_date: item.release_date,
        first_air_date: item.first_air_date, media_type: item.media_type || (isTV ? 'tv' : 'movie'),
        overview: item.overview, genre_ids: item.genre_ids,
      }));
      toast.success(`Added "${title}" to Watchlist`, {
        style: { background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)' },
        iconTheme: { primary: 'var(--accent)', secondary: '#0a0a0f' },
      });
    }
  };

  return (
    <Link
      to={isTV ? `/tv/${item.id}` : `/movie/${item.id}`}
      className="card-hover"
      style={{
        display: 'block', textDecoration: 'none', flexShrink: 0,
        width, borderRadius: '12px', overflow: 'hidden',
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        position: 'relative',
      }}
      id={`card-${item.id}`}
    >
      <div style={{ position: 'relative', aspectRatio: '2/3', background: 'var(--bg-elevated)' }}>
        {poster ? (
          <img
            src={poster} alt={title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            loading="lazy"
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
            {isTV ? <Tv size={40} color="var(--text-muted)" /> : <Film size={40} color="var(--text-muted)" />}
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', padding: '0 0.5rem' }}>{title}</span>
          </div>
        )}

        <div className="card-overlay" />

        <div style={{ position: 'absolute', top: 8, left: 8 }}>
          <span className="badge badge-accent">{isTV ? 'TV' : 'Movie'}</span>
        </div>

        <button
          onClick={handleWatchlist}
          style={{
            position: 'absolute', top: 8, right: 8,
            background: inWatchlist ? 'var(--accent)' : 'rgba(0,0,0,0.6)',
            border: 'none', borderRadius: '8px',
            padding: '6px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s ease',
            backdropFilter: 'blur(4px)',
          }}
          id={`watchlist-btn-${item.id}`}
        >
          {inWatchlist
            ? <BookmarkCheck size={14} color="#0a0a0f" />
            : <Bookmark size={14} color="#ffffff" />
          }
        </button>

        {item.vote_average > 0 && (
          <div style={{
            position: 'absolute', bottom: 8, left: 8,
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
            borderRadius: '6px', padding: '3px 8px',
          }}>
            <Star size={12} color="var(--gold)" fill="var(--gold)" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>{rating}</span>
          </div>
        )}
      </div>

      <div style={{ padding: '0.6rem 0.75rem 0.75rem' }}>
        <div style={{
          fontSize: '0.8rem', fontWeight: 600,
          color: 'var(--text-primary)', lineHeight: 1.3,
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          marginBottom: '0.3rem',
        }}>
          {title}
        </div>
        {year && (
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{year}</div>
        )}
      </div>
    </Link>
  );
}
