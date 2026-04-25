export const selectSelectedUserId = (state) => state.auth.selectedUserId;
export const selectEmployees = (state) => state.employees.list;
export const selectAuthUser = (state) => state.auth.currentUser;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;

export const selectCurrentUser = (state) => {
  return state.auth.currentUser || null;
};

export const selectCurrentRole = (state) => {
  return state.auth.currentUser?.role?.toUpperCase() || "";
};

export const selectIsAdmin = (state) => {
  return selectCurrentRole(state) === "ADMIN";
};

export const selectIsManager = (state) => {
  return selectCurrentRole(state) === "MANAGER";
};

export const selectIsEmployee = (state) => {
  return selectCurrentRole(state) === "EMPLOYEE";
};