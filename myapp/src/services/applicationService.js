import { get, post, patch } from "./api";

export async function fetchApplications() {
  return get("/applications");
}

export async function createApplication(payload) {
  return post("/applications", payload);
}

export async function approveApplicationRequest(id, payload = {}) {
  return patch(`/applications/${id}/approve`, payload);
}

export async function rejectApplicationRequest(id, payload = {}) {
  return patch(`/applications/${id}/reject`, payload);
}