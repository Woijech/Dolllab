async function getUserTheme() {
  const token = localStorage.getItem("token");

  const res = await fetch("https://localhost:7145/api/settings/theme", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) return "light";

  const data = await res.json();
  return data.theme || "light";
}

async function updateUserTheme(theme) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/api/settings/theme`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ theme })
  });

  if (!res.ok) {
    alert(await res.text());
    return null;
  }

  return await res.json();
}

async function loadProfilePrivacy() {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/api/settings/profile-privacy`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!response.ok) {
    console.log("Не удалось загрузить настройки приватности");
    return;
  }

  const data = await response.json();

  document.getElementById("profile-privacy-select").value =
    data.profileVisibility || "public";
}

async function updateProfilePrivacy(profileVisibility) {
  const token = localStorage.getItem("token");

  const res = await fetch("https://localhost:7145/api/settings/profile-privacy", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      profileVisibility
    })
  });

  if (!res.ok) {
    console.error(await res.text());
    return null;
  }

  return await res.json();
}

async function acceptFollowRequest(requestId) {
  const token = localStorage.getItem("token");

  return fetch(`https://localhost:7145/api/follow-requests/${requestId}/accept`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }
  });
}

async function rejectFollowRequest(requestId) {
  const token = localStorage.getItem("token");

  return fetch(`https://localhost:7145/api/follow-requests/${requestId}/reject`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }
  });
}

async function getNotificationSettings() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/api/settings/notifications`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    console.log("Не удалось загрузить настройки уведомлений");
    return null;
  }

  return await res.json();
}

async function updateNotificationSettings(settings) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/api/settings/notifications`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(settings)
  });

  if (!res.ok) {
    console.log(await res.text());
    return null;
  }

  return await res.json();
}

async function getStoreSettings() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/api/settings/store`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    console.log("Не удалось загрузить настройки магазина");
    return null;
  }

  return await res.json();
}

async function updateStoreSettings(settings) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/api/settings/store`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(settings)
  });

  if (!res.ok) {
    console.log(await res.text());
    return null;
  }

  return await res.json();
}

async function changePassword(oldPassword, newPassword) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/api/settings/password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ oldPassword, newPassword })
  });

  if (!res.ok) {
    alert(await res.text());
    return null;
  }

  return await res.json();
}

async function deleteAccount() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/api/settings/account`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    alert(await res.text());
    return null;
  }

  return await res.json();
}

async function blockUser(userId) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/api/blocked-users/${userId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    alert(await res.text());
    return null;
  }

  return await res.json();
}

async function unblockUser(userId) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/api/blocked-users/${userId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    alert(await res.text());
    return null;
  }

  return await res.json();
}

async function getBlockedUsers() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/api/blocked-users`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) return [];

  return await res.json();
}

async function getMyReports() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/api/reports/my`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) return [];

  return await res.json();
}

async function createUserRequest(formData) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/api/user-requests`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  if (!res.ok) {
    alert(await res.text());
    return null;
  }

  return await res.json();
}

async function getMyUserRequests() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/api/user-requests/my`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    return [];
  }

  return await res.json();
}