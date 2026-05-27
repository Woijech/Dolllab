const adminContent = document.getElementById("adminContent");

const defaultAdminPageHTML = adminContent.innerHTML;

function renderAdminDashboard() {
  adminContent.innerHTML = defaultAdminPageHTML;
  loadAdminStats();
  loadActiveReportsBlock();

}

async function renderAdminDollopedia() {
  const dolls = await getAdminDolls();

  const content = document.querySelector(".admin-content");

  content.innerHTML = `
    <section class="admin-dollopedia-page">

      <div class="admin-section-header">
        <h1>Куклопедия</h1>

        <button class="admin-add-btn" onclick="openDollModal()">
          <img src="/icons/plus.svg" alt="">
        </button>
      </div>

      <div class="admin-dolls-list">
        ${
          dolls && dolls.length > 0
            ? dolls.map(doll => `
              <div class="admin-doll-row">
                <img
                  src="${doll.imageUrl ? `https://localhost:7145${doll.imageUrl}` : "/icons/blank_pfp.jpg"}"
                  alt="${doll.name}"
                >

                <div class="admin-doll-info">
                  <h3>${doll.name}</h3>
                  <p>${doll.brand || "Бренд не указан"} • ${doll.series || "Серия не указана"} • ${doll.releaseYear || "Год не указан"}</p>
                </div>

                <div class="admin-doll-actions">
                  <button onclick='openDollModal(${JSON.stringify(doll)})'>
                    <img src="/icons/pencil.svg" alt="Редактировать">
                  </button>

                  <button onclick="removeAdminDoll('${doll.id}')">
                    <img src="/icons/trash.svg" alt="Удалить">
                  </button>
                </div>
              </div>
            `).join("")
            : `<div class="section-placeholder">Кукол пока нет</div>`
        }
      </div>

    </section>
  `;
}

window.openDollModal = function(doll = null) {
  let modal = document.getElementById("adminDollModal");

  if (!modal) {
    document.body.insertAdjacentHTML("beforeend", `
      <div class="modal hidden" id="adminDollModal">
        <div class="modal-overlay" onclick="closeDollModal()"></div>

        <div class="modal-content admin-doll-modal-content">
          <img src="/icons/cross.svg" class="modal-close-icon" onclick="closeDollModal()" alt="Закрыть">

          <h2 id="adminDollModalTitle">Добавить куклу</h2>

          <input class="admin-input" id="dollNameInput" placeholder="Название">
          <input class="admin-input" id="dollBrandInput" placeholder="Бренд">
          <input class="admin-input" id="dollSeriesInput" placeholder="Серия">
          <input class="admin-input" id="dollYearInput" type="number" placeholder="Год выпуска">
<input
  class="admin-input"
  id="dollImagePathInput"
  placeholder="Путь к изображению"
  readonly
>

<label for="dollImageInput" class="file-upload-btn">
  Выбрать фото
</label>

<input
  type="file"
  id="dollImageInput"
  accept="image/*"
  style="display:none;"
>
          <textarea class="admin-textarea" id="dollDescriptionInput" placeholder="Описание"></textarea>

          <button class="admin-save-btn" onclick="saveAdminDoll()">
            Сохранить
          </button>
        </div>
      </div>
    `);

    modal = document.getElementById("adminDollModal");
  }

  modal.dataset.dollId = doll?.id || "";

  document.getElementById("adminDollModalTitle").textContent =
    doll ? "Редактировать куклу" : "Добавить куклу";

  document.getElementById("dollNameInput").value = doll?.name || "";
  document.getElementById("dollBrandInput").value = doll?.brand || "";
  document.getElementById("dollSeriesInput").value = doll?.series || "";
  document.getElementById("dollYearInput").value = doll?.releaseYear || "";
document.getElementById("dollImagePathInput").value = doll?.imageUrl || "";
  document.getElementById("dollDescriptionInput").value = doll?.description || "";
const imageInput = document.getElementById("dollImageInput");
const imagePathInput = document.getElementById("dollImagePathInput");

imageInput.onchange = () => {
  const file = imageInput.files[0];

  if (!file) return;

  imagePathInput.value = `/images/dolls/${file.name}`;
};

  modal.classList.remove("hidden");
  modal.classList.add("show");
};

window.closeDollModal = function() {
  const modal = document.getElementById("adminDollModal");
  if (!modal) return;

  modal.classList.add("hidden");
  modal.classList.remove("show");
};

