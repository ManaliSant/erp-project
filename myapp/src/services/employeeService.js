import { get, post, patch } from "./api";

export async function fetchEmployees() {
  return get("/employees");
}

export async function fetchEmployeesPage({ page = 0, size = 20, search = "" }) {
  const query = new URLSearchParams({
    page: String(page),
    size: String(size),
    search,
  });

  return get(`/employees/page?${query.toString()}`);
}

export async function fetchMyProfile() {
  return get("/employees/me");
}

export async function createEmployee(payload) {
  return post("/employees", payload);
}

export async function resetEmployeePassword(employeeId, payload) {
  return patch(`/employees/${employeeId}/reset-password`, payload);
}

export async function changeOwnPassword(payload) {
  return patch("/employees/me/change-password", payload);
}