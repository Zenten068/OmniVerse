import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTrending, getTopRated, discoverMovies, getPopularTV, getNowPlaying, POSTER_SM } from '../api/tmdb';
import HeroSection from '../components/HeroSection';
import MovieRow from '../components/MovieRow';
import { TrendingUp, Star, Sparkles, Tv, Clapperboard, Play, History, Trash2 } from 'lucide-react';

export default function Home() {
  const [trending, setTrending] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [animation, setAnimation] = useState([]);
  const [popularTV, setPopularTV] = useState([]);
  const [nowPlaying, setNowPlaying] = useState([]);
  const [loading, setLoading] = useState(true);
  const [continueWatching, setContinueWatching] = useState([]);

  useEffect(() => {
    document.title = 'OmniVerse — Watch Movies & TV Series Online';
    const history = JSON.parse(localStorage.getItem('omni_continue_watching') || '[]');
    setContinueWatching(history);

    const fetch = async () => {
      try {
        const [t, tr, a, tv, np] = await Promise.all([
          getTrending('all', 'day'),
          getTopRated('movie'),
          discoverMovies({ genre: '16' }),
          getPopularTV(),
          getNowPlaying(),
        ]);
        setTrending(t.data.results);
        setTopRated(tr.data.results);
        setAnimation(a.data.results);
        setPopularTV(tv.data.results.map(i => ({ ...i, media_type: 'tv' })));
        setNowPlaying(np.data.results);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('omni_continue_watching');
    setContinueWatching([]);
  };

  return (
    <div>
      <HeroSection items={trending} />

      <div style={{ paddingTop: '2rem' }}>
        {continueWatching.length > 0 && (
          <section style={{ maxWidth: 1400, margin: '0 auto 2rem', padding: '0 1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ fontFamily: 'Outfit', fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <History size={20} color="var(--accent)" /> Continue Watching
              </h2>
              <button
                onClick={clearHistory}
                style={{
                  background: 'none', border: 'none', color: 'var(--text-muted)',
                  fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
                }}
              >
                <Trash2 size={13} /> Clear
              </button>
            </div>
            <div className="scroll-row" style={{ paddingBottom: '0.5rem' }}>
              {continueWatching.map(item => (
                <Link
                  key={item.tmdbId}
                  to={item.isTV ? `/tv/${item.tmdbId}` : `/movie/${item.tmdbId}`}
                  style={{
                    flexShrink: 0, width: 220, background: 'var(--bg-card)',
                    border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden',
                    textDecoration: 'none', display: 'flex', gap: '0.75rem', padding: '0.6rem',
                    alignItems: 'center', transition: 'transform 0.2s, border-color 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.borderColor = 'var(--accent)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'var(--border)';
                  }}
                >
                  <div style={{ width: 50, height: 75, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: 'var(--bg-elevated)', position: 'relative' }}>
                    {item.posterPath ? (
                      <img src={`${POSTER_SM}${item.posterPath}`} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <Play size={20} color="var(--accent)" />
                      </div>
                    )}
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ background: 'var(--accent)', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Play size={12} fill="#0a0a0f" color="#0a0a0f" style={{ marginLeft: 2 }} />
                      </div>
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span className="badge badge-accent" style={{ fontSize: '0.6rem', padding: '1px 5px', marginBottom: 4 }}>
                      {item.isTV ? `S${item.season} E${item.episode}` : 'Movie'}
                    </span>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--accent)', marginTop: 4, fontWeight: 500 }}>
                      Resume Watching →
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <MovieRow title="Trending Today" items={trending} loading={loading} icon={<TrendingUp size={20} />} />
        <MovieRow title="Now Playing" items={nowPlaying} loading={loading} icon={<Clapperboard size={20} />} />
        <MovieRow title="Top Rated Movies" items={topRated} loading={loading} icon={<Star size={20} />} />
        <MovieRow title="Popular TV Series" items={popularTV} loading={loading} icon={<Tv size={20} />} />
        <MovieRow title="Animation" items={animation} loading={loading} icon={<Sparkles size={20} />} />
      </div>
    </div>
  );
}

