import { post } from "./api";

export async function loginUser(payload) {
  return post("/auth/login", payload);
}

export async function forgotPassword(payload) {
  return post("/auth/forgot-password", payload);
}

export async function resetPasswordWithToken(payload) {
  return post("/auth/reset-password", payload);
}