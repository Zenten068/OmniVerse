import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPersonDetails, getPersonCredits, IMAGE_BASE } from '../api/tmdb';
import MovieCard from '../components/MovieCard';
import {
  ArrowLeft, Loader2, Users, Calendar, Star,
  Film, Tv, Globe, Clapperboard,
} from 'lucide-react';

export default function ActorPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [person, setPerson] = useState(null);
  const [credits, setCredits] = useState([]);
  const [directed, setDirected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [bioExpanded, setBioExpanded] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setPerson(null);
    setCredits([]);

    Promise.all([getPersonDetails(id), getPersonCredits(id)])
      .then(([personRes, creditsRes]) => {
        setPerson(personRes.data);
        document.title = `${personRes.data.name} — OmniVerse`;

        // Cast credits — deduplicated & sorted by release date (newest first)
        const seenCast = new Set();
        const deduped = creditsRes.data.cast
          .filter(item => {
            const key = `${item.id}-${item.media_type}`;
            if (seenCast.has(key)) return false;
            seenCast.add(key);
            return true;
          })
          .sort((a, b) => {
            const dateA = a.release_date || a.first_air_date || '';
            const dateB = b.release_date || b.first_air_date || '';
            return dateB.localeCompare(dateA);
          });
        setCredits(deduped);

        // Crew credits — Director jobs only, deduplicated & sorted
        const seenDir = new Set();
        const directedItems = (creditsRes.data.crew || [])
          .filter(item => {
            if (item.job !== 'Director') return false;
            const key = `${item.id}-${item.media_type}`;
            if (seenDir.has(key)) return false;
            seenDir.add(key);
            return true;
          })
          .sort((a, b) => {
            const dateA = a.release_date || a.first_air_date || '';
            const dateB = b.release_date || b.first_air_date || '';
            return dateB.localeCompare(dateA);
          });
        setDirected(directedItems);
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <Loader2 size={48} color="var(--accent)" style={{ animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!person) return null;

  const profileUrl = person.profile_path ? `${IMAGE_BASE}/w342${person.profile_path}` : null;
  const age = person.birthday
    ? Math.floor((new Date() - new Date(person.birthday)) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  const BIO_LIMIT = 400;
  const bio = person.biography || '';
  const bioTruncated = bio.length > BIO_LIMIT && !bioExpanded;

  const filtered = filter === 'all' ? credits : credits.filter(c => c.media_type === filter);
  const movieCount = credits.filter(c => c.media_type === 'movie').length;
  const tvCount = credits.filter(c => c.media_type === 'tv').length;

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
      {/* Hero gradient banner */}
      <div style={{
        height: 220,
        background: 'linear-gradient(135deg, var(--accent-dim) 0%, rgba(0,200,150,0.08) 50%, var(--bg-primary) 100%)',
        position: 'relative',
      }}>
        <button
          onClick={() => navigate(-1)}
          id="actor-back-btn"
          style={{
            position: 'absolute', top: 80, left: '1.5rem',
            background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 10, padding: '0.5rem 1rem',
            color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
            fontSize: '0.85rem', backdropFilter: 'blur(8px)', transition: 'all 0.2s',
          }}
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Profile card */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gap: '2.5rem',
            marginTop: -120,
            position: 'relative',
            zIndex: 10,
            alignItems: 'start',
          }}
          className="actor-grid"
        >
          {/* Avatar */}
          <div style={{ flexShrink: 0 }} className="actor-avatar-wrap">
            {profileUrl ? (
              <img
                src={profileUrl}
                alt={person.name}
                style={{
                  width: 200, borderRadius: 16,
                  boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
                  display: 'block', border: '3px solid var(--accent)',
                }}
              />
            ) : (
              <div style={{
                width: 200, height: 300, borderRadius: 16,
                background: 'var(--bg-elevated)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '3px solid var(--accent)',
              }}>
                <Users size={60} color="var(--text-muted)" />
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ paddingTop: '7rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <span className="badge badge-accent">{person.known_for_department || 'Acting'}</span>
              {person.gender === 1 && (
                <span className="badge" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>Female</span>
              )}
              {person.gender === 2 && (
                <span className="badge" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>Male</span>
              )}
            </div>

            <h1 style={{
              fontFamily: 'Outfit',
              fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
              fontWeight: 900,
              color: 'var(--text-primary)',
              lineHeight: 1.1,
              marginBottom: '1rem',
            }}>
              {person.name}
            </h1>

            <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              {person.birthday && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <Calendar size={15} />
                  {new Date(person.birthday).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  {age !== null && ` (age ${age})`}
                </div>
              )}
              {person.place_of_birth && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <Globe size={15} /> {person.place_of_birth}
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <Star size={15} color="var(--gold)" fill="var(--gold)" />
                Popularity {person.popularity?.toFixed(1)}
              </div>
            </div>

            {/* Stat chips */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              {[
                { label: 'Movies', count: movieCount, icon: <Film size={14} /> },
                { label: 'TV Shows', count: tvCount, icon: <Tv size={14} /> },
                ...(directed.length > 0 ? [{ label: 'Directed', count: directed.length, icon: <Clapperboard size={14} /> }] : []),
              ].map(s => (
                <div key={s.label} style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '0.35rem 0.75rem',
                  fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600,
                }}>
                  {s.icon}
                  <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{s.count}</span>&nbsp;{s.label}
                </div>
              ))}
            </div>

            {/* Biography */}
            {bio && (
              <div>
                <p style={{
                  color: 'var(--text-secondary)',
                  lineHeight: 1.8,
                  fontSize: '0.95rem',
                  maxWidth: 680,
                  marginBottom: '0.5rem',
                }}>
                  {bioTruncated ? bio.slice(0, BIO_LIMIT) + '…' : bio}
                </p>
                {bio.length > BIO_LIMIT && (
                  <button
                    onClick={() => setBioExpanded(v => !v)}
                    style={{
                      background: 'none', border: 'none',
                      color: 'var(--accent)', cursor: 'pointer',
                      fontSize: '0.9rem', fontWeight: 600, padding: 0,
                    }}
                    id="bio-expand-btn"
                  >
                    {bioExpanded ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Filmography */}
        <section style={{ marginTop: '3.5rem' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem',
          }}>
            <h2 style={{
              fontFamily: 'Outfit', fontSize: '1.4rem', fontWeight: 700,
              color: 'var(--text-primary)',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <Film size={20} color="var(--accent)" />
              Filmography
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                ({filtered.length})
              </span>
            </h2>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[
                { key: 'all', label: 'All' },
                { key: 'movie', label: 'Movies' },
                { key: 'tv', label: 'TV Shows' },
              ].map(tab => (
                <button
                  key={tab.key}
                  id={`actor-filter-${tab.key}`}
                  onClick={() => setFilter(tab.key)}
                  style={{
                    padding: '0.45rem 1rem',
                    borderRadius: 8,
                    border: `1px solid ${filter === tab.key ? 'var(--accent)' : 'var(--border)'}`,
                    background: filter === tab.key ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                    color: filter === tab.key ? 'var(--accent)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: filter === tab.key ? 700 : 400,
                    transition: 'all 0.2s',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4rem 0' }}>
              No {filter === 'tv' ? 'TV shows' : 'movies'} found for this actor.
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '1.25rem',
            }}>
              {filtered.map(item => (
                <MovieCard
                  key={`${item.id}-${item.media_type}`}
                  item={{ ...item, media_type: item.media_type || 'movie' }}
                  size="sm"
                />
              ))}
            </div>
          )}
        </section>
        {/* Directed section — only shown when they have director credits */}
        {directed.length > 0 && (
          <section style={{ marginTop: '3.5rem' }}>
            {/* Divider */}
            <div style={{
              height: 1,
              background: 'linear-gradient(to right, var(--accent), transparent)',
              marginBottom: '2rem',
              opacity: 0.35,
            }} />

            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem',
            }}>
              <h2 style={{
                fontFamily: 'Outfit', fontSize: '1.4rem', fontWeight: 700,
                color: 'var(--text-primary)',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                <Clapperboard size={20} color="var(--accent)" />
                Directed
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                  ({directed.length})
                </span>
              </h2>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '1.25rem',
            }}>
              {directed.map(item => (
                <MovieCard
                  key={`dir-${item.id}-${item.media_type}`}
                  item={{ ...item, media_type: item.media_type || 'movie' }}
                  size="sm"
                />
              ))}
            </div>
          </section>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 700px) {
          .actor-avatar-wrap { display: none !important; }
          .actor-grid { grid-template-columns: 1fr !important; margin-top: -60px !important; }
        }
      `}</style>
    </div>
  );
}
