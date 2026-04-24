export const selectSelectedUserId = (state) => state.auth.selectedUserId;
export const selectEmployees = (state) => state.employees.list;
export const selectAuthUser = (state) => state.auth.currentUser;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;

export const selectCurrentUser = (state) => {
  if (state.auth.currentUser) {
    return state.auth.currentUser;
  }

  return state.employees.list.find((e) => e.id === state.auth.selectedUserId) || null;
};

export const selectIsAdmin = (state) => {
  const user = state.auth.currentUser
    ? state.auth.currentUser
    : state.employees.list.find((e) => e.id === state.auth.selectedUserId);

  return user?.role === "admin";
};