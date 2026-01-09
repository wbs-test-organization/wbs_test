import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface UserInfo {
  memberId: string;
  memberFullName: string;
  email: string;
  loginName?: string;
  phoneNumber?: string;
  roleId: string;
  isActive: boolean;
}

interface AuthState {
  user: UserInfo | null; 
  token: string | null;
  isAuthenticated: boolean;
  error: string | null;
}

const loadFromStorage = (): { token: string | null; user: UserInfo | null } => {
  try {
    const token = localStorage.getItem("token");
    const saveUser = localStorage.getItem("user");
    const user = saveUser ? JSON.parse(saveUser) : null;
    return { token, user };
  } catch (error) {
    console.error("Error loading from localStorage:", error);
    return { token: null, user: null };
  }
};

const initialState: AuthState = {
  user: loadFromStorage().user,
  token: loadFromStorage().token,
  isAuthenticated: !!loadFromStorage().token,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Login thành công
    successLogin: (state, action: PayloadAction<{ token: string; user?: UserInfo; message: string, success: boolean }>) => {
      const { token, user } = action.payload;

      state.token = token;
      state.isAuthenticated = true;
      state.error = null;

      if(user){
        state.user = user;
      }

      localStorage.setItem("token", token);
      if (user) localStorage.setItem("user", JSON.stringify(user));
    },

    // Login thất bại
    failLogin: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isAuthenticated = false;
      state.token = null;
    },

    // Register thành công
    successRegister: (state, action: PayloadAction<UserInfo>) => {
      state.user = action.payload;
      state.error = null;
    },

    // Register thất bại
    failRegister: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },

    //success verify
    successVerify: (state) => {
      state.error = null;
      if(state.user){
        state.user.isActive = true;
      }
    },

    failVerify: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },

    // Logout
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;

      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },

    // Xóa error (khi đóng thông báo lỗi)
    clearError: (state) => {
      state.error = null;
    },

    setUser: (state, action: PayloadAction<UserInfo>) => {
      state.user = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload)); // ✅ Save to localStorage
      if (action.payload?.loginName) {
        localStorage.setItem("email", action.payload.loginName);
      }
    },

    // Reset toàn bộ state (nếu cần)
    reset: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
});

export const {
  successLogin,
  failLogin,
  successRegister,
  failRegister,
  logout,
  clearError,
  successVerify,
  failVerify,
  setUser,
  reset,
} = authSlice.actions;

export default authSlice.reducer;