import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    selectedUserId: 1,
    currentUser: null,
    token: null,
    isAuthenticated: false,
  },
  reducers: {
    setSelectedUserId: (state, action) => {
      state.selectedUserId = action.payload;
    },
    loginSuccess: (state, action) => {
      state.currentUser = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;

      if (action.payload.user?.id) {
        state.selectedUserId = action.payload.user.id;
      }
    },
    logout: (state) => {
      state.currentUser = null;
      state.token = null;
      state.isAuthenticated = false;
      state.selectedUserId = 1;
    },
  },
});

export const { setSelectedUserId, loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
