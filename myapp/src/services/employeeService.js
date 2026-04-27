import { post, get } from "./api";

export async function fetchEmployees() {
  return get("/employees");
}

export async function createEmployee(payload) {
  return post("/employees", payload);
}