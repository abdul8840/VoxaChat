import { useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { firestoreService } from '@services/firebase/firestoreService';
import {
  setMessages,
  setMessagesLoading,
  appendMessages,
  selectMessages,
  selectMessagesLoading,
} from '@redux/slices/messagesSlice';
import { PAGINATION } from '@utils/constants';

export const useMessages = (chatId, currentUserId, otherUserId) => {
  const dispatch = useDispatch();
  const messages = useSelector(selectMessages(chatId));
  const isLoading = useSelector(selectMessagesLoading(chatId));
  const hasMoreRef = useRef(true);
  const isLoadingMoreRef = useRef(false);

  useEffect(() => {
    if (!chatId) return;
    
    dispatch(setMessagesLoading({ chatId, loading: true }));

    const unsubscribe = firestoreService.onMessagesChanged(
      chatId,
      fetchedMessages => {
        dispatch(setMessages({ chatId, messages: fetchedMessages }));
        
        // Mark messages as read
        if (otherUserId) {
          firestoreService.resetUnreadCount(chatId, currentUserId);
        }
      },
      PAGINATION.MESSAGES_PER_PAGE,
      () => {
        dispatch(setMessagesLoading({ chatId, loading: false }));
      }
    );

    return unsubscribe;
  }, [chatId, dispatch, currentUserId, otherUserId]);

  const loadMoreMessages = useCallback(async () => {
    if (!hasMoreRef.current || isLoadingMoreRef.current || !messages.length) {
      return;
    }

    isLoadingMoreRef.current = true;
    const oldestMessage = messages[0];
    
    if (!oldestMessage?.timestamp) {
      isLoadingMoreRef.current = false;
      return;
    }

    try {
      const olderMessages = await firestoreService.loadMoreMessages(
        chatId,
        oldestMessage.timestamp,
        PAGINATION.MESSAGES_PER_PAGE
      );

      if (olderMessages.length < PAGINATION.MESSAGES_PER_PAGE) {
        hasMoreRef.current = false;
      }

      if (olderMessages.length > 0) {
        dispatch(appendMessages({ chatId, messages: olderMessages }));
      }
    } catch (error) {
      console.warn('Failed to load older messages:', error);
    } finally {
      isLoadingMoreRef.current = false;
    }
  }, [chatId, messages, dispatch]);

  return { messages, isLoading, loadMoreMessages };
};
