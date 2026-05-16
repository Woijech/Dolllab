const API_PRODUCT_ADS = "https://localhost:7145/api/product-ads";

async function createProductAd(token, data) {
  try {
    const formData = new FormData();

    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("price", data.price);
    formData.append("categoryId", data.categoryId);

    data.images.forEach(image => {
      formData.append("images", image);
    });

    const res = await fetch(API_PRODUCT_ADS, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Ошибка создания объявления:", res.status, errorText);
      throw new Error(errorText);
    }

    return await res.json();
  } catch (error) {
    console.error("Ошибка createProductAd:", error);
    throw error;
  }
}

async function getProductAds(filters = {}) {
  const params = new URLSearchParams();

  if (filters.categoryId) params.append("categoryId", filters.categoryId);
  if (filters.priceFrom) params.append("priceFrom", filters.priceFrom);
  if (filters.priceTo) params.append("priceTo", filters.priceTo);
  if (filters.search?.trim()) {
  params.append("search", filters.search.trim());
}

  const url = params.toString()
    ? `${API_PRODUCT_ADS}?${params.toString()}`
    : API_PRODUCT_ADS;

  const res = await fetch(url);

  if (!res.ok) {
    console.error("Ошибка загрузки объявлений:", res.status, await res.text());
    return [];
  }

  return await res.json();
}

async function getProductAdById(id) {
  try {
    const res = await fetch(`${API_PRODUCT_ADS}/${id}`);

    if (!res.ok) {
      console.error("Ошибка загрузки объявления:", res.status, await res.text());
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error("Ошибка getProductAdById:", error);
    return null;
  }
}

async function getMyProductAds(token) {
  const res = await fetch(`${API_PRODUCT_ADS}/my`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    console.error("Ошибка загрузки моих объявлений:", res.status, await res.text());
    return [];
  }

  return await res.json();
}

async function getUserProductAds(userId) {
  const res = await fetch(`${API_PRODUCT_ADS}/user/${userId}`);

  if (!res.ok) {
    console.error("Ошибка загрузки объявлений пользователя:", res.status, await res.text());
    return [];
  }

  return await res.json();
}

async function getProductCategories() {
  const res = await fetch(`${API_PRODUCT_ADS}/categories`);

  if (!res.ok) {
    console.error("Ошибка загрузки категорий:", res.status, await res.text());
    return [];
  }

  return await res.json();
}

async function updateProductAd(token, adId, data) {
  const res = await fetch(`${API_PRODUCT_ADS}/${adId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      title: data.title,
      description: data.description,
      price: Number(data.price),
      categoryId: Number(data.categoryId)
    })
  });

  if (!res.ok) {
    console.error("Ошибка обновления объявления:", res.status, await res.text());
    return null;
  }

  return await res.json();
}

async function deleteProductAd(token, adId) {
  const res = await fetch(`${API_PRODUCT_ADS}/${adId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    console.error("Ошибка удаления объявления:", res.status, await res.text());
    return null;
  }

  return await res.json();
}

const API_CART = "https://localhost:7145/api/cart";

async function getMyCart(token) {
  const res = await fetch(API_CART, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    console.error("Ошибка загрузки корзины:", res.status, await res.text());
    return [];
  }

  return await res.json();
}

async function addToCart(token, productAdId) {
  const res = await fetch(`${API_CART}/${productAdId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const text = await res.text();
    alert(text);
    return null;
  }

  return await res.json();
}

async function removeFromCart(token, productAdId) {
  const res = await fetch(`${API_CART}/${productAdId}`, {
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

async function clearCart(token) {
  const res = await fetch(`${API_CART}/clear`, {
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

const API_REVIEWS = "https://localhost:7145/api/user-reviews";

async function getUserReviews(userId) {
  const res = await fetch(`${API_REVIEWS}/user/${userId}`);

  if (!res.ok) {
    console.error("Ошибка загрузки отзывов:", res.status, await res.text());
    return [];
  }

  return await res.json();
}

async function createUserReview(userId, rating, description) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_REVIEWS}/user/${userId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      rating: Number(rating),
      description
    })
  });

  if (!res.ok) {
    alert(await res.text());
    return null;
  }

  return await res.json();
}

async function deleteReview(reviewId) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_REVIEWS}/${reviewId}`, {
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