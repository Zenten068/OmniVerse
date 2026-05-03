import { configureStore } from '@reduxjs/toolkit';
import watchlistReducer from '../features/watchlist/watchlistSlice';
import themeReducer from '../features/theme/themeSlice';
import authReducer from '../features/auth/authSlice';

const store = configureStore({
  reducer: {
    watchlist: watchlistReducer,
    theme: themeReducer,
    auth: authReducer,
  },
});

export default store;
