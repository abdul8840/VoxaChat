import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
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

  const renderTabIcon = (name, color, focused) => (
    <View
      style={[
        styles.tabIcon,
        focused && { backgroundColor: theme.colors.primaryContainer },
      ]}>
      <Icon
        name={name}
        size={focused ? 24 : 22}
        color={focused ? theme.colors.primary : color}
      />
    </View>
  );

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 68,
          paddingTop: 8,
          paddingBottom: 8,
          elevation: 12,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 10,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.subtext,
        tabBarLabelStyle: styles.tabLabel,
        headerStyle: {
          backgroundColor: theme.colors.headerBackground,
        },
        headerTintColor: theme.colors.headerText,
        headerTitleStyle: styles.headerTitle,
        headerShadowVisible: false,
      }}>
      <Tab.Screen
        name={SCREEN_NAMES.HOME}
        component={HomeScreen}
        options={{
          title: 'Chats',
          tabBarIcon: ({ color, focused }) =>
            renderTabIcon('message-text', color, focused),
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate(SCREEN_NAMES.SEARCH)}
              style={[
                styles.headerIconButton,
                { backgroundColor: 'rgba(255,255,255,0.16)' },
              ]}>
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
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={[
                styles.tabIcon,
                focused && { backgroundColor: theme.colors.primaryContainer },
              ]}>
              {user?.photoURL ? (
                <Avatar
                  uri={user.photoURL}
                  size={size - 2}
                  style={{ borderWidth: 1.5, borderColor: color }}
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

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tabIcon: {
    width: 48,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
});
