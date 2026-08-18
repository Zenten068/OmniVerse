import { useState, useEffect, useRef } from 'react';
import { getTVSeasonDetails, POSTER_SM, IMAGE_BASE } from '../api/tmdb';
import {
  Play, Tv, Server, Sun, Moon, Maximize2, Minimize2, RotateCcw,
  ChevronLeft, ChevronRight, CheckCircle2, Film, Sparkles, AlertCircle
} from 'lucide-react';

const SERVERS = [
  {
    id: 'vidking',
    name: 'VidKing (Primary HD)',
    tag: 'Fast / Recommended',
    movieUrl: (id) => `https://www.vidking.net/embed/movie/${id}`,
    tvUrl: (id, s, e) => `https://www.vidking.net/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: 'vidsrc-pro',
    name: 'VidSrc Pro',
    tag: 'Multi-Subtitles',
    movieUrl: (id) => `https://vidsrc.pro/embed/movie/${id}`,
    tvUrl: (id, s, e) => `https://vidsrc.pro/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: 'vidsrc-cc',
    name: 'VidSrc CC',
    tag: '1080p Stream',
    movieUrl: (id) => `https://vidsrc.cc/v2/embed/movie/${id}`,
    tvUrl: (id, s, e) => `https://vidsrc.cc/v2/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: 'autoembed',
    name: 'AutoEmbed',
    tag: 'Backup Server',
    movieUrl: (id) => `https://player.autoembed.cc/embed/movie/${id}`,
    tvUrl: (id, s, e) => `https://player.autoembed.cc/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: '2embed',
    name: '2Embed',
    tag: 'Server 5',
    movieUrl: (id) => `https://www.2embed.cc/embed/${id}`,
    tvUrl: (id, s, e) => `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`,
  },
];

