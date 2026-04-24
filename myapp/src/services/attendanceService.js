import { get, post } from "./api";

export async function fetchAttendance() {
  return get("/attendance");
}

export async function signInAttendance(payload) {
  return post("/attendance/sign-in", payload);
}

export async function signOutAttendance(payload) {
  return post("/attendance/sign-out", payload);
}