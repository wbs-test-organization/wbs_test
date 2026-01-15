import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface UserResponse {
  memberId: string;
  memberFullName: string;
  email: string;
  loginName?: string;
  phoneNumber?: string;
  roleId: string;
  isActive: boolean;
}

interface AuthState {
  member: UserResponse | null; 
  token: string | null;
  isAuthenticated: boolean;
  error: string | null;
}

const loadFromStorage = (): { token: string | null; member: UserResponse | null } => {
  try {
    const token = localStorage.getItem("token");
    const saveMember = localStorage.getItem("member");
    const member = saveMember ? JSON.parse(saveMember) : null;
    return { token, member };
  } catch (error) {
    console.error("Error loading from localStorage:", error);
    return { token: null, member: null };
  }
};

const initialState: AuthState = {
  member: loadFromStorage().member,
  token: loadFromStorage().token,
  isAuthenticated: !!loadFromStorage().token,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Login thành công
    successLogin: (state, action: PayloadAction<{ token: string; member?: UserResponse; message: string, success: boolean }>) => {
      const { token, member } = action.payload;

      state.token = token;
      state.isAuthenticated = true;
      state.error = null;

      if(member){
        state.member = member;
      }

      localStorage.setItem("token", token);
      if (member) localStorage.setItem("member", JSON.stringify(member));
    },

    // Login thất bại
    failLogin: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isAuthenticated = false;
      state.token = null;
    },

    // Register thành công
    successRegister: (state, action: PayloadAction<UserResponse>) => {
      state.member = action.payload;
      state.error = null;
    },

    // Register thất bại
    failRegister: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },

    //success verify
    successVerify: (state) => {
      state.error = null;
      if(state.member){
        state.member.isActive = true;
      }
    },

    failVerify: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },

    // Logout
    logout: (state) => {
      state.member = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;

      localStorage.removeItem("token");
      localStorage.removeItem("member");
    },

    // Xóa error (khi đóng thông báo lỗi)
    clearError: (state) => {
      state.error = null;
    },

    setMember: (state, action: PayloadAction<UserResponse>) => {
      state.member = action.payload;
      localStorage.setItem("member", JSON.stringify(action.payload)); 
      if (action.payload?.loginName) {
        localStorage.setItem("email", action.payload.loginName);
      }
    },

    // Reset toàn bộ state (nếu cần)
    reset: (state) => {
      state.token = null;
      state.member = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem("token");
      localStorage.removeItem("member");
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
  setMember,
  reset,
} = authSlice.actions;

export default authSlice.reducer;