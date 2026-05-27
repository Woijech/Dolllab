const API_POSTS = "https://localhost:7145/api/post";

// Получение моих постов
async function getMyPosts(token) {
  try {
    console.log('🔍 Загрузка моих постов...');
    const res = await fetch(`${API_POSTS}/my`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Ошибка загрузки постов:', res.status, errorText);
      return [];
    }

    const text = await res.text();
    if (!text) return [];
    
    const data = JSON.parse(text);
    console.log('✅ Посты загружены:', data);
    return data;
  } catch (error) {
    console.error('Ошибка получения постов:', error);
    return [];
  }
}

// Получение поста по ID
async function getPostById(postId) {
  try {
    console.log('🔍 Загрузка поста:', postId);
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_POSTS}/${postId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      throw new Error("Post not found");
    }

    return await res.json();
  } catch (error) {
    console.error('Ошибка загрузки поста:', error);
    throw error;
  }
}

// Создание поста
async function createPost(token, data) {
  try {
    console.log('📤 Создание поста...');
    
    const formData = new FormData();

    if (data.description)
      formData.append("description", data.description);

    formData.append("image", data.image);

    const res = await fetch(API_POSTS, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    console.log('Статус ответа:', res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Ошибка сервера:', res.status, errorText);
      throw new Error(`Ошибка ${res.status}: ${errorText}`);
    }

    const text = await res.text();
    console.log('Ответ сервера:', text);
    
    if (!text) {
      console.log('Сервер вернул пустой ответ (успех)');
      return { success: true };
    }

    return JSON.parse(text);
  } catch (error) {
    console.error('Ошибка создания поста:', error);
    throw error;
  }
}

// Обновление поста
async function updatePost(token, postId, data) {
  try {
    console.log('✏️ Обновление поста:', postId);
    
    const formData = new FormData();

    if (data.description !== undefined)
      formData.append("description", data.description);

    if (data.image)
      formData.append("image", data.image);

    const res = await fetch(`${API_POSTS}/${postId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Ошибка сервера:', res.status, errorText);
      throw new Error(`Ошибка ${res.status}: ${errorText}`);
    }

    const text = await res.text();
    if (!text) {
      console.log('Пост обновлен успешно');
      return { success: true };
    }

    return JSON.parse(text);
  } catch (error) {
    console.error('Ошибка обновления поста:', error);
    throw error;
  }
}

// Удаление поста
async function deletePost(token, postId) {
  try {
    console.log('🗑️ Удаление поста:', postId);
    
    const res = await fetch(`${API_POSTS}/${postId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Ошибка сервера:', res.status, errorText);
      throw new Error(`Ошибка ${res.status}: ${errorText}`);
    }

    const text = await res.text();
    if (!text) {
      console.log('Пост удален успешно');
      return { success: true };
    }

    return JSON.parse(text);
  } catch (error) {
    console.error('Ошибка удаления поста:', error);
    throw error;
  }
}

async function togglePostLike(token, postId) {
  const res = await fetch(`${API_POSTS}/${postId}/like`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) return null;

  return await res.json();
}

async function searchUsers(query) {
  if (!query.trim()) return [];

  const url = `https://localhost:7145/api/Profile/search?query=${encodeURIComponent(query)}`;

  const res = await fetch(url);

  if (!res.ok) {
    console.error("Ошибка поиска пользователей:", res.status, await res.text());
    return [];
  }

  return await res.json();
}

async function getUserProfile(userId) {
  const token = localStorage.getItem("token");

  const res = await fetch(`https://localhost:7145/api/Profile/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) return null;

  return await res.json();
}

async function getComments(postId) {
  const response = await fetch(`${API_URL}/api/post/${postId}/comments`);

  if (!response.ok) {
    throw new Error("Ошибка загрузки комментариев");
  }

  return await response.json();
}

async function createComment(postId, text, token) {
  const response = await fetch(`${API_URL}/api/post/${postId}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ text })
  });

  if (!response.ok) {
    throw new Error("Ошибка создания комментария");
  }

  return await response.json();
}

async function deleteComment(commentId, token) {
  const response = await fetch(`${API_URL}/api/post/comments/${commentId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error("Ошибка удаления комментария");
  }

  return await response.json();
}

async function togglePostFavorite(token, postId) {
  const res = await fetch(`${API_POSTS}/${postId}/favorite`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    console.error("Ошибка избранного:", res.status, await res.text());
    return null;
  }

  return await res.json();
}

async function getMyFavoritePosts(token) {
  const res = await fetch(`${API_POSTS}/favorites/my`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    console.error("Ошибка загрузки избранного:", res.status, await res.text());
    return [];
  }

  return await res.json();
}

async function getFeedPosts(token) {
  const res = await fetch(`${API_POSTS}/feed`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    console.error("Ошибка загрузки ленты:", res.status, await res.text());
    return [];
  }

  return await res.json();
}

async function getInterestingPosts(token) {
  const res = await fetch(`${API_POSTS}/interesting`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    console.error("Ошибка загрузки интересного:", res.status, await res.text());
    return [];
  }

  return await res.json();
}

async function deleteComment(commentId, token) {
  const res = await fetch(`https://localhost:7145/api/post/comments/${commentId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    console.error("Ошибка удаления комментария:", res.status, await res.text());
    return null;
  }

  return await res.json();
}

async function reportPost(postId, reason, description) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/api/reports/posts/${postId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ reason, description })
  });

  if (!res.ok) {
    alert(await res.text());
    return null;
  }

  return await res.json();
}