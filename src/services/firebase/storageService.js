import storage from '@react-native-firebase/storage';
import { Platform } from 'react-native';
import { STORAGE_PATHS } from '@utils/constants';

class StorageService {
  async uploadProfilePicture(uid, imageUri) {
    const filename = `profile_${uid}_${Date.now()}.jpg`;
    const path = `${STORAGE_PATHS.PROFILE_PICTURES}/${filename}`;
    
    const reference = storage().ref(path);
    
    const uri = Platform.OS === 'ios' 
      ? imageUri.replace('file://', '') 
      : imageUri;
    
    await reference.putFile(uri);
    const downloadURL = await reference.getDownloadURL();
    
    return downloadURL;
  }

  async uploadChatImage(chatId, imageUri) {
    const filename = `chat_${chatId}_${Date.now()}.jpg`;
    const path = `${STORAGE_PATHS.CHAT_IMAGES}/${chatId}/${filename}`;
    
    const reference = storage().ref(path);
    
    const uri = Platform.OS === 'ios' 
      ? imageUri.replace('file://', '') 
      : imageUri;
    
    // Upload with progress tracking
    const task = reference.putFile(uri);
    
    return new Promise((resolve, reject) => {
      task.on(
        'state_changed',
        snapshot => {
          const progress = 
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload progress: ${progress}%`);
        },
        error => reject(error),
        async () => {
          const downloadURL = await reference.getDownloadURL();
          resolve(downloadURL);
        }
      );
    });
  }

  async deleteFile(filePath) {
    try {
      await storage().ref(filePath).delete();
    } catch (error) {
      console.warn('Error deleting file:', error);
    }
  }
}

export const storageService = new StorageService();