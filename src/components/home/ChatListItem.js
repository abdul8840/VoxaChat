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
  const hasUnread = unreadCount > 0;

  const getLastMessageText = () => {
    if (!lastMessage) return 'Start a conversation';
    if (lastMessage.type === MESSAGE_TYPES.IMAGE) {
      return `${isMyLastMessage ? 'You: ' : ''}Photo`;
    }
    return `${isMyLastMessage ? 'You: ' : ''}${truncateText(lastMessage.text)}`;
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.elevatedSurface,
          borderColor: theme.colors.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.75}>
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
                color: hasUnread ? theme.colors.primary : theme.colors.timestamp,
                fontWeight: hasUnread ? '700' : '500',
              },
            ]}>
            {formatChatListTime(lastMessage?.timestamp)}
          </Text>
        </View>
        <View style={styles.bottomRow}>
          {lastMessage?.type === MESSAGE_TYPES.IMAGE ? (
            <Icon
              name="image-outline"
              size={16}
              color={hasUnread ? theme.colors.primary : theme.colors.subtext}
              style={styles.messageTypeIcon}
            />
          ) : null}
          <Text
            style={[
              styles.lastMessage,
              {
                color: hasUnread ? theme.colors.text : theme.colors.subtext,
                fontWeight: hasUnread ? '600' : '400',
              },
            ]}
            numberOfLines={1}>
            {getLastMessageText()}
          </Text>
          {hasUnread && (
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
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginHorizontal: 14,
    marginVertical: 5,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
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
  messageTypeIcon: {
    marginRight: 4,
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
});

export default ChatListItem;
