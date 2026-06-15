import { createSlice } from '@reduxjs/toolkit';

const chatsSlice = createSlice({
  name: 'chats',
  initialState: {
    chats: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    setChats: (state, action) => {
      state.chats = action.payload;
      state.isLoading = false;
    },
    setChatsLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setChatsError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    updateChat: (state, action) => {
      const index = state.chats.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.chats[index] = action.payload;
      }
    },
  },
});

export const { setChats, setChatsLoading, setChatsError, updateChat } = 
  chatsSlice.actions;

export const selectChats = state => state.chats.chats;
export const selectChatsLoading = state => state.chats.isLoading;

export default chatsSlice.reducer;