window.saveAdminDoll = async function() {
  const modal = document.getElementById("adminDollModal");
  const id = modal.dataset.dollId;

  const image = document.getElementById("dollImageInput").files[0];

  const formData = new FormData();
  const imageInput = document.getElementById("dollImageInput");
  const imagePathInput = document.getElementById("dollImagePathInput");

if (image) {
  formData.append("image", image);
}

formData.append("imageUrl", imagePathInput.value.trim());

  formData.append("name", document.getElementById("dollNameInput").value.trim());
  formData.append("brand", document.getElementById("dollBrandInput").value.trim());
  formData.append("series", document.getElementById("dollSeriesInput").value.trim());
  formData.append("description", document.getElementById("dollDescriptionInput").value.trim());

  const releaseYear = document.getElementById("dollYearInput").value;
  if (releaseYear) {
    formData.append("releaseYear", releaseYear);
  }

  if (image) {
    formData.append("image", image);
  }

  if (!formData.get("name")) {
    alert("Введите название куклы");
    return;
  }

  let result;

  if (id) {
    result = await updateAdminDoll(id, formData);
  } else {
    result = await addAdminDoll(formData);
  }

  if (!result) return;

  closeDollModal();
  await renderAdminDollopedia();
};

window.removeAdminDoll = async function(id) {
  if (!id) {
    alert("Id куклы не найден");
    return;
  }

  if (!confirm("Удалить куклу?")) return;

  const result = await deleteAdminDoll(id);

  if (!result) return;

  await renderAdminDollopedia();
};

function navigateAdminTo(route) {
  window.location.hash = route;
}

async function handleAdminDeepLink() {
  const hash = window.location.hash.replace("#", "");

  if (hash === "dollopedia") {
    await renderAdminDollopedia();
    return;
  }
  if (hash === "categories") {
  await renderAdminCategories();
  return;
}
if (hash === "users") {
  await renderAdminUsers();
  return;
}
if (hash === "posts") {
  await renderAdminPosts();
  return;
}
if (hash === "product-ads") {
  await renderAdminProductAds();
  return;
}
if (hash === "reports") {
  await renderAdminReports();
  return;
}

  renderAdminDashboard();
}


document.getElementById("adminDollopediaBtn")
  ?.addEventListener("click", () => {
    navigateAdminTo("dollopedia");
  });

document.getElementById("adminCategoriesBtn")
  ?.addEventListener("click", () => {
    navigateAdminTo("categories");
  });

document.getElementById("adminUsersBtn")
  ?.addEventListener("click", () => {
    navigateAdminTo("users");
  });
document.getElementById("adminPostsBtn")
  ?.addEventListener("click", () => {
    navigateAdminTo("posts");
  });


  async function renderAdminCategories() {
  const categories = await getAdminCategories();

  const content = document.getElementById("adminContent");

  content.innerHTML = `
    <section class="admin-dollopedia-page">

      <div class="admin-section-header">
        <h1>Категории магазина</h1>

        <button class="admin-add-btn" onclick="openCategoryModal()">
          <img src="/icons/plus.svg" alt="">
        </button>
      </div>

      <div class="admin-dolls-list">
        ${
          categories.length > 0
            ? categories.map(category => `
<div class="admin-doll-row admin-category-row">

                <div class="admin-doll-info">
                  <h3>${category.name}</h3>
                </div>

                <div class="admin-doll-actions">

                  <button onclick='openCategoryModal(${JSON.stringify(category)})'>
                    <img src="/icons/pencil.svg">
                  </button>

                  <button onclick="removeAdminCategory('${category.id}')">
                    <img src="/icons/trash.svg">
                  </button>

                </div>
              </div>
            `).join("")
            : `<div class="section-placeholder">Категорий пока нет</div>`
        }
      </div>

    </section>
  `;
}

