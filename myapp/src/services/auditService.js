import { get } from "./api";

const BASE_URL = "http://localhost:8081/api";

export async function fetchAuditLogs({ page = 0, size = 10, search = "" }) {
  const query = new URLSearchParams({
    page: String(page),
    size: String(size),
    search,
  });

  return get(`/audit?${query.toString()}`);
}

export async function downloadAuditLogsCsv(search = "") {
  const token = localStorage.getItem("token");

  const query = new URLSearchParams({
    search,
  });

  const response = await fetch(`${BASE_URL}/audit/export?${query.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to export audit logs.");
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = "audit-logs.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(downloadUrl);
}