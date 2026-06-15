import { createSlice } from '@reduxjs/toolkit';

const presenceSlice = createSlice({
  name: 'presence',
  initialState: {
    onlineUsers: {},
  },
  reducers: {
    setUserPresence: (state, action) => {
      const { uid, isOnline, lastSeen } = action.payload;
      state.onlineUsers[uid] = { isOnline, lastSeen };
    },
    removeUserPresence: (state, action) => {
      delete state.onlineUsers[action.payload];
    },
  },
});

export const { setUserPresence, removeUserPresence } = presenceSlice.actions;

export const selectUserPresence = uid => state =>
  state.presence.onlineUsers[uid];

export default presenceSlice.reducer;