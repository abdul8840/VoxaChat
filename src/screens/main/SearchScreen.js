import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import { Searchbar } from 'react-native-paper';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { selectUser } from '@redux/slices/authSlice';
import { selectThemeMode } from '@redux/slices/themeSlice';
import { lightTheme, darkTheme } from '@theme';
import { firestoreService } from '@services/firebase/firestoreService';
import { Avatar } from '@components/common/Avatar';
import { debounce } from '@utils/helpers';
import { SCREEN_NAMES } from '@utils/constants';

const SearchScreen = ({ navigation }) => {
  const currentUser = useSelector(selectUser);
  const themeMode = useSelector(selectThemeMode);
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;

  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = useCallback(
    debounce(async (query) => {
      if (!query.trim() || query.length < 2) {
        setUsers([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const results = await firestoreService.searchUsers(
          query.trim(),
          currentUser.uid
        );
        setUsers(results);
        setHasSearched(true);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 500),
    [currentUser.uid]
  );

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    performSearch(query);
  };

  const handleUserPress = async (user) => {
    try {
      const chatId = await firestoreService.createOrGetChat(
        currentUser.uid,
        user.uid
      );
      
      navigation.replace(SCREEN_NAMES.CHAT, {
        chat: { id: chatId, participants: [currentUser.uid, user.uid] },
        otherUser: user,
      });
    } catch (error) {
      console.warn('Failed to open chat:', error);
    }
  };

  const renderUser = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.userItem,
        { borderBottomColor: theme.colors.border },
      ]}
      onPress={() => handleUserPress(item)}
      activeOpacity={0.7}>
      <Avatar
        uri={item.photoURL}
        name={item.displayName}
        size={50}
        showOnline
        isOnline={item.isOnline}
      />
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: theme.colors.text }]}>
          {item.displayName}
        </Text>
        <Text style={[styles.userEmail, { color: theme.colors.subtext }]}>
          {item.email}
        </Text>
        {item.bio ? (
          <Text
            style={[styles.userBio, { color: theme.colors.subtext }]}
            numberOfLines={1}>
            {item.bio}
          </Text>
        ) : null}
      </View>
      <Icon name="message-outline" size={20} color={theme.colors.primary} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View
        style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}>
        <Searchbar
          placeholder="Search by name..."
          onChangeText={handleSearchChange}
          value={searchQuery}
          autoFocus
          style={[
            styles.searchInput,
            { backgroundColor: theme.colors.inputBackground },
          ]}
          iconColor={theme.colors.primary}
          inputStyle={{ color: theme.colors.text }}
          placeholderTextColor={theme.colors.subtext}
        />
      </View>

      {isSearching ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={item => item.uid}
          renderItem={renderUser}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            hasSearched && searchQuery.length >= 2 ? (
              <View style={styles.centered}>
                <Icon
                  name="account-search-outline"
                  size={60}
                  color={theme.colors.border}
                />
                <Text style={[styles.emptyText, { color: theme.colors.subtext }]}>
                  No users found for "{searchQuery}"
                </Text>
              </View>
            ) : searchQuery.length === 0 ? (
              <View style={styles.centered}>
                <Icon
                  name="account-search"
                  size={60}
                  color={theme.colors.border}
                />
                <Text style={[styles.emptyText, { color: theme.colors.subtext }]}>
                  Search for users by name
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: {
    padding: 12,
  },
  searchInput: {
    elevation: 0,
    shadowOpacity: 0,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 13,
  },
  userBio: {
    fontSize: 13,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
  },
});

export default SearchScreen;
