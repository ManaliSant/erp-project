import { get, post, patch } from "./api";

export async function fetchApplications() {
  return get("/applications");
}

export async function createApplication(payload) {
  return post("/applications", payload);
}

export async function managerApproveApplicationRequest(id, payload) {
  return patch(`/applications/${id}/manager-approve`, payload);
}

export async function adminApproveApplicationRequest(id, payload) {
  return patch(`/applications/${id}/admin-approve`, payload);
}

export async function rejectApplicationRequest(id, payload) {
  return patch(`/applications/${id}/reject`, payload);
}