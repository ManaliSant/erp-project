import { get } from "./api";

export async function fetchAuditLogs({ page = 0, size = 10, search = "" }) {
  const query = new URLSearchParams({
    page: String(page),
    size: String(size),
    search,
  });

  return get(`/audit?${query.toString()}`);
}