import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchMulti } from '../api/tmdb';
import MovieCard from '../components/MovieCard';
import useDebounce from '../hooks/useDebounce';
import { Search, Filter, Loader2, Ghost } from 'lucide-react';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [mediaFilter, setMediaFilter] = useState('all');

  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => { document.title = `Search — OmniVerse`; }, []);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]); setTotalPages(0); setTotalResults(0); return;
    }
    document.title = `"${debouncedQuery}" — OmniVerse Search`;
    setSearchParams({ q: debouncedQuery });
    setLoading(true);
    setPage(1);

    searchMulti(debouncedQuery, 1)
      .then(res => {
        setResults(res.data.results.filter(r => r.media_type !== 'person'));
        setTotalPages(res.data.total_pages);
        setTotalResults(res.data.total_results);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  const loadPage = (p) => {
    if (!query.trim()) return;
    setLoading(true);
    setPage(p);
    searchMulti(query, p)
      .then(res => {
        setResults(res.data.results.filter(r => r.media_type !== 'person'));
      })
      .catch(() => { })
      .finally(() => setLoading(false));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filtered = mediaFilter === 'all' ? results : results.filter(r => r.media_type === mediaFilter);

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '90px 1.5rem 2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Outfit', fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Search <span className="gradient-text">Titles</span>
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Find movies, TV shows and more</p>
      </div>

      <div style={{ position: 'relative', marginBottom: '1.5rem', maxWidth: 600 }}>
        <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search for anything..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoFocus
          id="search-page-input"
          style={{
            width: '100%', padding: '0.9rem 1rem 0.9rem 3rem',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 14, color: 'var(--text-primary)',
            fontSize: '1rem', outline: 'none', fontFamily: 'inherit',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-dim)'; }}
          onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
        />
        {loading && (
          <Loader2 size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent)', animation: 'spin 1s linear infinite' }} />
        )}
      </div>

      {results.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {[{ v: 'all', l: 'All' }, { v: 'movie', l: 'Movies' }, { v: 'tv', l: 'TV Shows' }].map(f => (
            <button
              key={f.v}
              onClick={() => setMediaFilter(f.v)}
              id={`search-filter-${f.v}`}
              style={{
                padding: '0.4rem 1rem', borderRadius: 9999, border: 'none',
                cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                background: mediaFilter === f.v ? 'var(--accent)' : 'var(--bg-elevated)',
                color: mediaFilter === f.v ? '#0a0a0f' : 'var(--text-secondary)',
                border: `1px solid ${mediaFilter === f.v ? 'var(--accent)' : 'var(--border)'}`,
                transition: 'all 0.2s',
              }}
            >{f.l}</button>
          ))}
          {totalResults > 0 && (
            <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {totalResults.toLocaleString()} results
            </span>
          )}
        </div>
      )}

      {filtered.length > 0 ? (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2rem',
          }}>
            {filtered.map(item => <MovieCard key={item.id} item={item} size="sm" />)}
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button onClick={() => loadPage(Math.max(1, page - 1))} disabled={page === 1}
                className="btn-ghost" style={{ borderRadius: 8, padding: '0.5rem 1rem', opacity: page === 1 ? 0.4 : 1 }}
                id="search-prev-page">← Prev</button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                return (
                  <button key={p} onClick={() => loadPage(p)}
                    id={`search-page-${p}`}
                    style={{
                      borderRadius: 8, padding: '0.5rem 0.85rem', border: 'none',
                      cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
                      background: p === page ? 'var(--accent)' : 'var(--bg-elevated)',
                      color: p === page ? '#0a0a0f' : 'var(--text-secondary)',
                    }}>{p}</button>
                );
              })}
              <button onClick={() => loadPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                className="btn-ghost" style={{ borderRadius: 8, padding: '0.5rem 1rem', opacity: page === totalPages ? 0.4 : 1 }}
                id="search-next-page">Next →</button>
            </div>
          )}
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
          {query && !loading ? (
            <>
              <Ghost size={60} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
              <h2 style={{ fontFamily: 'Outfit', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                No results for "{query}"
              </h2>
              <p style={{ color: 'var(--text-muted)' }}>Try a different title or keyword</p>
            </>
          ) : !query ? (
            <>
              <Search size={60} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
              <h2 style={{ fontFamily: 'Outfit', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Start searching
              </h2>
              <p style={{ color: 'var(--text-muted)' }}>Type a movie or TV show title to begin</p>
            </>
          ) : null}
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