window.openCategoryModal = function(category = null) {
  let modal = document.getElementById("adminCategoryModal");

  if (!modal) {
    document.body.insertAdjacentHTML("beforeend", `
      <div class="modal hidden" id="adminCategoryModal">
        <div class="modal-overlay" onclick="closeCategoryModal()"></div>

        <div class="modal-content admin-category-modal">
          <img src="/icons/cross.svg" class="modal-close-icon" onclick="closeCategoryModal()" alt="Закрыть">

          <h2 id="adminCategoryModalTitle">Добавить категорию</h2>

          <input
            class="admin-input"
            id="adminCategoryNameInput"
            placeholder="Название категории"
          >

          <button class="admin-save-btn" onclick="saveAdminCategory()">
            Сохранить
          </button>
        </div>
      </div>
    `);

    modal = document.getElementById("adminCategoryModal");
  }

  modal.dataset.categoryId = category?.id || "";

  document.getElementById("adminCategoryModalTitle").textContent =
    category ? "Редактировать категорию" : "Добавить категорию";

  document.getElementById("adminCategoryNameInput").value =
    category?.name || "";

  modal.classList.remove("hidden");
  modal.classList.add("show");
};

window.closeCategoryModal = function() {
  const modal = document.getElementById("adminCategoryModal");
  if (!modal) return;

  modal.classList.add("hidden");
  modal.classList.remove("show");
};

window.saveAdminCategory = async function() {
  const modal = document.getElementById("adminCategoryModal");

  const id = modal.dataset.categoryId;

  const name = document
    .getElementById("adminCategoryNameInput")
    .value
    .trim();

  if (!name) {
    alert("Введите название");
    return;
  }

  let result;

  if (id) {
    result = await updateAdminCategory(id, name);
  } else {
    result = await createAdminCategory(name);
  }

  if (!result) return;

  closeCategoryModal();

  await renderAdminCategories();
};

window.removeAdminCategory = async function(id) {
  if (!confirm("Удалить категорию?")) return;

  const result = await deleteAdminCategory(id);

  if (!result) return;

  await renderAdminCategories();
};

async function renderAdminUsers() {
  const users = await getAdminUsers();
  const content = document.getElementById("adminContent");

  content.innerHTML = `
    <section class="admin-users-page">

      <div class="admin-section-header">
        <h1>Управление пользователями</h1>
      </div>

      <div class="admin-users-table-wrapper">
        <table class="admin-users-table">
          <thead>
            <tr>
              <th>Пользователь</th>
              <th>Имя</th>
              <th>Email</th>
              <th>Статус</th>
              <th>Жалобы</th>
              <th>Действия</th>
            </tr>
          </thead>

          <tbody>
            ${
              users.length > 0
                ? users.map(user => `
                  <tr>
                    <td>
                      <div class="admin-user-mini">
<img
  src="${
    user.avatarUrl
      ? `https://localhost:7145${user.avatarUrl}`
      : '/icons/blank_pfp.jpg'
  }"
  class="admin-user-avatar"
