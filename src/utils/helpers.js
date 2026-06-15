import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';

export const formatMessageTime = timestamp => {
  if (!timestamp) return '';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return format(date, 'HH:mm');
};

export const formatChatListTime = timestamp => {
  if (!timestamp) return '';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  
  if (isToday(date)) {
    return format(date, 'HH:mm');
  } else if (isYesterday(date)) {
    return 'Yesterday';
  } else {
    return format(date, 'dd/MM/yyyy');
  }
};

export const formatLastSeen = timestamp => {
  if (!timestamp) return 'Last seen recently';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  
  if (isToday(date)) {
    return `Last seen today at ${format(date, 'HH:mm')}`;
  } else if (isYesterday(date)) {
    return `Last seen yesterday at ${format(date, 'HH:mm')}`;
  }
  
  return `Last seen ${formatDistanceToNow(date, { addSuffix: true })}`;
};

export const getInitials = name => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const truncateText = (text, maxLength = 40) => {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};