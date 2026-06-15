import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import HomeScreen from '@screens/main/HomeScreen';
import ChatScreen from '@screens/main/ChatScreen';
import ProfileScreen from '@screens/main/ProfileScreen';
import SearchScreen from '@screens/main/SearchScreen';
import { Avatar } from '@components/common/Avatar';
import { SCREEN_NAMES } from '@utils/constants';
import { selectUser } from '@redux/slices/authSlice';
import { selectThemeMode } from '@redux/slices/themeSlice';
import { lightTheme, darkTheme } from '@theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = ({ navigation }) => {
  const themeMode = useSelector(selectThemeMode);
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;
  const user = useSelector(selectUser);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.subtext,
        headerStyle: { backgroundColor: theme.colors.headerBackground },
        headerTintColor: theme.colors.headerText,
      }}>
      <Tab.Screen
        name={SCREEN_NAMES.HOME}
        component={HomeScreen}
        options={{
          title: 'Chats',
          tabBarIcon: ({ color, size }) => (
            <Icon name="message-text" size={size} color={color} />
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate(SCREEN_NAMES.SEARCH)}
              style={{ marginRight: 16 }}>
              <Icon name="magnify" size={24} color={theme.colors.headerText} />
            </TouchableOpacity>
          ),
        }}
      />
      <Tab.Screen
        name={SCREEN_NAMES.PROFILE}
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <View>
              {user?.photoURL ? (
                <Avatar
                  uri={user.photoURL}
                  size={size}
                  style={{ borderWidth: 1, borderColor: color }}
                />
              ) : (
                <Icon name="account-circle" size={size} color={color} />
              )}
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const MainNavigator = () => {
  const themeMode = useSelector(selectThemeMode);
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Tabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={SCREEN_NAMES.CHAT}
        component={ChatScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={SCREEN_NAMES.SEARCH}
        component={SearchScreen}
        options={{
          title: 'Search Users',
          headerStyle: { backgroundColor: theme.colors.headerBackground },
          headerTintColor: theme.colors.headerText,
        }}
      />
    </Stack.Navigator>
  );
};

export default MainNavigator;