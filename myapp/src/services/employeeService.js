import { get } from "./api";

export async function fetchEmployees() {
  return get("/employees");
}