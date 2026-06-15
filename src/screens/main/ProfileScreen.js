import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Text,
  Button,
  Switch,
  Divider,
  Snackbar,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ImagePicker from 'react-native-image-crop-picker';
import { selectUser, signOut, updateProfile } from '@redux/slices/authSlice';
import { selectThemeMode, toggleTheme } from '@redux/slices/themeSlice';
import { lightTheme, darkTheme } from '@theme';
import { Avatar } from '@components/common/Avatar';
import { Input } from '@components/common/Input';
import { LoadingOverlay } from '@components/common/LoadingOverlay';
import { storageService } from '@services/firebase/storageService';
import { firestoreService } from '@services/firebase/firestoreService';
import auth from '@react-native-firebase/auth';
import { requestPhotoLibraryPermission } from '@utils/permissions';

const ProfileScreen = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const themeMode = useSelector(selectThemeMode);
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');
  const [snackVisible, setSnackVisible] = useState(false);

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');

  const handleEditProfilePicture = async () => {
    const hasPermission = await requestPhotoLibraryPermission();
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please grant photo library access.');
      return;
    }

    try {
      const image = await ImagePicker.openPicker({
        width: 500,
        height: 500,
        cropping: true,
        cropperCircleOverlay: true,
        compressImageQuality: 0.8,
      });

      setIsLoading(true);
      
      const downloadURL = await storageService.uploadProfilePicture(
        user.uid,
        image.path
      );

      await auth().currentUser?.updateProfile({ photoURL: downloadURL });
      await firestoreService.updateUserDocument(user.uid, {
        photoURL: downloadURL,
      });

      dispatch(updateProfile({ uid: user.uid, data: { photoURL: downloadURL } }));
      setSnackMessage('Profile picture updated!');
      setSnackVisible(true);
    } catch (error) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Error', 'Failed to update profile picture.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Display name cannot be empty.');
      return;
    }

    setIsLoading(true);
    try {
      const updates = {
        displayName: displayName.trim(),
        bio: bio.trim(),
        phoneNumber: phoneNumber.trim(),
      };

      await auth().currentUser?.updateProfile({
        displayName: displayName.trim(),
      });
      
      await dispatch(
        updateProfile({ uid: user.uid, data: updates })
      );

      setIsEditing(false);
      setSnackMessage('Profile updated successfully!');
      setSnackVisible(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => dispatch(signOut(user?.uid)),
      },
    ]);
  };

  const MenuRow = ({ icon, title, onPress, rightElement, destructive = false }) => (
    <TouchableOpacity
      style={[styles.menuRow, { borderBottomColor: theme.colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={styles.menuLeft}>
        <View
          style={[
            styles.menuIconContainer,
            {
              backgroundColor: destructive
                ? `${theme.colors.notification}15`
                : `${theme.colors.primary}15`,
            },
          ]}>
          <Icon
            name={icon}
            size={20}
            color={destructive ? theme.colors.notification : theme.colors.primary}
          />
        </View>
        <Text
          style={[
            styles.menuTitle,
            {
              color: destructive ? theme.colors.notification : theme.colors.text,
            },
          ]}>
          {title}
        </Text>
      </View>
      {rightElement || (
        <Icon name="chevron-right" size={20} color={theme.colors.subtext} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View
          style={[
            styles.profileHeader,
            { backgroundColor: theme.colors.surface },
          ]}>
          <TouchableOpacity
            style={styles.avatarWrapper}
            onPress={handleEditProfilePicture}>
            <Avatar
              uri={user?.photoURL}
              name={user?.displayName}
              size={90}
            />
            <View
              style={[
                styles.editAvatarBadge,
                { backgroundColor: theme.colors.primary },
              ]}>
              <Icon name="camera" size={14} color="#fff" />
            </View>
          </TouchableOpacity>

          {isEditing ? (
            <View style={styles.editForm}>
              <Input
                label="Display Name"
                value={displayName}
                onChangeText={setDisplayName}
                icon="account-outline"
              />
              <Input
                label="Bio"
                value={bio}
                onChangeText={setBio}
                icon="information-outline"
                multiline
                numberOfLines={2}
              />
              <Input
                label="Phone Number"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                icon="phone-outline"
                keyboardType="phone-pad"
              />
              <View style={styles.editActions}>
                <Button
                  mode="outlined"
                  onPress={() => setIsEditing(false)}
                  style={styles.editActionButton}
                  textColor={theme.colors.subtext}>
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSaveProfile}
                  loading={isLoading}
                  style={styles.editActionButton}
                  buttonColor={theme.colors.primary}>
                  Save
                </Button>
              </View>
            </View>
          ) : (
            <>
              <Text
                style={[styles.profileName, { color: theme.colors.text }]}>
                {user?.displayName}
              </Text>
              {user?.bio ? (
                <Text style={[styles.profileBio, { color: theme.colors.subtext }]}>
                  {user.bio}
                </Text>
              ) : null}
              <Text
                style={[styles.profileEmail, { color: theme.colors.subtext }]}>
                {user?.email}
              </Text>
              <Button
                mode="outlined"
                onPress={() => setIsEditing(true)}
                style={styles.editButton}
                textColor={theme.colors.primary}
                icon="pencil">
                Edit Profile
              </Button>
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.subtext }]}>
            PREFERENCES
          </Text>
          <View
            style={[
              styles.menuCard,
              { backgroundColor: theme.colors.surface },
            ]}>
            <MenuRow
              icon="theme-light-dark"
              title="Dark Mode"
              rightElement={
                <Switch
                  value={themeMode === 'dark'}
                  onValueChange={() => dispatch(toggleTheme())}
                  color={theme.colors.primary}
                />
              }
            />
            <MenuRow
              icon="bell-outline"
              title="Notifications"
              onPress={() => {}}
            />
            <MenuRow
              icon="lock-outline"
              title="Privacy & Security"
              onPress={() => {}}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.subtext }]}>
            ACCOUNT
          </Text>
          <View
            style={[
              styles.menuCard,
              { backgroundColor: theme.colors.surface },
            ]}>
            <MenuRow
              icon="help-circle-outline"
              title="Help & Support"
              onPress={() => {}}
            />
            <MenuRow
              icon="information-outline"
              title="About"
              onPress={() => {}}
            />
            <MenuRow
              icon="logout"
              title="Sign Out"
              onPress={handleSignOut}
              destructive
            />
          </View>
        </View>

        <View style={styles.version}>
          <Text style={[styles.versionText, { color: theme.colors.subtext }]}>
            ChatApp v1.0.0
          </Text>
        </View>
      </ScrollView>

      <LoadingOverlay visible={isLoading} message="Updating profile..." />
      
      <Snackbar
        visible={snackVisible}
        onDismiss={() => setSnackVisible(false)}
        duration={3000}>
        {snackMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileHeader: {
    alignItems: 'center',
    padding: 24,
    paddingTop: 32,
    gap: 8,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
  },
  profileBio: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  profileEmail: {
    fontSize: 14,
  },
  editButton: {
    marginTop: 8,
    borderRadius: 20,
  },
  editForm: {
    width: '100%',
    gap: 4,
    marginTop: 8,
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  editActionButton: {
    flex: 1,
    borderRadius: 8,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  menuCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  version: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 16,
  },
  versionText: {
    fontSize: 13,
  },
});

export default ProfileScreen;