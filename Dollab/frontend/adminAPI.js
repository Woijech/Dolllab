const API_DOLLS = `${API_URL}/api/Dolls`;

document.querySelector(".admin-topbar-btn.active")?.addEventListener("click", () => {
  renderAdminDollopedia();
});

async function getAdminDolls() {
  const token = localStorage.getItem("token");

  const res = await fetch(API_DOLLS, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    console.error("Ошибка загрузки кукол:", await res.text());
    return [];
  }

  return await res.json();
}

async function addAdminDoll(formData) {
  const token = localStorage.getItem("token");

  const res = await fetch(API_DOLLS, {
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

async function updateAdminDoll(id, doll) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_DOLLS}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      id: Number(id),
      ...doll
    })
  });

  if (!res.ok) {
    alert(await res.text());
    return null;
  }

  return true;
}

async function deleteAdminDoll(id) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_DOLLS}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    alert(await res.text());
    return null;
  }

  return true;
}

const API_CATEGORIES = `${API_URL}/api/admin/categories`;

async function getAdminCategories() {
  const token = localStorage.getItem("token");

  const res = await fetch(API_CATEGORIES, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    console.error(await res.text());
    return [];
  }

  return await res.json();
}

async function createAdminCategory(name) {
  const token = localStorage.getItem("token");

  const res = await fetch(API_CATEGORIES, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      name
    })
  });

  if (!res.ok) {
    alert(await res.text());
    return null;
  }

  return await res.json();
}

async function updateAdminCategory(id, name) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_CATEGORIES}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      name
    })
  });

  if (!res.ok) {
    alert(await res.text());
    return null;
  }

  return await res.json();
}

async function deleteAdminCategory(id) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_CATEGORIES}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    alert(await res.text());
    return null;
  }

  return true;
}

const API_ADMIN_USERS = `${API_URL}/api/admin/users`;

async function getAdminUsers() {
  const token = localStorage.getItem("token");

  const res = await fetch(API_ADMIN_USERS, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    console.error("Ошибка загрузки пользователей:", await res.text());
    return [];
  }

  return await res.json();
}

async function banAdminUser(id, reason) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_ADMIN_USERS}/${id}/ban`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ reason })
  });

  if (!res.ok) {
    alert(await res.text());
    return null;
  }

  return true;
}

async function blockAdminUser(id, reason, blockedUntil) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_ADMIN_USERS}/${id}/block`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      reason,
      blockedUntil
    })
  });

  if (!res.ok) {
    alert(await res.text());
    return null;
  }

  return true;
}

async function unblockAdminUser(id) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_ADMIN_USERS}/${id}/unblock`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    alert(await res.text());
    return null;
  }

  return true;
}

const API_ADMIN_POSTS = `${API_URL}/api/admin/posts`;

async function getAdminPosts() {
  const token = localStorage.getItem("token");

  const res = await fetch(API_ADMIN_POSTS, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    console.error("Ошибка загрузки постов:", await res.text());
    return [];
  }

  return await res.json();
}

async function hideAdminPost(id, reason) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_ADMIN_POSTS}/${id}/hide`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ reason })
  });

  if (!res.ok) {
    alert(await res.text());
    return null;
  }

  return true;
}

async function unhideAdminPost(id) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_ADMIN_POSTS}/${id}/unhide`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    alert(await res.text());
    return null;
  }

  return true;
}

const API_ADMIN_PRODUCT_ADS = `${API_URL}/api/admin/product-ads`;

async function getAdminProductAds() {
  const token = localStorage.getItem("token");

  const res = await fetch(API_ADMIN_PRODUCT_ADS, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    console.error("Ошибка загрузки объявлений:", await res.text());
    return [];
  }

  return await res.json();
}

async function hideAdminProductAd(id, reason) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_ADMIN_PRODUCT_ADS}/${id}/hide`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ reason })
  });

  if (!res.ok) {
    alert(await res.text());
    return null;
  }

  return true;
}

async function unhideAdminProductAd(id) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_ADMIN_PRODUCT_ADS}/${id}/unhide`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    alert(await res.text());
    return null;
  }

  return true;
}