export default function VidKingPlayer({ tmdbId, isTV, seasons = [], title, posterPath }) {
  const [selectedServer, setSelectedServer] = useState(SERVERS[0]);
  const [currentSeason, setCurrentSeason] = useState(1);
  const [currentEpisode, setCurrentEpisode] = useState(1);
  const [seasonData, setSeasonData] = useState(null);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [isDimmed, setIsDimmed] = useState(false);
  const [isTheater, setIsTheater] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const playerRef = useRef(null);

  // Filter out season 0 (Specials) if regular seasons exist, unless season 0 is all there is
  const filteredSeasons = seasons.filter(s => s.season_number > 0);
  const availableSeasons = filteredSeasons.length > 0 ? filteredSeasons : seasons;

  // Load Season Episodes if TV Series
  useEffect(() => {
    if (!isTV || !tmdbId) return;

    setLoadingEpisodes(true);
    getTVSeasonDetails(tmdbId, currentSeason)
      .then(res => {
        setSeasonData(res.data);
      })
      .catch(err => {
        console.error('Failed to load season data', err);
        setSeasonData(null);
      })
      .finally(() => setLoadingEpisodes(false));
  }, [tmdbId, isTV, currentSeason]);

  // Save to Continue Watching in localStorage
  useEffect(() => {
    if (!tmdbId || !title) return;
    try {
      const history = JSON.parse(localStorage.getItem('omni_continue_watching') || '[]');
      const updated = history.filter(item => item.tmdbId !== tmdbId);
      updated.unshift({
        tmdbId,
        isTV,
        title,
        posterPath,
        season: isTV ? currentSeason : null,
        episode: isTV ? currentEpisode : null,
        timestamp: Date.now(),
      });
      // keep max 20 entries
      localStorage.setItem('omni_continue_watching', JSON.stringify(updated.slice(0, 20)));
    } catch (e) {
      console.error('Error updating continue watching history', e);
    }
  }, [tmdbId, isTV, title, posterPath, currentSeason, currentEpisode]);

  const embedUrl = isTV
    ? selectedServer.tvUrl(tmdbId, currentSeason, currentEpisode)
    : selectedServer.movieUrl(tmdbId);

  const handleRefresh = () => {
    setIframeKey(prev => prev + 1);
  };

  const handleNextEpisode = () => {
    if (!seasonData?.episodes) return;
    if (currentEpisode < seasonData.episodes.length) {
      setCurrentEpisode(prev => prev + 1);
    } else {
      // Find next season if available
      const nextSeasonNum = currentSeason + 1;
      const nextSeasonExists = availableSeasons.some(s => s.season_number === nextSeasonNum);
      if (nextSeasonExists) {
        setCurrentSeason(nextSeasonNum);
        setCurrentEpisode(1);
      }
    }
  };

  const handlePrevEpisode = () => {
    if (currentEpisode > 1) {
      setCurrentEpisode(prev => prev - 1);
    } else if (currentSeason > 1) {
      const prevSeasonNum = currentSeason - 1;
      setCurrentSeason(prevSeasonNum);
      setCurrentEpisode(1);
    }
  };

  return (
    <div
      ref={playerRef}
      id="vidking-player-section"
      style={{
        margin: '2rem 0',
        position: 'relative',
        zIndex: isDimmed ? 1000 : 1,
      }}
    >
      {/* Light Dimmer Overlay */}
      {isDimmed && (
        <div
          onClick={() => setIsDimmed(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.92)',
            zIndex: 999,
            cursor: 'pointer',
            backdropFilter: 'blur(5px)',
          }}
        />
      )}

      {/* Main Player Box */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: isDimmed ? '0 0 50px rgba(0, 200, 150, 0.3)' : '0 20px 50px rgba(0,0,0,0.4)',
          position: 'relative',
          zIndex: isDimmed ? 1001 : 2,
          transition: 'all 0.3s ease',
          maxWidth: isTheater ? '100%' : '100%',
        }}
      >
        {/* Top Control Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.85rem 1.25rem',
            background: 'var(--bg-elevated)',
            borderBottom: '1px solid var(--border)',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'linear-gradient(135deg, var(--accent) 0%, #008f6b 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(0, 200, 150, 0.4)',
              }}
            >
              <Play size={16} fill="#0a0a0f" color="#0a0a0f" style={{ marginLeft: 2 }} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                Streaming Player
                <span className="badge badge-accent" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                  {selectedServer.name}
                </span>
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                {isTV ? `Season ${currentSeason} • Episode ${currentEpisode}` : title}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={handleRefresh}
              title="Reload Player"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '6px 10px',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: '0.8rem',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              <RotateCcw size={14} /> Refresh
            </button>

            <button
              onClick={() => setIsDimmed(!isDimmed)}
              title={isDimmed ? 'Turn Lights On' : 'Dim Lights'}
              style={{
                background: isDimmed ? 'var(--accent)' : 'var(--bg-card)',
                border: `1px solid ${isDimmed ? 'var(--accent)' : 'var(--border)'}`,
                color: isDimmed ? '#0a0a0f' : 'var(--text-secondary)',
                borderRadius: 8,
                padding: '6px 10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: '0.8rem',
                fontWeight: isDimmed ? 600 : 400,
                transition: 'all 0.2s',
              }}
            >
              {isDimmed ? <Sun size={14} /> : <Moon size={14} />} {isDimmed ? 'Lights On' : 'Dim Lights'}
            </button>

            <button
              onClick={() => setIsTheater(!isTheater)}
              title={isTheater ? 'Normal View' : 'Theater Mode'}
              style={{
                background: isTheater ? 'var(--accent-dim)' : 'var(--bg-card)',
                border: `1px solid ${isTheater ? 'var(--accent)' : 'var(--border)'}`,
                color: isTheater ? 'var(--accent)' : 'var(--text-secondary)',
                borderRadius: 8,
                padding: '6px 10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: '0.8rem',
                transition: 'all 0.2s',
              }}
            >
              {isTheater ? <Minimize2 size={14} /> : <Maximize2 size={14} />} {isTheater ? 'Compact' : 'Theater'}
            </button>
          </div>
        </div>

        {/* Server Selector Bar */}
        <div
          style={{
            padding: '0.75rem 1.25rem',
            background: 'rgba(0,0,0,0.3)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            overflowX: 'auto',
          }}
          className="scroll-row"
        >
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            <Server size={14} color="var(--accent)" /> Server:
          </span>
          {SERVERS.map(srv => {
            const isSelected = selectedServer.id === srv.id;
            return (
              <button
                key={srv.id}
                onClick={() => {
                  setSelectedServer(srv);
                  setIframeKey(k => k + 1);
                }}
                style={{
                  background: isSelected ? 'var(--accent)' : 'var(--bg-elevated)',
                  color: isSelected ? '#0a0a0f' : 'var(--text-secondary)',
                  border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 8,
                  padding: '6px 14px',
                  fontSize: '0.8rem',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 0 12px rgba(0, 200, 150, 0.35)' : 'none',
                }}
              >
                {srv.name}
                <span
                  style={{
                    fontSize: '0.65rem',
                    opacity: isSelected ? 0.85 : 0.6,
                    background: isSelected ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.08)',
                    padding: '2px 5px',
                    borderRadius: 4,
                  }}
                >
                  {srv.tag}
                </span>
              </button>
            );
          })}
        </div>

        {/* Video Player Frame Container */}
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, background: '#000' }}>
          <iframe
            key={`${selectedServer.id}-${tmdbId}-${currentSeason}-${currentEpisode}-${iframeKey}`}
            src={embedUrl}
            title={`${title} Stream`}
            allowFullScreen
            allow="autoplay; encrypted-media; picture-in-picture"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 'none',
            }}
          />
        </div>

        {/* TV Series Episode & Season Controls */}
        {isTV && (
          <div style={{ padding: '1.25rem', background: 'var(--bg-elevated)' }}>
            {/* Season Selector Tabs */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Tv size={16} color="var(--accent)" /> Select Season & Episode
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={handlePrevEpisode}
                    disabled={currentSeason === 1 && currentEpisode === 1}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      padding: '4px 10px',
                      fontSize: '0.8rem',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      opacity: currentSeason === 1 && currentEpisode === 1 ? 0.4 : 1,
                    }}
                  >
                    <ChevronLeft size={14} /> Prev Ep
                  </button>
                  <button
                    onClick={handleNextEpisode}
                    style={{
                      background: 'var(--accent-dim)',
                      border: '1px solid var(--accent)',
                      borderRadius: 8,
                      padding: '4px 10px',
                      fontSize: '0.8rem',
                      color: 'var(--accent)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    Next Ep <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* Seasons horizontal slider/tabs */}
              <div className="scroll-row" style={{ display: 'flex', gap: '0.5rem', paddingBottom: '0.25rem' }}>
                {availableSeasons.map(s => {
                  const isActive = currentSeason === s.season_number;
                  return (
                    <button
                      key={s.id || s.season_number}
                      onClick={() => {
                        setCurrentSeason(s.season_number);
                        setCurrentEpisode(1);
                      }}
                      style={{
                        background: isActive ? 'var(--accent)' : 'var(--bg-card)',
                        color: isActive ? '#0a0a0f' : 'var(--text-secondary)',
                        border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                        borderRadius: 8,
                        padding: '6px 14px',
                        fontSize: '0.8rem',
                        fontWeight: isActive ? 700 : 500,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                        transition: 'all 0.2s',
                      }}
                    >
                      Season {s.season_number}
                      {s.episode_count ? ` (${s.episode_count})` : ''}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Episode Grid List */}
            {loadingEpisodes ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Loading episodes for Season {currentSeason}...
              </div>
            ) : seasonData?.episodes ? (
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  Season {currentSeason} — {seasonData.episodes.length} Episodes
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                    gap: '0.75rem',
                    maxHeight: 340,
                    overflowY: 'auto',
                    paddingRight: 4,
                  }}
                >
                  {seasonData.episodes.map(ep => {
                    const isSelected = currentEpisode === ep.episode_number;
                    const stillUrl = ep.still_path ? `${IMAGE_BASE}/w300${ep.still_path}` : null;
                    return (
                      <div
                        key={ep.id}
                        onClick={() => setCurrentEpisode(ep.episode_number)}
                        style={{
                          background: isSelected ? 'var(--accent-dim)' : 'var(--bg-card)',
                          border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                          borderRadius: 12,
                          overflow: 'hidden',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          transition: 'all 0.2s',
                          position: 'relative',
                        }}
                        onMouseEnter={e => {
                          if (!isSelected) e.currentTarget.style.borderColor = 'rgba(0, 200, 150, 0.4)';
                        }}
                        onMouseLeave={e => {
                          if (!isSelected) e.currentTarget.style.borderColor = 'var(--border)';
                        }}
                      >
                        {/* Still Thumbnail */}
                        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#111' }}>
                          {stillUrl ? (
                            <img src={stillUrl} alt={ep.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                              <Film size={24} />
                            </div>
                          )}
                          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }} />

                          {/* Episode badge */}
                          <div style={{ position: 'absolute', bottom: 6, left: 8, fontSize: '0.75rem', fontWeight: 700, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
                            EP {ep.episode_number}
                          </div>

                          {isSelected && (
                            <div
                              style={{
                                position: 'absolute',
                                top: 6,
                                right: 6,
                                background: 'var(--accent)',
                                color: '#0a0a0f',
                                borderRadius: '50%',
                                width: 22,
                                height: 22,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Play size={12} fill="#0a0a0f" />
                            </div>
                          )}
                        </div>

                        {/* Title & info */}
                        <div style={{ padding: '0.6rem 0.75rem' }}>
                          <div
                            style={{
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              color: isSelected ? 'var(--accent)' : 'var(--text-primary)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {ep.episode_number}. {ep.name}
                          </div>
                          {ep.air_date && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
                              {ep.air_date}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Notice bar under player */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.5rem 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Sparkles size={12} color="var(--accent)" /> Streaming powered by VidKing API
        </span>
        <span>Having playback issues? Try switching to Server 2 or Server 3 above.</span>
      </div>
    </div>
  );
}
