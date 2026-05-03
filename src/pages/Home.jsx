import { useEffect, useState, lazy, Suspense } from 'react';
import { getTrending, getTopRated, discoverMovies, getPopularTV, getNowPlaying } from '../api/tmdb';
import HeroSection from '../components/HeroSection';
import MovieRow from '../components/MovieRow';
import { TrendingUp, Star, Sparkles, Tv, Clapperboard } from 'lucide-react';

export default function Home() {
  const [trending, setTrending] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [animation, setAnimation] = useState([]);
  const [popularTV, setPopularTV] = useState([]);
  const [nowPlaying, setNowPlaying] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'OmniVerse — Discover Movies & TV Shows';
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

  return (
    <div>
      <HeroSection items={trending} />

      <div style={{ paddingTop: '2rem' }}>
        <MovieRow title="Trending Today" items={trending} loading={loading} icon={<TrendingUp size={20} />} />
        <MovieRow title="Now Playing" items={nowPlaying} loading={loading} icon={<Clapperboard size={20} />} />
        <MovieRow title="Top Rated Movies" items={topRated} loading={loading} icon={<Star size={20} />} />
        <MovieRow title="Popular on TV" items={popularTV} loading={loading} icon={<Tv size={20} />} />
        <MovieRow title="Animation" items={animation} loading={loading} icon={<Sparkles size={20} />} />
      </div>
    </div>
  );
}
