import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '@services/firebase/authService';
import { firestoreService } from '@services/firebase/firestoreService';

// Async thunks
export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }, { rejectWithValue }) => {
    const { user, error } = await authService.signIn(email, password);
    if (error) return rejectWithValue(error);
    
    const userDoc = await firestoreService.getUserDocument(user.uid);
    return { uid: user.uid, email: user.email, ...userDoc };
  }
);

export const signUp = createAsyncThunk(
  'auth/signUp',
  async ({ email, password, displayName }, { rejectWithValue }) => {
    const { user, error } = await authService.signUp(email, password, displayName);
    if (error) return rejectWithValue(error);
    
    const userDoc = await firestoreService.getUserDocument(user.uid);
    return { uid: user.uid, email: user.email, ...userDoc };
  }
);

export const signOut = createAsyncThunk(
  'auth/signOut',
  async (uid, { rejectWithValue }) => {
    const { error } = await authService.signOut(uid);
    if (error) return rejectWithValue(error);
    return null;
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    const { error } = await authService.forgotPassword(email);
    if (error) return rejectWithValue(error);
    return true;
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async ({ uid, data }, { rejectWithValue }) => {
    try {
      await firestoreService.updateUserDocument(uid, data);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    isInitialized: false,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.isInitialized = true;
    },
    clearError: state => {
      state.error = null;
    },
    setInitialized: state => {
      state.isInitialized = true;
    },
    updateUserLocal: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: builder => {
    // Sign In
    builder
      .addCase(signIn.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Sign Up
    builder
      .addCase(signUp.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Sign Out
    builder
      .addCase(signOut.fulfilled, state => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
      });

    // Forgot Password
    builder
      .addCase(forgotPassword.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, state => {
        state.isLoading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Update Profile
    builder
      .addCase(updateProfile.fulfilled, (state, action) => {
        if (state.user) {
          state.user = { ...state.user, ...action.payload };
        }
      });
  },
});

export const { setUser, clearError, setInitialized, updateUserLocal } = 
  authSlice.actions;

// Selectors
export const selectUser = state => state.auth.user;
export const selectIsAuthenticated = state => state.auth.isAuthenticated;
export const selectAuthLoading = state => state.auth.isLoading;
export const selectAuthError = state => state.auth.error;
export const selectIsInitialized = state => state.auth.isInitialized;

export default authSlice.reducer;