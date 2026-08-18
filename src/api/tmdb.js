import axios from 'axios';

const API_KEY = 'e32046e21348a026b610cb6b8b988976';
const BASE_URL = 'https://api.themoviedb.org/3';

export const IMAGE_BASE = 'https://image.tmdb.org/t/p';
export const POSTER_SM = `${IMAGE_BASE}/w342`;
export const POSTER_MD = `${IMAGE_BASE}/w500`;
export const POSTER_LG = `${IMAGE_BASE}/w780`;
export const BACKDROP_LG = `${IMAGE_BASE}/w1280`;
export const BACKDROP_ORIG = `${IMAGE_BASE}/original`;

const tmdb = axios.create({
  baseURL: BASE_URL,
  params: { api_key: API_KEY, language: 'en-US' },
});

export const getTrending = (mediaType = 'all', timeWindow = 'day') =>
  tmdb.get(`/trending/${mediaType}/${timeWindow}`);

export const getTopRated = (mediaType = 'movie') =>
  tmdb.get(`/${mediaType}/top_rated`);

export const getUpcoming = () =>
  tmdb.get('/movie/upcoming');

export const getNowPlaying = () =>
  tmdb.get('/movie/now_playing');

export const getPopularTV = () =>
  tmdb.get('/tv/popular');

export const getMovieDetails = (id) =>
  tmdb.get(`/movie/${id}`, {
    params: { append_to_response: 'credits,videos,similar,reviews,watch/providers' },
  });

export const getTVDetails = (id) =>
  tmdb.get(`/tv/${id}`, {
    params: { append_to_response: 'credits,videos,similar,watch/providers' },
  });

export const getTVSeasonDetails = (id, seasonNumber) =>
  tmdb.get(`/tv/${id}/season/${seasonNumber}`);


export const searchMulti = (query, page = 1) =>
  tmdb.get('/search/multi', { params: { query, page, include_adult: false } });

export const discoverMovies = ({ page = 1, genre = '', sortBy = 'popularity.desc', year = '' } = {}) =>
  tmdb.get('/discover/movie', {
    params: {
      page,
      with_genres: genre,
      sort_by: sortBy,
      primary_release_year: year || undefined,
      include_adult: false,
    },
  });

export const discoverTV = ({ page = 1, genre = '', sortBy = 'popularity.desc' } = {}) =>
  tmdb.get('/discover/tv', {
    params: {
      page,
      with_genres: genre,
      sort_by: sortBy,
    },
  });

export const getGenres = (mediaType = 'movie') =>
  tmdb.get(`/genre/${mediaType}/list`);

export const getPersonDetails = (personId) =>
  tmdb.get(`/person/${personId}`);

export const getPersonCredits = (personId) =>
  tmdb.get(`/person/${personId}/combined_credits`);

export default tmdb;
