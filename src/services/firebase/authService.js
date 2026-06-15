import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { firestoreService } from './firestoreService';

class AuthService {
  // Sign up with email and password
  async signUp(email, password, displayName) {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(
        email,
        password
      );
      
      const { user } = userCredential;
      
      // Update display name
      await user.updateProfile({ displayName });
      
      // Create user document in Firestore
      await firestoreService.createUserDocument(user.uid, {
        uid: user.uid,
        email: user.email,
        displayName,
        photoURL: null,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
        isOnline: true,
        lastSeen: firestore.FieldValue.serverTimestamp(),
        fcmToken: null,
        bio: '',
        phoneNumber: '',
      });
      
      return { user, error: null };
    } catch (error) {
      return { user: null, error: this.getErrorMessage(error.code) };
    }
  }

  // Sign in with email and password
  async signIn(email, password) {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(
        email,
        password
      );
      
      // Update online status
      await firestoreService.updateUserPresence(
        userCredential.user.uid,
        true
      );
      
      return { user: userCredential.user, error: null };
    } catch (error) {
      return { user: null, error: this.getErrorMessage(error.code) };
    }
  }

  // Sign out
  async signOut(uid) {
    try {
      // Update offline status before signing out
      if (uid) {
        await firestoreService.updateUserPresence(uid, false);
      }
      await auth().signOut();
      return { error: null };
    } catch (error) {
      return { error: this.getErrorMessage(error.code) };
    }
  }

  // Send password reset email
  async forgotPassword(email) {
    try {
      await auth().sendPasswordResetEmail(email);
      return { error: null };
    } catch (error) {
      return { error: this.getErrorMessage(error.code) };
    }
  }

  // Get current user
  getCurrentUser() {
    return auth().currentUser;
  }

  // Auth state listener
  onAuthStateChanged(callback) {
    return auth().onAuthStateChanged(callback);
  }

  // Update email
  async updateEmail(newEmail) {
    try {
      await auth().currentUser.updateEmail(newEmail);
      return { error: null };
    } catch (error) {
      return { error: this.getErrorMessage(error.code) };
    }
  }

  // Update password
  async updatePassword(newPassword) {
    try {
      await auth().currentUser.updatePassword(newPassword);
      return { error: null };
    } catch (error) {
      return { error: this.getErrorMessage(error.code) };
    }
  }

  // Re-authenticate user
  async reauthenticate(password) {
    try {
      const user = auth().currentUser;
      const credential = auth.EmailAuthProvider.credential(
        user.email,
        password
      );
      await user.reauthenticateWithCredential(credential);
      return { error: null };
    } catch (error) {
      return { error: this.getErrorMessage(error.code) };
    }
  }

  getErrorMessage(code) {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'This email is already registered.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/operation-not-allowed':
        return 'This operation is not allowed.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/user-not-found':
        return 'No account found with this email.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }
}

export const authService = new AuthService();