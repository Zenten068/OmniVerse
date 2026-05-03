import { Link } from 'react-router-dom';
import { Film, GitFork, Link2, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border)',
      padding: '3rem 1.5rem 2rem',
      marginTop: '4rem',
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{
                width: 32, height: 32,
                background: 'linear-gradient(135deg,#00c896,#00e6ae)',
                borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Film size={18} color="#0a0a0f" strokeWidth={2.5} />
              </div>
              <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.2rem', background: 'linear-gradient(135deg,#00c896,#7fff72)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                OmniVerse
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6, maxWidth: 240 }}>
              Your ultimate media discovery hub. Explore, track, and never miss a great film or series.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Navigate</h4>
            {[{ to: '/', label: 'Home' }, { to: '/explore', label: 'Explore' }, { to: '/search', label: 'Search' }, { to: '/watchlist', label: 'Watchlist' }].map(l => (
              <Link key={l.to} to={l.to} style={{ display: 'block', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '0.5rem', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >{l.label}</Link>
            ))}
          </div>

          <div>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Legal</h4>
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(l => (
              <span key={l} style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem', cursor: 'pointer' }}>{l}</span>
            ))}
          </div>


        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            © 2026 OmniVerse. Powered by <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>TMDB</a>.
          </span>
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Made by <a href="https://github.com/Zenten068" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Aman Saklani</a>.
          </span>
        </div>
      </div>
    </footer>
  );
}
