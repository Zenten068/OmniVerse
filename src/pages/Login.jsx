import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../features/auth/authSlice';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Film, Eye, EyeOff, User, Mail, Lock, ArrowRight } from 'lucide-react';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { document.title = `${mode === 'login' ? 'Sign In' : 'Create Account'} — OmniVerse`; }, [mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields'); return; }
    if (mode === 'register' && !name) { setError('Please enter your name'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    dispatch(login({
      id: Date.now(),
      name: mode === 'register' ? name : email.split('@')[0],
      email,
      avatar: null,
    }));
    setLoading(false);
    navigate(from, { replace: true });
  };

  const inputStyle = {
    width: '100%', padding: '0.8rem 1rem 0.8rem 2.75rem',
    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    borderRadius: 12, color: 'var(--text-primary)',
    fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit',
    transition: 'all 0.2s',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem', background: 'var(--bg-primary)' }}>
      <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(0,200,150,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', marginBottom: '1rem' }}>
            <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg,#00c896,#00e6ae)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(0,200,150,0.4)' }}>
              <Film size={22} color="#0a0a0f" strokeWidth={2.5} />
            </div>
            <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.5rem', background: 'linear-gradient(135deg,#00c896,#7fff72)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>OmniVerse</span>
          </Link>
          <h2 style={{ fontFamily: 'Outfit', fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {mode === 'login' ? 'Sign in to access your Watchlist' : 'Join OmniVerse to track your favorites'}
          </p>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '2rem' }}>
          <div style={{ display: 'flex', background: 'var(--bg-elevated)', borderRadius: 12, padding: 4, marginBottom: '1.75rem' }}>
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); }}
                id={`auth-mode-${m}`}
                style={{
                  flex: 1, padding: '0.6rem', borderRadius: 10, border: 'none', cursor: 'pointer',
                  fontWeight: 600, fontSize: '0.875rem',
                  background: mode === m ? 'var(--accent)' : 'transparent',
                  color: mode === m ? '#0a0a0f' : 'var(--text-muted)',
                  transition: 'all 0.2s',
                }}
              >{m === 'login' ? 'Sign In' : 'Sign Up'}</button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {mode === 'register' && (
              <div style={{ position: 'relative' }}>
                <User size={17} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-dim)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                  id="auth-name-input" />
              </div>
            )}

            <div style={{ position: 'relative' }}>
              <Mail size={17} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle}
                onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-dim)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                id="auth-email-input" />
            </div>

            <div style={{ position: 'relative' }}>
              <Lock size={17} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type={showPw ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{ ...inputStyle, paddingRight: '2.75rem' }}
                onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-dim)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                id="auth-password-input" />
              <button type="button" onClick={() => setShowPw(s => !s)} style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && (
              <div style={{ background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.3)', borderRadius: 10, padding: '0.65rem 1rem', color: 'var(--danger)', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} id="auth-submit-btn"
              style={{
                width: '100%', padding: '0.85rem', borderRadius: 12,
                background: loading ? 'var(--bg-elevated)' : 'linear-gradient(135deg,#00c896,#00b085)',
                color: loading ? 'var(--text-muted)' : '#0a0a0f',
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 700, fontSize: '0.95rem', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                transition: 'all 0.2s', marginTop: '0.25rem',
              }}
            >
              {loading ? 'Signing in...' : (<>{mode === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight size={17} /></>)}
            </button>
          </form>

          <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'var(--bg-elevated)', borderRadius: 10 }}>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>Demo credentials:</p>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Email: demo@omniverse.app</p>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Password: demo123</p>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <Link to="/" style={{ color: 'var(--accent)', textDecoration: 'none' }}>← Back to browsing</Link>
        </p>
      </div>
    </div>
  );
}