>
                        <span>${user.username}</span>
                      </div>
                    </td>

                    <td>${user.username}</td>

                    <td>${user.email || "—"}</td>

                    <td>
                      ${getAdminUserStatus(user)}
                    </td>

                    <td>
                      <span class="admin-report-badge">0</span>
                    </td>

                    <td>
                      <div class="admin-user-actions">
                        <button onclick="openBanUserModal('${user.id}', '${user.username}')">
                          Забанить
                        </button>

                        <button onclick="openBlockUserModal('${user.id}', '${user.username}')">
                          Временно заблокировать
                        </button>

                        <button onclick="unblockUserFromAdmin('${user.id}')">
                          Разблокировать
                        </button>

                        <button onclick="alert('Жалобы пока заглушка')">
                          Посмотреть жалобы
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join("")
                : `
                  <tr>
                    <td colspan="6">
                      <div class="section-placeholder">Пользователей пока нет</div>
                    </td>
                  </tr>
                `
            }
          </tbody>
        </table>
      </div>

    </section>
  `;
}

function getAdminUserStatus(user) {
  if (user.isBanned) {
    return `<span class="admin-status banned">Забанен</span>`;
  }

  if (user.blockedUntil && new Date(user.blockedUntil) > new Date()) {
    return `<span class="admin-status blocked">Заблокирован до ${new Date(user.blockedUntil).toLocaleDateString("ru-RU")}</span>`;
  }

  return `<span class="admin-status active">Активен</span>`;
}

window.openBanUserModal = function(userId, username) {
  let modal = document.getElementById("adminBanUserModal");

  if (!modal) {
    document.body.insertAdjacentHTML("beforeend", `
      <div class="modal hidden" id="adminBanUserModal">
        <div class="modal-overlay" onclick="closeBanUserModal()"></div>

        <div class="modal-content admin-action-modal">
          <img src="/icons/cross.svg" class="modal-close-icon" onclick="closeBanUserModal()" alt="Закрыть">

          <h2 id="banUserTitle">Забанить пользователя</h2>

          <textarea
            class="admin-textarea"
            id="banReasonInput"
            placeholder="Причина бана"
          ></textarea>

          <button class="admin-save-btn" onclick="saveBanUser()">
            Забанить
          </button>
        </div>
      </div>
    `);

    modal = document.getElementById("adminBanUserModal");
  }

  modal.dataset.userId = userId;
  document.getElementById("banUserTitle").textContent = `Забанить ${username}`;
  document.getElementById("banReasonInput").value = "";

  modal.classList.remove("hidden");
  modal.classList.add("show");
};

window.closeBanUserModal = function() {
  const modal = document.getElementById("adminBanUserModal");
  if (!modal) return;

  modal.classList.add("hidden");
  modal.classList.remove("show");
};

window.saveBanUser = async function() {
  const modal = document.getElementById("adminBanUserModal");
  const userId = modal.dataset.userId;
  const reason = document.getElementById("banReasonInput").value.trim();

  if (!reason) {
    alert("Введите причину");
    return;
  }

  const result = await banAdminUser(userId, reason);

  if (!result) return;

  closeBanUserModal();
  await renderAdminUsers();
};

window.openBlockUserModal = function(userId, username) {
  let modal = document.getElementById("adminBlockUserModal");

  if (!modal) {
    document.body.insertAdjacentHTML("beforeend", `
      <div class="modal hidden" id="adminBlockUserModal">
        <div class="modal-overlay" onclick="closeBlockUserModal()"></div>

        <div class="modal-content admin-action-modal">
          <img src="/icons/cross.svg" class="modal-close-icon" onclick="closeBlockUserModal()" alt="Закрыть">

          <h2 id="blockUserTitle">Временно заблокировать пользователя</h2>

          <input
            class="admin-input"
            id="blockUntilInput"
            type="datetime-local"
          >

          <textarea
            class="admin-textarea"
            id="blockReasonInput"
            placeholder="Причина временной блокировки"
          ></textarea>

          <button class="admin-save-btn" onclick="saveBlockUser()">
            Заблокировать
          </button>
        </div>
      </div>
    `);

    modal = document.getElementById("adminBlockUserModal");
  }

  modal.dataset.userId = userId;
  document.getElementById("blockUserTitle").textContent =
    `Временно заблокировать ${username}`;

  document.getElementById("blockUntilInput").value = "";
  document.getElementById("blockReasonInput").value = "";

  modal.classList.remove("hidden");
  modal.classList.add("show");
};

window.closeBlockUserModal = function() {
  const modal = document.getElementById("adminBlockUserModal");
  if (!modal) return;

  modal.classList.add("hidden");
  modal.classList.remove("show");
};

window.saveBlockUser = async function() {
  const modal = document.getElementById("adminBlockUserModal");
  const userId = modal.dataset.userId;

  const blockedUntil = document.getElementById("blockUntilInput").value;
  const reason = document.getElementById("blockReasonInput").value.trim();

  if (!blockedUntil) {
    alert("Укажите дату окончания блокировки");
    return;
  }

  if (!reason) {
    alert("Введите причину");
    return;
  }

  const result = await blockAdminUser(userId, reason, new Date(blockedUntil).toISOString());

  if (!result) return;

  closeBlockUserModal();
  await renderAdminUsers();
};

window.unblockUserFromAdmin = async function(userId) {
  if (!confirm("Разблокировать пользователя?")) return;

  const result = await unblockAdminUser(userId);

  if (!result) return;

  await renderAdminUsers();
};

async function renderAdminPosts() {
  const posts = await getAdminPosts();
  const content = document.getElementById("adminContent");

  content.innerHTML = `
    <section class="admin-users-page">

      <div class="admin-section-header">
        <h1>Модерация постов</h1>
      </div>

      <div class="admin-users-table-wrapper">
        <table class="admin-users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Автор</th>
              <th>Описание</th>
              <th>Дата</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>

          <tbody>
            ${
              posts.length > 0
                ? posts.map(post => `
                  <tr>
                    <td>${post.id}</td>

                    <td>${post.user?.username || "Пользователь"}</td>

                    <td class="admin-post-description">
                      ${post.description || "Без описания"}
                    </td>

                    <td>
                      ${
                        post.createdAt
                          ? new Date(post.createdAt).toLocaleDateString("ru-RU")
                          : "—"
                      }
                    </td>

                    <td>
                      ${
                        post.isHidden
                          ? `<span class="admin-status banned">Скрыт</span>`
                          : `<span class="admin-status active">Отображается</span>`
                      }
                    </td>

                    <td>
                      <div class="admin-user-actions">
                        ${
                          post.isHidden
                            ? `
                              <button onclick="unhidePostFromAdmin('${post.id}')">
                                Показать
                              </button>
                            `
                            : `
                              <button onclick="openHidePostModal('${post.id}')">
                                Скрыть
                              </button>
                            `
                        }

                        <button onclick="alert('Просмотр поста пока заглушка')">
                          Посмотреть
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join("")
                : `
                  <tr>
                    <td colspan="6">
                      <div class="section-placeholder">Постов пока нет</div>
                    </td>
                  </tr>
                `
            }
          </tbody>
        </table>
      </div>

    </section>
  `;
}

window.openHidePostModal = function(postId) {
  let modal = document.getElementById("adminHidePostModal");

  if (!modal) {
    document.body.insertAdjacentHTML("beforeend", `
      <div class="modal hidden" id="adminHidePostModal">
        <div class="modal-overlay" onclick="closeHidePostModal()"></div>

        <div class="modal-content admin-action-modal">
          <img src="/icons/cross.svg" class="modal-close-icon" onclick="closeHidePostModal()" alt="Закрыть">

          <h2>Скрыть пост</h2>

          <textarea
            class="admin-textarea"
            id="hidePostReasonInput"
            placeholder="Причина скрытия"
          ></textarea>

          <button class="admin-save-btn" onclick="saveHidePost()">
            Скрыть
          </button>
        </div>
      </div>
    `);

    modal = document.getElementById("adminHidePostModal");
  }

  modal.dataset.postId = postId;
  document.getElementById("hidePostReasonInput").value = "";

  modal.classList.remove("hidden");
  modal.classList.add("show");
};

window.closeHidePostModal = function() {
  const modal = document.getElementById("adminHidePostModal");
  if (!modal) return;

  modal.classList.add("hidden");
  modal.classList.remove("show");
};

window.saveHidePost = async function() {
  const modal = document.getElementById("adminHidePostModal");
  const postId = modal.dataset.postId;

  const reason = document.getElementById("hidePostReasonInput").value.trim();

  if (!reason) {
    alert("Введите причину скрытия");
    return;
  }

  const result = await hideAdminPost(postId, reason);

  if (!result) return;

  closeHidePostModal();
  await renderAdminPosts();
};

window.unhidePostFromAdmin = async function(postId) {
  const result = await unhideAdminPost(postId);

  if (!result) return;

  await renderAdminPosts();
};

async function loadAdminStats() {
  const users = await getAdminUsers();
  const posts = await getAdminPosts();
  const ads = await getAdminProductAds();

  const usersCount = document.getElementById("adminUsersCount");
  const postsCount = document.getElementById("adminPostsCount");
  const adsCount = document.getElementById("adminAdsCount");
  const reports = await getAdminReports();
  const reportsCount = document.getElementById("adminReportsCount");

  if (reportsCount) reportsCount.textContent = reports.length;
  if (usersCount) usersCount.textContent = users.length;
  if (postsCount) postsCount.textContent = posts.length;
  if (adsCount) adsCount.textContent = ads.length;
}

async function renderAdminProductAds() {
  const ads = await getAdminProductAds();
  const content = document.getElementById("adminContent");

  content.innerHTML = `
    <section class="admin-users-page">

      <div class="admin-section-header">
        <h1>Модерация объявлений</h1>
      </div>

      <div class="admin-users-table-wrapper">
        <table class="admin-users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Автор</th>
              <th>Название</th>
              <th>Категория</th>
              <th>Цена</th>
              <th>Дата</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>

          <tbody>
            ${
              ads.length > 0
                ? ads.map(ad => `
                  <tr>
                    <td>${ad.id}</td>

                    <td>${ad.user?.username || "Пользователь"}</td>

                    <td class="admin-post-description">
                      ${ad.title || "Без названия"}
                    </td>

                    <td>${ad.category?.name || "—"}</td>

                    <td>${ad.price ?? 0}р</td>

                    <td>
                      ${
                        ad.createdAt
                          ? new Date(ad.createdAt).toLocaleDateString("ru-RU")
                          : "—"
                      }
                    </td>

                    <td>
                      ${
                        ad.isHidden
                          ? `<span class="admin-status banned">Скрыто</span>`
                          : `<span class="admin-status active">Отображается</span>`
                      }
                    </td>

                    <td>
                      <div class="admin-user-actions">
                        ${
                          ad.isHidden
                            ? `
                              <button onclick="unhideProductAdFromAdmin('${ad.id}')">
                                Показать
                              </button>
                            `
                            : `
                              <button onclick="openHideProductAdModal('${ad.id}')">
                                Скрыть
                              </button>
                            `
                        }

                        <button onclick="alert('Просмотр объявления пока заглушка')">
                          Посмотреть
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join("")
                : `
                  <tr>
                    <td colspan="8">
                      <div class="section-placeholder">Объявлений пока нет</div>
                    </td>
                  </tr>
                `
            }
          </tbody>
        </table>
      </div>

    </section>
  `;
}

window.openHideProductAdModal = function(adId) {
  let modal = document.getElementById("adminHideProductAdModal");

  if (!modal) {
    document.body.insertAdjacentHTML("beforeend", `
      <div class="modal hidden" id="adminHideProductAdModal">
        <div class="modal-overlay" onclick="closeHideProductAdModal()"></div>

        <div class="modal-content admin-action-modal">
          <img src="/icons/cross.svg" class="modal-close-icon" onclick="closeHideProductAdModal()" alt="Закрыть">

          <h2>Скрыть объявление</h2>

          <textarea
            class="admin-textarea"
            id="hideProductAdReasonInput"
            placeholder="Причина скрытия"
          ></textarea>

          <button class="admin-save-btn" onclick="saveHideProductAd()">
            Скрыть
          </button>
        </div>
      </div>
    `);

    modal = document.getElementById("adminHideProductAdModal");
  }

  modal.dataset.adId = adId;
  document.getElementById("hideProductAdReasonInput").value = "";

  modal.classList.remove("hidden");
  modal.classList.add("show");
};

window.closeHideProductAdModal = function() {
  const modal = document.getElementById("adminHideProductAdModal");
  if (!modal) return;

  modal.classList.add("hidden");
  modal.classList.remove("show");
};

window.saveHideProductAd = async function() {
  const modal = document.getElementById("adminHideProductAdModal");
  const adId = modal.dataset.adId;

  const reason = document.getElementById("hideProductAdReasonInput").value.trim();

  if (!reason) {
    alert("Введите причину скрытия");
    return;
  }

  const result = await hideAdminProductAd(adId, reason);

  if (!result) return;

  closeHideProductAdModal();
  await renderAdminProductAds();
};

window.unhideProductAdFromAdmin = async function(adId) {
  const result = await unhideAdminProductAd(adId);

  if (!result) return;

  await renderAdminProductAds();
};

async function renderAdminReports() {
  const reports = await getAdminReports();
  const content = document.getElementById("adminContent");

  content.innerHTML = `
    <section class="admin-users-page">
      <div class="admin-section-header">
        <h1>Жалобы</h1>
      </div>

      <div class="admin-users-table-wrapper">
        <table class="admin-users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Кто отправил</th>
              <th>На что жалоба</th>
              <th>Причина</th>
              <th>Описание</th>
              <th>Дата</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>

          <tbody>
            ${
              reports.length > 0
                ? reports.map(report => `
                  <tr>
                    <td>${report.id}</td>

                    <td>
                      <div class="admin-user-mini">
                        <img
                          class="admin-user-avatar"
                          src="${
                            report.reporter?.avatarUrl
                              ? `https://localhost:7145${report.reporter.avatarUrl}`
                              : "/icons/blank_pfp.jpg"
                          }"
                        >
                        <span>${report.reporter?.username || "Пользователь"}</span>
                      </div>
                    </td>

                    <td>${getAdminReportTargetText(report)}</td>

                    <td>${report.reason || "—"}</td>

                    <td class="admin-post-description">
                      ${report.description || "Описание не указано"}
                    </td>

                    <td>
                      ${
                        report.createdAt
                          ? new Date(report.createdAt).toLocaleDateString("ru-RU")
                          : "—"
                      }
                    </td>

                    <td>${getAdminReportStatusBadge(report.status)}</td>

                    <td>
                      <div class="admin-user-actions">
                        <button onclick="openReviewReportModal('${report.id}', 'review')">
                          Рассмотрена
                        </button>

                        <button onclick="openReviewReportModal('${report.id}', 'reject')">
                          Отклонить
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join("")
                : `
                  <tr>
                    <td colspan="8">
                      <div class="section-placeholder">Жалоб пока нет</div>
                    </td>
                  </tr>
                `
            }
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function getAdminReportTargetText(report) {
  if (report.reportedUser) {
    return `Пользователь: ${report.reportedUser.username}`;
  }

  if (report.reportedPost) {
    return `Пост #${report.reportedPost.id}`;
  }

  if (report.reportedProductAd) {
    return `Объявление: ${report.reportedProductAd.title}`;
  }

  return "Неизвестно";
}

function getAdminReportStatusBadge(status) {
  switch (status) {
    case 0:
      return `<span class="admin-status blocked">На рассмотрении</span>`;
    case 1:
      return `<span class="admin-status active">Рассмотрена</span>`;
    case 2:
      return `<span class="admin-status banned">Отклонена</span>`;
    default:
      return `<span class="admin-status">Неизвестно</span>`;
  }
}

window.openReviewReportModal = function(reportId, action) {
  let modal = document.getElementById("adminReviewReportModal");

  if (!modal) {
    document.body.insertAdjacentHTML("beforeend", `
      <div class="modal hidden" id="adminReviewReportModal">
        <div class="modal-overlay" onclick="closeReviewReportModal()"></div>

        <div class="modal-content admin-action-modal">
          <img src="/icons/cross.svg" class="modal-close-icon" onclick="closeReviewReportModal()" alt="Закрыть">

          <h2 id="adminReviewReportTitle">Решение по жалобе</h2>

          <textarea
            class="admin-textarea"
            id="adminReportCommentInput"
            placeholder="Комментарий администратора"
          ></textarea>

          <button class="admin-save-btn" onclick="saveReviewReportDecision()">
            Сохранить
          </button>
        </div>
      </div>
    `);

    modal = document.getElementById("adminReviewReportModal");
  }

  modal.dataset.reportId = reportId;
  modal.dataset.action = action;

  document.getElementById("adminReviewReportTitle").textContent =
    action === "review" ? "Отметить жалобу рассмотренной" : "Отклонить жалобу";

  document.getElementById("adminReportCommentInput").value = "";

  modal.classList.remove("hidden");
  modal.classList.add("show");
};

window.closeReviewReportModal = function() {
  const modal = document.getElementById("adminReviewReportModal");
  if (!modal) return;

  modal.classList.add("hidden");
  modal.classList.remove("show");
};

window.saveReviewReportDecision = async function() {
  const modal = document.getElementById("adminReviewReportModal");

  const reportId = modal.dataset.reportId;
  const action = modal.dataset.action;
  const adminComment = document.getElementById("adminReportCommentInput").value.trim();

  let result;

  if (action === "review") {
    result = await reviewAdminReport(reportId, adminComment);
  } else {
    result = await rejectAdminReport(reportId, adminComment);
  }

  if (!result) return;

  closeReviewReportModal();
  await renderAdminReports();
};

async function getPendingAdminReports() {
  return await getAdminReports(0);
}

async function loadActiveReportsBlock() {
  const pendingReports = await getPendingAdminReports();
  const list = document.getElementById("adminActiveReportsList");

  if (!list) return;

 list.innerHTML = pendingReports.length > 0
  ? pendingReports.slice(0, 5).map(report => `
    <div class="admin-report-item" onclick="navigateAdminTo('reports')">
      <div class="admin-report-left">

        <div class="admin-report-icon">
          <img src="${
            report.reportedUser
              ? "/icons/users.svg"
              : report.reportedPost
                ? "/icons/posts.svg"
                : "/icons/shop.svg"
          }" alt="">
        </div>

        <div>
          <h4>${
            report.reportedUser
              ? "Жалоба на пользователя"
              : report.reportedPost
                ? "Жалоба на пост"
                : "Жалоба на объявление"
          }</h4>

          <p>${report.reason || "Без причины"}</p>
        </div>

      </div>

      <div class="admin-report-count">!</div>
    </div>
  `).join("")
  : `
    <div class="admin-no-active-reports">
      Активных жалоб нет
    </div>
  `;
}
  handleAdminDeepLink();

window.addEventListener("hashchange", handleAdminDeepLink);
loadAdminStats();