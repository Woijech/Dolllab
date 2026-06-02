const API_PROFILE = "https://localhost:7145/api/profile";

// Мой профиль
async function getMyProfile(token) {
  try {
    const res = await fetch(`${API_PROFILE}/me/full`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      console.error('Ошибка загрузки профиля:', res.status);
      return null;
    }

    const text = await res.text();
    if (!text) return null;
    
    return JSON.parse(text);
  } catch (error) {
    console.error('Ошибка:', error);
    return null;
  }
}

async function getUserProfile(id) {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_PROFILE}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      console.error('Ошибка загрузки профиля:', res.status);
      return null;
    }

    const text = await res.text();
    if (!text) return null;
    
    return JSON.parse(text);
  } catch (error) {
    console.error('Ошибка:', error);
    return null;
  }
}

async function updateProfile(token, data) {
  try {
    const formData = new FormData();

    if (data.username !== undefined)
      formData.append("username", data.username);

    if (data.bio !== undefined)
      formData.append("bio", data.bio);

    if (data.city !== undefined)
      formData.append("city", data.city);

    if (data.contactMethod !== undefined)
      formData.append("contactMethod", data.contactMethod);

    if (data.avatar)
      formData.append("avatar", data.avatar);

    if (data.removeAvatar)
      formData.append("removeAvatar", "true");

    if (data.clearBio)
      formData.append("clearBio", "true");

    const res = await fetch(`${API_PROFILE}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Ошибка сервера:", res.status, errorText);
      return null;
    }

    const text = await res.text();
    if (!text) return { success: true };

    return JSON.parse(text);
  } catch (error) {
    console.error("Ошибка обновления профиля:", error);
    return null;
  }
}

async function loadUserAvatar() {
  const token = localStorage.getItem("token");
  try {
    const data = await getMyProfile(token);
    const profileAvatar = document.getElementById("profileAvatar");
    if (data && data.avatarUrl && profileAvatar) {
      profileAvatar.src = `https://localhost:7145${data.avatarUrl}`;
    }
  } catch (error) {
    console.error("Ошибка загрузки аватарки:", error);
  }
}

async function toggleFollow(userId) {
  const token = localStorage.getItem("token");

  const res = await fetch(`https://localhost:7145/api/profile/${userId}/follow`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    console.error("Ошибка подписки:", res.status, await res.text());
    return null;
  }

  return await res.json();
}

async function getFollowers(userId) {
  const res = await fetch(`https://localhost:7145/api/profile/${userId}/followers`);

  if (!res.ok) {
    console.error("Ошибка загрузки подписчиков:", res.status, await res.text());
    return [];
  }

  return await res.json();
}

async function getFollowing(userId) {
  const res = await fetch(`https://localhost:7145/api/profile/${userId}/following`);

  if (!res.ok) {
    console.error("Ошибка загрузки подписок:", res.status, await res.text());
    return [];
  }

  return await res.json();
}

async function reportUser(userId, reason, description) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/api/profile/${userId}/report`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      reason,
      description
    })
  });

  if (!res.ok) {
    alert(await res.text());
    return null;
  }

  return await res.json();
}