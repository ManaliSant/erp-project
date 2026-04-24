import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    selectedUserId: 1,
    currentUser: null,
    token: localStorage.getItem("token") || null,
    isAuthenticated: !!localStorage.getItem("token"),
  },
  reducers: {
    setSelectedUserId: (state, action) => {
      state.selectedUserId = action.payload;
    },
    loginSuccess: (state, action) => {
      state.currentUser = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;

      localStorage.setItem("token", action.payload.token);

      if (action.payload.user?.id) {
        state.selectedUserId = action.payload.user.id;
      }
    },
    restoreSession: (state, action) => {
      state.currentUser = action.payload.user;
      state.token = localStorage.getItem("token");
      state.isAuthenticated = !!localStorage.getItem("token");

      if (action.payload.user?.id) {
        state.selectedUserId = action.payload.user.id;
      }
    },
    logout: (state) => {
      state.currentUser = null;
      state.token = null;
      state.isAuthenticated = false;
      state.selectedUserId = 1;

      localStorage.removeItem("token");
    },
  },
});

export const { setSelectedUserId, loginSuccess, restoreSession, logout } = authSlice.actions;
export default authSlice.reducer;