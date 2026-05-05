import { get, post, patch } from "./api";

const BASE_URL = "http://localhost:8081/api";

export async function fetchApplications() {
  return get("/applications");
}

export async function createApplication(payload) {
  return post("/applications", payload);
}

export async function managerApproveApplicationRequest(applicationId, payload) {
  return patch(`/applications/${applicationId}/manager-approve`, payload);
}

export async function adminApproveApplicationRequest(applicationId, payload) {
  return patch(`/applications/${applicationId}/admin-approve`, payload);
}

export async function rejectApplicationRequest(applicationId, payload) {
  return patch(`/applications/${applicationId}/reject`, payload);
}

async function downloadApplicationPdf(applicationId, endpoint, filenamePrefix) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${BASE_URL}/documents/applications/${applicationId}/${endpoint}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to download PDF.");
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = `${filenamePrefix}-${applicationId}.pdf`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(downloadUrl);
}

export async function downloadLeaveApprovalPdf(applicationId) {
  return downloadApplicationPdf(applicationId, "leave-approval", "leave-approval");
}

export async function downloadReferenceLetterPdf(applicationId) {
  return downloadApplicationPdf(applicationId, "reference-letter", "reference-letter");
}