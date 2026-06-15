import { useEffect, useRef, useCallback } from 'react';
import { firestoreService } from '@services/firebase/firestoreService';
import { TYPING_TIMEOUT } from '@utils/constants';

export const useTyping = (chatId, currentUserId) => {
  const typingTimeoutRef = useRef(null);

  const startTyping = useCallback(async () => {
    await firestoreService.updateTypingStatus(chatId, currentUserId, true);
    
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(async () => {
      await firestoreService.updateTypingStatus(chatId, currentUserId, false);
    }, TYPING_TIMEOUT);
  }, [chatId, currentUserId]);

  const stopTyping = useCallback(async () => {
    clearTimeout(typingTimeoutRef.current);
    await firestoreService.updateTypingStatus(chatId, currentUserId, false);
  }, [chatId, currentUserId]);

  useEffect(() => {
    return () => {
      clearTimeout(typingTimeoutRef.current);
      if (chatId && currentUserId) {
        firestoreService.updateTypingStatus(chatId, currentUserId, false);
      }
    };
  }, [chatId, currentUserId]);

  return { startTyping, stopTyping };
};