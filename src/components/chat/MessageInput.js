import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { selectThemeMode } from '@redux/slices/themeSlice';
import { lightTheme, darkTheme } from '@theme';
import { selectSendingMessage } from '@redux/slices/messagesSlice';

const MessageInput = ({
  onSendText,
  onSendImage,
  onTypingChange,
}) => {
  const [text, setText] = useState('');
  const themeMode = useSelector(selectThemeMode);
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;
  const isSending = useSelector(selectSendingMessage);
  const inputRef = useRef(null);

  const handleTextChange = useCallback(value => {
    setText(value);
    onTypingChange?.(value.length > 0);
  }, [onTypingChange]);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;
    
    onSendText(trimmed);
    setText('');
    onTypingChange?.(false);
  }, [text, isSending, onSendText, onTypingChange]);

  const canSend = text.trim().length > 0 && !isSending;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
      ]}>
      {/* Attachment button */}
      <TouchableOpacity
        style={[
          styles.iconButton,
          { backgroundColor: theme.colors.surfaceVariant },
        ]}
        onPress={onSendImage}
        disabled={isSending}>
        <Icon name="paperclip" size={22} color={theme.colors.primary} />
      </TouchableOpacity>

      {/* Text Input */}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.colors.inputBackground,
            borderColor: theme.colors.border,
          },
        ]}>
        <TextInput
          ref={inputRef}
          value={text}
          onChangeText={handleTextChange}
          placeholder="Type a message"
          placeholderTextColor={theme.colors.subtext}
          multiline
          maxLength={2000}
          style={[
            styles.input,
            { color: theme.colors.text },
          ]}
          returnKeyType="default"
        />

        {/* Emoji button */}
        <TouchableOpacity style={styles.emojiButton}>
          <Icon name="emoticon-outline" size={22} color={theme.colors.subtext} />
        </TouchableOpacity>
      </View>

      {/* Send / Mic button */}
      {canSend ? (
        <TouchableOpacity
          style={[
            styles.sendButton,
            styles.sendButtonActive,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={handleSend}
          disabled={!canSend}>
          {isSending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Icon name="send" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[
            styles.sendButton,
            { backgroundColor: theme.colors.surfaceVariant },
          ]}>
          <Icon name="microphone" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    marginHorizontal: 4,
    maxHeight: 120,
  },
  input: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    maxHeight: 100,
    paddingTop: Platform.OS === 'ios' ? 0 : 4,
  },
  emojiButton: {
    padding: 4,
    alignSelf: 'flex-end',
    marginBottom: 2,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  sendButtonActive: {
    shadowColor: '#0F766E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 6,
  },
});

export default MessageInput;
