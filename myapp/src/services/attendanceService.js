import { get, post } from "./api";

export async function signIn() {
  return post("/attendance/sign-in", {});
}

export async function signOut() {
  return post("/attendance/sign-out", {});
}

export async function fetchMyAttendance() {
  return get("/attendance/me");
}

export async function fetchTeamAttendance() {
  return get("/attendance/team");
}

export async function fetchAllAttendance() {
  return get("/attendance/all");
}