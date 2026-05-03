import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';

export default function MovieRow({ title, items = [], loading = false, icon }) {
  const rowRef = useRef(null);

  const scroll = (dir) => {
    if (rowRef.current) {
      rowRef.current.scrollBy({ left: dir * 600, behavior: 'smooth' });
    }
  };

  const skeletons = Array(8).fill(null);

  return (
    <section style={{ marginBottom: '2.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {icon && <span style={{ color: 'var(--accent)' }}>{icon}</span>}
          <h2 style={{ fontFamily: 'Outfit', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {title}
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button onClick={() => scroll(-1)} className="btn-ghost" style={{ borderRadius: '8px', padding: '0.4rem', display: 'flex' }} id={`row-prev-${title}`}>
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => scroll(1)} className="btn-ghost" style={{ borderRadius: '8px', padding: '0.4rem', display: 'flex' }} id={`row-next-${title}`}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div ref={rowRef} className="scroll-row" style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        {loading
          ? skeletons.map((_, i) => (
            <div key={i} className="skeleton" style={{ width: 180, aspectRatio: '2/3', borderRadius: 12, flexShrink: 0 }} />
          ))
          : items.map(item => (
            <MovieCard key={`${item.id}-${item.media_type}`} item={item} size="md" />
          ))
        }
      </div>
    </section>
  );
}
