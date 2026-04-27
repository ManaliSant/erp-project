import { createSlice } from "@reduxjs/toolkit";

const savedToken = localStorage.getItem("token");

const authSlice = createSlice({
  name: "auth",
  initialState: {
    selectedUserId: 1,
    currentUser: null,
    token: savedToken || null,
    isAuthenticated: !!savedToken,
  },
  reducers: {
    setSelectedUserId: (state, action) => {
      state.selectedUserId = action.payload;
    },

    loginSuccess: (state, action) => {
      localStorage.removeItem("token");

      state.currentUser = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;

      localStorage.setItem("token", action.payload.token);

      if (action.payload.user?.id) {
        state.selectedUserId = action.payload.user.id;
      }
    },

    restoreSession: (state, action) => {
      const token = localStorage.getItem("token");

      state.currentUser = action.payload.user;
      state.token = token;
      state.isAuthenticated = !!token;

      if (action.payload.user?.id) {
        state.selectedUserId = action.payload.user.id;
      }
    },

    logout: (state) => {
      localStorage.removeItem("token");

      state.currentUser = null;
      state.token = null;
      state.isAuthenticated = false;
      state.selectedUserId = 1;
    },
  },
});

export const { setSelectedUserId, loginSuccess, restoreSession, logout } =
  authSlice.actions;

export default authSlice.reducer;