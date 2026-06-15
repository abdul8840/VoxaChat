import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { selectThemeMode } from '@redux/slices/themeSlice';
import { lightTheme, darkTheme } from '@theme';
import { Avatar } from '@components/common/Avatar';
import { truncateText, formatChatListTime } from '@utils/helpers';
import { MESSAGE_TYPES } from '@utils/constants';

const ChatListItem = memo(({ chat, otherUser, currentUserId, onPress }) => {
  const themeMode = useSelector(selectThemeMode);
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;
  const unreadCount = chat?.unreadCount?.[currentUserId] || 0;
  const lastMessage = chat?.lastMessage;
  const isMyLastMessage = lastMessage?.senderId === currentUserId;

  const getLastMessageText = () => {
    if (!lastMessage) return 'Start a conversation';
    if (lastMessage.type === MESSAGE_TYPES.IMAGE) {
      return `${isMyLastMessage ? 'You: ' : ''}📷 Photo`;
    }
    return `${isMyLastMessage ? 'You: ' : ''}${truncateText(lastMessage.text)}`;
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { borderBottomColor: theme.colors.border },
      ]}
      onPress={onPress}
      activeOpacity={0.7}>
      <Avatar
        uri={otherUser?.photoURL}
        name={otherUser?.displayName}
        size={54}
        showOnline
        isOnline={otherUser?.isOnline}
      />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text
            style={[styles.name, { color: theme.colors.text }]}
            numberOfLines={1}>
            {otherUser?.displayName || 'Unknown User'}
          </Text>
          <Text
            style={[
              styles.time,
              {
                color: unreadCount > 0
                  ? theme.colors.primary
                  : theme.colors.timestamp,
                fontWeight: unreadCount > 0 ? '600' : '400',
              },
            ]}>
            {formatChatListTime(lastMessage?.timestamp)}
          </Text>
        </View>
        <View style={styles.bottomRow}>
          <Text
            style={[
              styles.lastMessage,
              {
                color: unreadCount > 0
                  ? theme.colors.text
                  : theme.colors.subtext,
                fontWeight: unreadCount > 0 ? '500' : '400',
              },
            ]}
            numberOfLines={1}>
            {getLastMessageText()}
          </Text>
          {unreadCount > 0 && (
            <View
              style={[
                styles.badge,
                { backgroundColor: theme.colors.unreadBadge },
              ]}>
              <Text style={styles.badgeText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});

export default ChatListItem;