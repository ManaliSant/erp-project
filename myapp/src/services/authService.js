import { post } from "./api";

export async function loginUser(payload) {
  return post("/auth/login", payload);
}