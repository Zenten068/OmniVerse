import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectTheme, toggleTheme } from '../features/theme/themeSlice';
import { selectIsAuthenticated, selectUser, logout } from '../features/auth/authSlice';
import { selectWatchlist } from '../features/watchlist/watchlistSlice';
import { searchMulti } from '../api/tmdb';
import useDebounce from '../hooks/useDebounce';
import {
  Sun, Moon, Search, Bookmark, User, LogOut, ChevronDown,
  Film, Compass, X, Menu, Tv, Star, TrendingUp
} from 'lucide-react';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useSelector(selectTheme);
  const isAuth = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const watchlist = useSelector(selectWatchlist);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const searchRef = useRef(null);
  const debouncedQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!debouncedQuery.trim()) { setSearchResults([]); return; }
    setSearching(true);
    searchMulti(debouncedQuery, 1)
      .then(res => setSearchResults(res.data.results.slice(0, 6)))
      .catch(() => { })
      .finally(() => setSearching(false));
  }, [debouncedQuery]);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: <Film size={16} /> },
    { to: '/explore', label: 'Explore', icon: <Compass size={16} /> },
    { to: '/watchlist', label: 'Watchlist', icon: <Bookmark size={16} />, badge: watchlist.length },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <nav
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
          background: scrolled ? 'var(--bg-secondary)' : 'transparent',
          borderBottom: scrolled ? '1px solid var(--border)' : 'none',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          transition: 'all 0.3s ease',
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', height: '64px', gap: '1.5rem' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', flexShrink: 0 }}>
            <div style={{
              width: 32, height: 32,
              background: 'linear-gradient(135deg, #00c896, #00e6ae)',
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 15px rgba(0,200,150,0.4)',
            }}>
              <Film size={18} color="#0a0a0f" strokeWidth={2.5} />
            </div>
            <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.3rem', background: 'linear-gradient(135deg,#00c896,#7fff72)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              OmniVerse
            </span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 1 }} className="nav-links-desktop">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.4rem 0.85rem', borderRadius: '8px', textDecoration: 'none',
                fontSize: '0.875rem', fontWeight: 500, position: 'relative',
                color: isActive(link.to) ? 'var(--accent)' : 'var(--text-secondary)',
                background: isActive(link.to) ? 'var(--accent-dim)' : 'transparent',
                border: isActive(link.to) ? '1px solid rgba(0,200,150,0.2)' : '1px solid transparent',
                transition: 'all 0.2s ease',
              }}>
                {link.icon}
                {link.label}
                {link.badge > 0 && (
                  <span style={{
                    background: 'var(--accent)', color: '#0a0a0f',
                    fontSize: '0.65rem', fontWeight: 700,
                    borderRadius: '9999px', padding: '1px 6px',
                    minWidth: 18, textAlign: 'center',
                  }}>{link.badge}</span>
                )}
              </Link>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            <button
              onClick={() => { setSearchOpen(s => !s); setTimeout(() => searchRef.current?.focus(), 100); }}
              style={{
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', borderRadius: '8px',
                padding: '0.45rem 0.7rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                fontSize: '0.8rem', transition: 'all 0.2s ease',
              }}
              id="navbar-search-btn"
            >
              <Search size={16} />
              <span style={{ display: 'none' }} className="search-label">Search</span>
            </button>

            <button
              onClick={() => dispatch(toggleTheme())}
              id="theme-toggle"
              style={{
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', borderRadius: '8px',
                padding: '0.45rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {isAuth ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserMenuOpen(o => !o)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    borderRadius: '8px', padding: '0.35rem 0.7rem',
                    cursor: 'pointer', color: 'var(--text-primary)',
                    transition: 'all 0.2s ease',
                  }}
                  id="user-menu-btn"
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'linear-gradient(135deg,#00c896,#00b085)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 700, color: '#0a0a0f',
                  }}>
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 500, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.name?.split(' ')[0] || 'User'}
                  </span>
                  <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
                </button>

                {userMenuOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: '12px', overflow: 'hidden', minWidth: 180,
                    boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
                    zIndex: 100,
                  }}>
                    <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.email}</div>
                    </div>
                    <Link to="/watchlist" onClick={() => setUserMenuOpen(false)} style={{
                      display: 'flex', alignItems: 'center', gap: '0.6rem',
                      padding: '0.65rem 1rem', textDecoration: 'none',
                      color: 'var(--text-secondary)', fontSize: '0.85rem',
                      transition: 'all 0.2s', cursor: 'pointer',
                    }}>
                      <Bookmark size={15} /> My Watchlist
                    </Link>
                    <button onClick={() => { dispatch(logout()); setUserMenuOpen(false); navigate('/'); }} style={{
                      display: 'flex', alignItems: 'center', gap: '0.6rem',
                      padding: '0.65rem 1rem', width: '100%', textAlign: 'left',
                      color: 'var(--danger)', fontSize: '0.85rem', background: 'none',
                      border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                    }}>
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.45rem 1rem', borderRadius: '8px', textDecoration: 'none',
                fontSize: '0.85rem', fontWeight: 600,
                background: 'linear-gradient(135deg,#00c896,#00b085)',
                color: '#0a0a0f',
              }}>
                <User size={15} /> Sign In
              </Link>
            )}

            <button
              onClick={() => setMenuOpen(o => !o)}
              style={{
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', borderRadius: '8px',
                padding: '0.45rem', cursor: 'pointer',
                display: 'none', alignItems: 'center',
              }}
              className="mobile-menu-btn"
              id="mobile-menu-btn"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div style={{
            background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)',
            padding: '1rem 1.5rem',
          }}>
            <form onSubmit={handleSearchSubmit} style={{ position: 'relative', maxWidth: 600, margin: '0 auto' }}>
              <Search size={18} style={{
                position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }} />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search movies, TV shows..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem',
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: '12px', color: 'var(--text-primary)',
                  fontSize: '0.95rem', outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
                id="navbar-search-input"
              />
              {searchQuery && (
                <button type="button" onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                  style={{
                    position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                  }}>
                  <X size={16} />
                </button>
              )}
            </form>

            {searchResults.length > 0 && (
              <div style={{
                maxWidth: 600, margin: '0.5rem auto 0',
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: '12px', overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
              }}>
                {searchResults.map(item => (
                  <Link
                    key={item.id}
                    to={item.media_type === 'tv' ? `/tv/${item.id}` : `/movie/${item.id}`}
                    onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults([]); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.6rem 1rem', textDecoration: 'none',
                      borderBottom: '1px solid var(--border)',
                      color: 'var(--text-primary)', transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {item.poster_path ? (
                      <img src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} alt=""
                        style={{ width: 32, height: 46, borderRadius: 4, objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 32, height: 46, borderRadius: 4, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {item.media_type === 'tv' ? <Tv size={14} color="var(--text-muted)" /> : <Film size={14} color="var(--text-muted)" />}
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{item.title || item.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span className="badge badge-accent">{item.media_type === 'tv' ? 'TV' : 'Movie'}</span>
                        {item.vote_average > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Star size={11} color="var(--gold)" fill="var(--gold)" /> {item.vote_average.toFixed(1)}</span>}
                      </div>
                    </div>
                  </Link>
                ))}
                <Link
                  to={`/search?q=${encodeURIComponent(searchQuery)}`}
                  onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults([]); }}
                  style={{
                    display: 'block', textAlign: 'center', padding: '0.65rem',
                    color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 600,
                    textDecoration: 'none', background: 'var(--bg-elevated)',
                  }}>
                  See all results for "{searchQuery}"
                </Link>
              </div>
            )}
          </div>
        )}

        {menuOpen && (
          <div style={{
            background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)',
            padding: '0.75rem 1rem',
          }}>
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                padding: '0.7rem 1rem', borderRadius: '8px', textDecoration: 'none',
                color: isActive(link.to) ? 'var(--accent)' : 'var(--text-secondary)',
                background: isActive(link.to) ? 'var(--accent-dim)' : 'transparent',
                marginBottom: '0.25rem', fontSize: '0.9rem', fontWeight: 500,
              }}>
                {link.icon} {link.label}
                {link.badge > 0 && <span style={{ background: 'var(--accent)', color: '#0a0a0f', fontSize: '0.65rem', fontWeight: 700, borderRadius: 9999, padding: '1px 6px' }}>{link.badge}</span>}
              </Link>
            ))}
          </div>
        )}
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .nav-links-desktop { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .search-label { display: none !important; }
        }
        @media (min-width: 769px) {
          .mobile-menu-btn { display: none !important; }
          .search-label { display: inline !important; }
        }
      `}</style>
    </>
  );
}
