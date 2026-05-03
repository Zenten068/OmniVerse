import { createSlice } from '@reduxjs/toolkit';

const saved = localStorage.getItem('omniverse_theme') || 'dark';

const themeSlice = createSlice({
  name: 'theme',
  initialState: { mode: saved },
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'dark' ? 'light' : 'dark';
      localStorage.setItem('omniverse_theme', state.mode);
    },
    setTheme: (state, action) => {
      state.mode = action.payload;
      localStorage.setItem('omniverse_theme', state.mode);
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export const selectTheme = (state) => state.theme.mode;
export default themeSlice.reducer;
