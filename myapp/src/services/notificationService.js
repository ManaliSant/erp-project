import { get, put } from "./api";

export async function fetchNotifications() {
  return get("/notifications");
}

export async function fetchUnreadNotificationCount() {
  return get("/notifications/unread-count");
}

export async function markNotificationAsRead(notificationId) {
  return put(`/notifications/${notificationId}/read`, {});
}