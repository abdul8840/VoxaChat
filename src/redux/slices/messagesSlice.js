import { createSlice } from '@reduxjs/toolkit';

const messagesSlice = createSlice({
  name: 'messages',
  initialState: {
    messagesByChatId: {},
    loadingByChatId: {},
    sendingMessage: false,
  },
  reducers: {
    setMessages: (state, action) => {
      const { chatId, messages } = action.payload;
      state.messagesByChatId[chatId] = messages;
      state.loadingByChatId[chatId] = false;
    },
    appendMessages: (state, action) => {
      const { chatId, messages } = action.payload;
      const existing = state.messagesByChatId[chatId] || [];
      state.messagesByChatId[chatId] = [...messages, ...existing];
    },
    setMessagesLoading: (state, action) => {
      const { chatId, loading } = action.payload;
      state.loadingByChatId[chatId] = loading;
    },
    setSendingMessage: (state, action) => {
      state.sendingMessage = action.payload;
    },
    clearChatMessages: (state, action) => {
      delete state.messagesByChatId[action.payload];
    },
  },
});

export const {
  setMessages,
  appendMessages,
  setMessagesLoading,
  setSendingMessage,
  clearChatMessages,
} = messagesSlice.actions;

export const selectMessages = chatId => state =>
  state.messages.messagesByChatId[chatId] || [];
export const selectMessagesLoading = chatId => state =>
  state.messages.loadingByChatId[chatId] || false;
export const selectSendingMessage = state => state.messages.sendingMessage;

export default messagesSlice.reducer;