import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { selectThemeMode } from '@redux/slices/themeSlice';
import { lightTheme, darkTheme } from '@theme';
import { formatMessageTime } from '@utils/helpers';
import { MESSAGE_TYPES } from '@utils/constants';

const ReadReceipt = ({ status, theme }) => {
  const iconMap = {
    sending: { name: 'clock-outline', color: theme.colors.timestamp },
    sent: { name: 'check', color: theme.colors.timestamp },
    delivered: { name: 'check-all', color: theme.colors.timestamp },
    read: { name: 'check-all', color: theme.colors.readReceipt },
  };

  const icon = iconMap[status] || iconMap.sent;
  return <Icon name={icon.name} size={14} color={icon.color} />;
};

const MessageBubble = memo(({
  message,
  isMyMessage,
  onLongPress,
  onImagePress,
}) => {
  const themeMode = useSelector(selectThemeMode);
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;

  const bubbleStyle = isMyMessage
    ? {
        backgroundColor: theme.colors.chatBubbleSent,
        borderBottomRightRadius: 2,
        alignSelf: 'flex-end',
      }
    : {
        backgroundColor: theme.colors.chatBubbleReceived,
        borderBottomLeftRadius: 2,
        alignSelf: 'flex-start',
      };

  const textColor = isMyMessage
    ? theme.colors.chatBubbleSentText
    : theme.colors.chatBubbleReceivedText;

  if (message.isDeleted) {
    return (
      <View style={[styles.bubble, bubbleStyle, styles.deletedBubble]}>
        <Text style={[styles.deletedText, { color: theme.colors.subtext }]}>
          <Icon name="cancel" size={13} /> This message was deleted
        </Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      onLongPress={() => onLongPress?.(message)}
      activeOpacity={0.8}
      style={[styles.wrapper, isMyMessage ? styles.myWrapper : styles.theirWrapper]}>
      
      {/* Shadow card for received messages */}
      <View
        style={[
          styles.bubble,
          bubbleStyle,
          !isMyMessage && styles.receivedShadow,
        ]}>
        
        {/* Image message */}
        {message.type === MESSAGE_TYPES.IMAGE && message.imageURL && (
          <TouchableOpacity onPress={() => onImagePress?.(message.imageURL)}>
            <Image
              source={{ uri: message.imageURL }}
              style={styles.messageImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}

        {/* Text message */}
        {(message.type === MESSAGE_TYPES.TEXT || message.text) && (
          <Text style={[styles.messageText, { color: textColor }]}>
            {message.text}
          </Text>
        )}

        {/* Time and read receipt */}
        <View style={styles.footer}>
          <Text style={[styles.timestamp, { color: theme.colors.timestamp }]}>
            {formatMessageTime(message.timestamp)}
          </Text>
          {isMyMessage && (
            <ReadReceipt status={message.status} theme={theme} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 2,
    marginHorizontal: 8,
    maxWidth: '80%',
  },
  myWrapper: {
    alignSelf: 'flex-end',
  },
  theirWrapper: {
    alignSelf: 'flex-start',
  },
  bubble: {
    borderRadius: 12,
    padding: 8,
    paddingHorizontal: 10,
    paddingBottom: 4,
    minWidth: 60,
  },
  receivedShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
    letterSpacing: 0.1,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 3,
    marginTop: 2,
  },
  timestamp: {
    fontSize: 11,
  },
  deletedBubble: {
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  deletedText: {
    fontSize: 13,
    fontStyle: 'italic',
    padding: 4,
  },
});

export default MessageBubble;
