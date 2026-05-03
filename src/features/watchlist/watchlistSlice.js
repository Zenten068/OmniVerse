import { createSlice } from '@reduxjs/toolkit';

const saved = JSON.parse(localStorage.getItem('omniverse_watchlist') || '[]');

const watchlistSlice = createSlice({
  name: 'watchlist',
  initialState: { items: saved },
  reducers: {
    addToWatchlist: (state, action) => {
      const exists = state.items.find(i => i.id === action.payload.id);
      if (!exists) {
        state.items.push(action.payload);
        localStorage.setItem('omniverse_watchlist', JSON.stringify(state.items));
      }
    },
    removeFromWatchlist: (state, action) => {
      state.items = state.items.filter(i => i.id !== action.payload);
      localStorage.setItem('omniverse_watchlist', JSON.stringify(state.items));
    },
  },
});

export const { addToWatchlist, removeFromWatchlist } = watchlistSlice.actions;
export const selectWatchlist = (state) => state.watchlist.items;
export const selectIsInWatchlist = (id) => (state) =>
  state.watchlist.items.some(i => i.id === id);
export default watchlistSlice.reducer;
