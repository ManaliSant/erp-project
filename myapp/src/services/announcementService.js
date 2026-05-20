import { get, post, del } from "./api";

export async function fetchAnnouncements() {
  return get("/announcements");
}

export async function createAnnouncement(payload) {
  return post("/announcements", payload);
}

export async function deleteAnnouncement(id) {
  return del(`/announcements/${id}`);
}

export async function markAnnouncementRead(id) {
  return post(`/announcements/${id}/read`, {});
}
