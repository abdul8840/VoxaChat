import { useEffect, useRef, useCallback } from 'react';
import { firestoreService } from '@services/firebase/firestoreService';
import { TYPING_TIMEOUT } from '@utils/constants';

export const useTyping = (chatId, currentUserId) => {
  const typingTimeoutRef = useRef(null);

  const setTypingStatus = useCallback(async isTyping => {
    if (!chatId || !currentUserId) {
      return;
    }

    try {
      await firestoreService.updateTypingStatus(chatId, currentUserId, isTyping);
    } catch (error) {
      console.warn('Failed to update typing status:', error);
    }
  }, [chatId, currentUserId]);

  const startTyping = useCallback(async () => {
    await setTypingStatus(true);
    
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(async () => {
      await setTypingStatus(false);
    }, TYPING_TIMEOUT);
  }, [setTypingStatus]);

  const stopTyping = useCallback(async () => {
    clearTimeout(typingTimeoutRef.current);
    await setTypingStatus(false);
  }, [setTypingStatus]);

  useEffect(() => {
    return () => {
      clearTimeout(typingTimeoutRef.current);
      if (chatId && currentUserId) {
        setTypingStatus(false);
      }
    };
  }, [chatId, currentUserId, setTypingStatus]);

  return { startTyping, stopTyping };
};
