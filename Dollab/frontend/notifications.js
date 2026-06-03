const API_NOTIFICATIONS = "/api/notifications";

async function getNotifications() {
  const token = localStorage.getItem("token");

  const res = await fetch(API_NOTIFICATIONS, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    console.error("Ошибка загрузки уведомлений:", res.status, await res.text());
    return [];
  }

  return await res.json();
}

async function getUnreadNotificationsCount() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_NOTIFICATIONS}/unread-count`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) return 0;

  const data = await res.json();
  return data.count ?? 0;
}

async function markNotificationAsRead(id) {
  const token = localStorage.getItem("token");

  return fetch(`${API_NOTIFICATIONS}/${id}/read`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` }
  });
}

async function markAllNotificationsAsRead() {
  const token = localStorage.getItem("token");

  return fetch(`${API_NOTIFICATIONS}/read-all`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` }
  });
}

async function deleteNotification(id) {
  const token = localStorage.getItem("token");

  return fetch(`${API_NOTIFICATIONS}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
}