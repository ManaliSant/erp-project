import { get } from "./api";

export async function fetchDashboardStats() {
  return get("/dashboard/stats");
}