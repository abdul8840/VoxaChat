import { createSlice } from '@reduxjs/toolkit';
import { Appearance } from 'react-native';

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    mode: Appearance.getColorScheme() || 'light',
  },
  reducers: {
    toggleTheme: state => {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
    },
    setTheme: (state, action) => {
      state.mode = action.payload;
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export const selectThemeMode = state => state.theme.mode;

export default themeSlice.reducer;