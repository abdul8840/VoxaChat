import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser } from '@redux/slices/authSlice';
import { selectThemeMode } from '@redux/slices/themeSlice';
import {
  setChats,
  setChatsError,
  selectChats,
  selectChatsLoading,
} from '@redux/slices/chatsSlice';
import { firestoreService } from '@services/firebase/firestoreService';
import { lightTheme, darkTheme } from '@theme';
import ChatListItem from '@components/home/ChatListItem';
import { SCREEN_NAMES } from '@utils/constants';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const chats = useSelector(selectChats);
  const isLoading = useSelector(selectChatsLoading);
  const themeMode = useSelector(selectThemeMode);
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;

  const [usersCache, setUsersCache] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  // Fetch other user data for each chat
  const fetchOtherUserData = useCallback(async (chat) => {
    const otherUserId = chat.participants.find(id => id !== user?.uid);
    if (!otherUserId || usersCache[otherUserId]) return;
    
    try {
      const userData = await firestoreService.getUserDocument(otherUserId);
      if (userData) {
        setUsersCache(prev => ({ ...prev, [otherUserId]: userData }));
      }
    } catch (error) {
      console.warn('Failed to load chat user:', error);
    }
  }, [user?.uid, usersCache]);

  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = firestoreService.onChatsChanged(
      user.uid,
      fetchedChats => {
        dispatch(setChats(fetchedChats));
        // Fetch user data for each chat
        fetchedChats.forEach(fetchOtherUserData);
      },
      error => {
        dispatch(
          setChatsError(error?.message || 'Unable to load conversations.')
        );
      }
    );

    return unsubscribe;
  }, [user?.uid, dispatch, fetchOtherUserData]);

  const handleChatPress = useCallback((chat) => {
    const otherUserId = chat.participants.find(id => id !== user?.uid);
    const otherUser = usersCache[otherUserId];
    navigation.navigate(SCREEN_NAMES.CHAT, { chat, otherUser });
  }, [navigation, user?.uid, usersCache]);

  const renderItem = useCallback(({ item: chat }) => {
    const otherUserId = chat.participants.find(id => id !== user?.uid);
    const otherUser = usersCache[otherUserId];
    
    return (
      <ChatListItem
        chat={chat}
        otherUser={otherUser}
        currentUserId={user?.uid}
        onPress={() => handleChatPress(chat)}
      />
    );
  }, [user?.uid, usersCache, handleChatPress]);

  const EmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <View
        style={[
          styles.emptyIcon,
          { backgroundColor: theme.colors.primaryContainer },
        ]}>
        <Icon name="message-text-outline" size={46} color={theme.colors.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        No conversations yet
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.subtext }]}>
        Search for users to start chatting
      </Text>
      <TouchableOpacity
        style={[styles.emptyAction, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate(SCREEN_NAMES.SEARCH)}
        activeOpacity={0.85}>
        <Icon name="account-search-outline" size={18} color="#fff" />
        <Text style={styles.emptyActionText}>Find people</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading && chats.length === 0) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={chats}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListEmptyComponent={EmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
            onRefresh={() => setRefreshing(false)}
          />
        }
        ItemSeparatorComponent={() => null}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          chats.length === 0 && styles.emptyList,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyList: { flex: 1 },
  listContent: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyIcon: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  emptyAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    height: 42,
    borderRadius: 21,
    marginTop: 4,
  },
  emptyActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default HomeScreen;
