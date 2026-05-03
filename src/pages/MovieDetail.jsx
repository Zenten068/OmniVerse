import { useEffect, useState, lazy } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMovieDetails, getTVDetails, BACKDROP_ORIG, POSTER_LG, IMAGE_BASE } from '../api/tmdb';
import { addToWatchlist, removeFromWatchlist, selectIsInWatchlist } from '../features/watchlist/watchlistSlice';
import { selectIsAuthenticated } from '../features/auth/authSlice';
import {
  Star, Bookmark, BookmarkCheck, Clock, Calendar, Users, Play,
  ArrowLeft, Loader2, Film, Tv, ExternalLink, Heart, MonitorPlay
} from 'lucide-react';
import MovieCard from '../components/MovieCard';
import toast from 'react-hot-toast';

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuth = useSelector(selectIsAuthenticated);
  const inWatchlist = useSelector(selectIsInWatchlist(Number(id)));

  const isTV = window.location.pathname.startsWith('/tv/');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trailerKey, setTrailerKey] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setData(null);
    const fn = isTV ? getTVDetails : getMovieDetails;
    fn(id)
      .then(res => {
        setData(res.data);
        const trailer = res.data.videos?.results?.find(
          v => v.type === 'Trailer' && v.site === 'YouTube'
        );
        setTrailerKey(trailer?.key || null);
        document.title = `${res.data.title || res.data.name} — OmniVerse`;
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id, isTV]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <Loader2 size={48} color="var(--accent)" style={{ animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!data) return null;

  const title = data.title || data.name;
  const year = (data.release_date || data.first_air_date || '').slice(0, 4);
  const runtime = data.runtime ? `${Math.floor(data.runtime / 60)}h ${data.runtime % 60}m` : null;
  const rating = data.vote_average?.toFixed(1);
  const backdrop = data.backdrop_path ? `${BACKDROP_ORIG}${data.backdrop_path}` : null;
  const poster = data.poster_path ? `${POSTER_LG}${data.poster_path}` : null;
  const cast = data.credits?.cast?.slice(0, 12) || [];
  const similar = data.similar?.results?.slice(0, 12) || [];
  const genres = data.genres || [];
  const director = data.credits?.crew?.find(c => c.job === 'Director');
  const watchProviders = data['watch/providers']?.results?.US?.flatrate || [];

  const handleWatchlist = () => {
    if (!isAuth) {
      toast.error('Sign in to use your Watchlist', {
        style: { background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)' },
      });
      return;
    }
    if (inWatchlist) {
      dispatch(removeFromWatchlist(data.id));
      toast.success(`Removed from Watchlist`);
    } else {
      dispatch(addToWatchlist({
        id: data.id, title, poster_path: data.poster_path,
        vote_average: data.vote_average, release_date: data.release_date,
        first_air_date: data.first_air_date,
        media_type: isTV ? 'tv' : 'movie', overview: data.overview,
      }));
      toast.success(`Added to Watchlist`, {
        style: { background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)' },
        iconTheme: { primary: 'var(--accent)', secondary: '#0a0a0f' },
      });
    }
  };

  return (
    <div>
      <div style={{ position: 'relative', height: 'min(70vh, 550px)', overflow: 'hidden' }}>
        {backdrop && <img src={backdrop} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%' }} />}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 60%, var(--bg-primary) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, transparent 60%)' }} />
        <button
          onClick={() => navigate(-1)}
          style={{
            position: 'absolute', top: 80, left: '1.5rem',
            background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 10, padding: '0.5rem 1rem',
            color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
            fontSize: '0.85rem', backdropFilter: 'blur(8px)', transition: 'all 0.2s',
          }}
          id="detail-back-btn"
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '2.5rem', marginTop: '-180px', position: 'relative', zIndex: 10, alignItems: 'start' }}>
          <div style={{ flexShrink: 0 }} className="detail-poster-wrap">
            {poster ? (
              <img src={poster} alt={title} style={{ width: 220, borderRadius: 16, boxShadow: '0 25px 60px rgba(0,0,0,0.6)', display: 'block' }} />
            ) : (
              <div style={{ width: 220, height: 330, borderRadius: 16, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isTV ? <Tv size={60} color="var(--text-muted)" /> : <Film size={60} color="var(--text-muted)" />}
              </div>
            )}
          </div>

          <div style={{ paddingTop: '8rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <span className="badge badge-accent">{isTV ? 'TV Series' : 'Movie'}</span>
              {year && <span className="badge" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>{year}</span>}
              {genres.slice(0, 3).map(g => (
                <span key={g.id} className="badge" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>{g.name}</span>
              ))}
            </div>

            <h1 style={{ fontFamily: 'Outfit', fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.15, marginBottom: '1rem' }}>
              {title}
            </h1>

            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              {rating > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Star size={18} color="var(--gold)" fill="var(--gold)" />
                  <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{rating}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>/ 10</span>
                </div>
              )}
              {runtime && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <Clock size={16} /> {runtime}
                </div>
              )}
              {data.vote_count > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <Users size={16} /> {data.vote_count.toLocaleString()} votes
                </div>
              )}
              {director && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <Film size={16} /> Dir. {director.name}
                </div>
              )}
            </div>

            {data.overview && (
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, fontSize: '0.975rem', maxWidth: 650, marginBottom: '1.5rem' }}>
                {data.overview}
              </p>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {trailerKey && (
                <button
                  onClick={() => setShowTrailer(true)}
                  className="btn-accent"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: 10, fontSize: '0.9rem' }}
                  id="detail-trailer-btn"
                >
                  <Play size={17} fill="currentColor" /> Watch Trailer
                </button>
              )}
              <button
                onClick={handleWatchlist}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.75rem 1.5rem', borderRadius: 10, fontSize: '0.9rem',
                  fontWeight: 600, cursor: 'pointer',
                  background: inWatchlist ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                  border: `1px solid ${inWatchlist ? 'var(--accent)' : 'var(--border)'}`,
                  color: inWatchlist ? 'var(--accent)' : 'var(--text-primary)',
                  transition: 'all 0.25s',
                }}
                id="detail-watchlist-btn"
              >
                {inWatchlist ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}
                {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
              </button>
            </div>

            {watchProviders.length > 0 && (
              <div style={{ marginTop: '2rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MonitorPlay size={16} /> Available to Stream
                </h3>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {watchProviders.map(provider => (
                    <div key={provider.provider_id} title={provider.provider_name} style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-elevated)', borderRadius: '8px', padding: '0.4rem 0.75rem', gap: '0.5rem', border: '1px solid var(--border)' }}>
                      <img
                        src={`${IMAGE_BASE}/w92${provider.logo_path}`}
                        alt={provider.provider_name}
                        style={{ width: 24, height: 24, borderRadius: 4 }}
                      />
                      <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>{provider.provider_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {cast.length > 0 && (
          <section style={{ marginTop: '3rem' }}>
            <h2 style={{ fontFamily: 'Outfit', fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={20} color="var(--accent)" /> Cast
            </h2>
            <div className="scroll-row" style={{ paddingBottom: '0.75rem' }}>
              {cast.map(person => (
                <div key={person.id} style={{
                  flexShrink: 0, width: 110,
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 12, overflow: 'hidden', textAlign: 'center',
                  transition: 'transform 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  {person.profile_path ? (
                    <img src={`${IMAGE_BASE}/w185${person.profile_path}`} alt={person.name}
                      style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover' }} loading="lazy" />
                  ) : (
                    <div style={{ width: '100%', aspectRatio: '2/3', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Users size={28} color="var(--text-muted)" />
                    </div>
                  )}
                  <div style={{ padding: '0.5rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>{person.name}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>{person.character}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {similar.length > 0 && (
          <section style={{ marginTop: '3rem' }}>
            <h2 style={{ fontFamily: 'Outfit', fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Heart size={20} color="var(--accent)" /> You Might Also Like
            </h2>
            <div className="scroll-row">
              {similar.map(item => <MovieCard key={item.id} item={{ ...item, media_type: isTV ? 'tv' : 'movie' }} size="md" />)}
            </div>
          </section>
        )}
      </div>
      {showTrailer && trailerKey && (
        <div
          onClick={() => setShowTrailer(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '2rem',
          }}
        >
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 900, position: 'relative' }}>
            <button onClick={() => setShowTrailer(false)} style={{
              position: 'absolute', top: -40, right: 0,
              background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.5rem',
            }} id="trailer-close-btn">✕</button>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
              <iframe
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`}
                title="Trailer"
                allow="autoplay; encrypted-media"
                allowFullScreen
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', borderRadius: 12 }}
              />
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 700px) {
          .detail-poster-wrap { display: none !important; }
        }
      `}</style>
    </div>
  );
}
