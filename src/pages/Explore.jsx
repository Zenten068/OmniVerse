import { useState, useEffect, useCallback, useRef } from 'react';
import { discoverMovies, discoverTV, getGenres } from '../api/tmdb';
import MovieCard from '../components/MovieCard';
import { useInView } from 'react-intersection-observer';
import { SlidersHorizontal, ChevronDown, Loader2, Film, Tv } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Most Popular' },
  { value: 'vote_average.desc', label: 'Highest Rated' },
  { value: 'release_date.desc', label: 'Latest Release' },
  { value: 'revenue.desc', label: 'Top Grossing' },
];

export default function Explore() {
  const [mediaType, setMediaType] = useState('movie');
  const [genre, setGenre] = useState('');
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [genres, setGenres] = useState([]);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { ref: sentinelRef, inView } = useInView({ threshold: 0 });
  const isFirstRender = useRef(true);

  useEffect(() => { document.title = 'Explore — OmniVerse'; }, []);

  useEffect(() => {
    getGenres(mediaType).then(r => setGenres(r.data.genres)).catch(() => { });
  }, [mediaType]);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; }
    setItems([]);
    setPage(1);
    setHasMore(true);
    setInitialLoad(true);
  }, [mediaType, genre, sortBy]);

  const fetchPage = useCallback(async (pageNum) => {
    if (loading) return;
    setLoading(true);
    try {
      const fn = mediaType === 'movie' ? discoverMovies : discoverTV;
      const res = await fn({ page: pageNum, genre, sortBy });
      const results = res.data.results;
      setItems(prev => pageNum === 1 ? results : [...prev, ...results]);
      setHasMore(pageNum < res.data.total_pages && pageNum < 20);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setInitialLoad(false); }
  }, [mediaType, genre, sortBy]);

  useEffect(() => { fetchPage(page); }, [page, fetchPage]);

  useEffect(() => {
    if (inView && hasMore && !loading && !initialLoad) {
      setPage(p => p + 1);
    }
  }, [inView, hasMore, loading, initialLoad]);

  const skeletons = Array(20).fill(null);

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '90px 1.5rem 2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Outfit', fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Explore <span className="gradient-text">Everything</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Discover movies and TV shows with advanced filters</p>
      </div>

      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 16, padding: '1rem 1.5rem',
        marginBottom: '2rem', display: 'flex', flexWrap: 'wrap',
        gap: '1rem', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', background: 'var(--bg-elevated)', borderRadius: 10, padding: 4, gap: 4 }}>
          {[{ v: 'movie', label: 'Movies', icon: <Film size={15} /> }, { v: 'tv', label: 'TV Shows', icon: <Tv size={15} /> }].map(opt => (
            <button
              key={opt.v}
              onClick={() => { setMediaType(opt.v); setGenre(''); }}
              id={`explore-type-${opt.v}`}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.45rem 0.9rem', borderRadius: 8, border: 'none',
                cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                background: mediaType === opt.v ? 'var(--accent)' : 'transparent',
                color: mediaType === opt.v ? '#0a0a0f' : 'var(--text-muted)',
                transition: 'all 0.2s',
              }}
            >{opt.icon} {opt.label}</button>
          ))}
        </div>

        <div style={{ position: 'relative' }}>
          <select
            value={genre}
            onChange={e => setGenre(e.target.value)}
            id="explore-genre-filter"
            style={{
              appearance: 'none', background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '0.5rem 2.2rem 0.5rem 0.9rem',
              color: 'var(--text-primary)', fontSize: '0.85rem', cursor: 'pointer',
              outline: 'none', fontFamily: 'inherit',
            }}
          >
            <option value="">All Genres</option>
            {genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <ChevronDown size={14} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
        </div>

        <div style={{ position: 'relative' }}>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            id="explore-sort-filter"
            style={{
              appearance: 'none', background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '0.5rem 2.2rem 0.5rem 0.9rem',
              color: 'var(--text-primary)', fontSize: '0.85rem', cursor: 'pointer',
              outline: 'none', fontFamily: 'inherit',
            }}
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown size={14} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
        </div>

        {!initialLoad && (
          <span className="badge badge-accent" style={{ marginLeft: 'auto' }}>
            {items.length} titles loaded
          </span>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem',
      }}>
        {initialLoad
          ? skeletons.map((_, i) => (
            <div key={i} className="skeleton" style={{ aspectRatio: '2/3', borderRadius: 12 }} />
          ))
          : items.map(item => (
            <MovieCard key={`${item.id}-${mediaType}`} item={{ ...item, media_type: mediaType }} size="sm" />
          ))
        }
      </div>

      <div ref={sentinelRef} style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        {loading && !initialLoad && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <Loader2 size={28} color="var(--accent)" style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading more...</span>
          </div>
        )}
        {!hasMore && !initialLoad && items.length > 0 && (
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>You've reached the end ✨</span>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
