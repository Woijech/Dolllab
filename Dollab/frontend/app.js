// ===== Навигация и профиль =====
let currentSection = "home";
let currentProfileTab = "posts";
let previousSection = "home";
let profileData = null;
let openedUserPosts = [];
let shopFilters = {
  categoryId: null,
  priceFrom: null,
  priceTo: null,
  search: ""
};
let cartProductIds = new Set();
let currentPostId = null;
let replyingToCommentId = null;
let currentOpenedPostAuthorId = null;

const contentArea = document.getElementById("contentArea");
const menuItems = document.querySelectorAll(".item");
const settingsBtn = document.querySelector(".settings");
const profileAvatar = document.getElementById("profileAvatar");
const searchInput = document.getElementById("searchInput");
const clearIcon = document.getElementById("clearIcon");
const searchIcon = document.getElementById("searchIcon");
const brandFilter = document.getElementById("brandFilter");
const yearFilter = document.getElementById("yearFilter");
const userSearchWrapper = document.querySelector(".user-search-wrapper");
const userSearchInput = document.getElementById("userSearchInput");
const userClearIcon = document.getElementById("userClearIcon");

function updateURLForSection(sectionId, extraParams = {}) {
  const params = new URLSearchParams();

  if (sectionId !== "home") {
    params.set("section", sectionId);
  }

  if (sectionId === "profile" && currentProfileTab !== "posts") {
    params.set("tab", currentProfileTab);
  }

  if (extraParams.userId) {
    params.set("user", extraParams.userId);
  }

  if (sectionId === "cart") {
    if (shopFilters.categoryId) params.set("category", shopFilters.categoryId);
    if (shopFilters.priceFrom) params.set("priceFrom", shopFilters.priceFrom);
    if (shopFilters.priceTo) params.set("priceTo", shopFilters.priceTo);
    if (shopFilters.search) params.set("search", shopFilters.search);
  }

  if (sectionId === "cyclopedia" && searchInput?.value) {
    params.set("dollSearch", searchInput.value);
  }

  if (sectionId === "interesting" && userSearchInput?.value) {
    params.set("userSearch", userSearchInput.value);
  }

  const queryString = params.toString();
  const baseURL = window.location.pathname;
  const newURL = queryString ? `${baseURL}?${queryString}` : baseURL;

  const currentURL = window.location.pathname + window.location.search;

  if (newURL === currentURL) {
    return;
  }

  const state = { section: sectionId, ...extraParams };

  window.history.pushState(state, "", newURL);

  console.log("URL обновлен:", window.location.href);
}

let isPushState = false;

window.addEventListener('pushstate', () => {
  isPushState = true;
  setTimeout(() => {
    isPushState = false;
  }, 100);
});



function parseURLState() {
  const params = new URLSearchParams(window.location.search);
  
  return {
    section: params.get("section") || "home",
    tab: params.get("tab") || "posts",
    userId: params.get("user"),
    category: params.get("category"),
    priceFrom: params.get("priceFrom"),
    priceTo: params.get("priceTo"),
    search: params.get("search"),
    dollSearch: params.get("dollSearch"),
    userSearch: params.get("userSearch")
  };
}


function createPostViewModal() {
  if (!document.getElementById('postViewModal')) {
    const modalHTML = `
      <div class="modal hidden" id="postViewModal">
        <div class="modal-overlay"></div>
        <div class="modal-content">
          
          <div class="post-modal-image">
            <img id="postModalImage" src="" alt="Пост">
          </div>
          
          <div class="post-modal-info">
            
            <div class="post-modal-header">
              <div class="post-modal-author">
                <img id="postModalAvatar" src="" alt="Аватар" class="post-modal-avatar">
                <span id="postModalUsername" class="post-modal-username"></span>
              </div>
            </div>
            
            <div class="post-modal-body">
              <div style="margin-bottom: 20px;">
                <p id="postModalDescription" style="color: #FF98C1; font-size: 14px; line-height: 1.6; margin-top: -8px;"></p>
              </div>
                          <div class="post-modal-comments" id="postModalComments"></div>
            </div>


              <div class="post-modal-add-comment">
                <input type="text" id="postModalCommentInput" placeholder="Добавить комментарий...">
                <button id="postModalCommentSend">
                  <img src="/icons/plane.svg" alt="Отправить">
                </button>
              </div>
                          
                          <div class="post-modal-actions">
                            <div class="post-modal-actions-row">
                              <div class="post-modal-actions-left">
              <span class="action-icon" title="Нравится" id="postModalLikeBtn">
                <img src="/icons/heart.svg" alt="Лайк" style="width: 22px; height: 22px;">
              </span>
              <span class="action-icon" title="Избранное" id="postModalFavoriteBtn">
                <img src="/icons/bookmark.svg" alt="Избранное" style="width: 22px; height: 22px;">
              </span>
                    <span
                      class="action-icon"
                      title="Пожаловаться"
                      onclick="openReportContentModal('post', currentPostId)"
                    >
                      <img src="/icons/flag.svg" alt="Жалоба" style="width: 21px; height: 21px;">
                    </span>

                </div>
              </div>
              
              <div class="post-modal-likes" id="postModalLikes">0 отметок "Нравится"</div>
              <div class="post-modal-date" id="postModalDate"></div>
            </div>
            
            <img src="/icons/cross.svg" class="modal-close-icon" alt="Закрыть" id="postModalClose">
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    document.getElementById('postModalClose').addEventListener('click', closePostModal);
    document.querySelector('#postViewModal .modal-overlay').addEventListener('click', closePostModal);
  }
}

async function openPostModal(postId) {
  try {
    currentPostId = postId;
    const post = await getPostById(postId);
    console.log('Открываем пост:', post);

    currentOpenedPostAuthorId =
      post.author?.id ||
      post.userId ||
      post.authorId ||
      null;

    createPostViewModal();

    const modal = document.getElementById('postViewModal');

    document.getElementById('postModalImage').src = post.imageUrl
      ? `${post.imageUrl}`
      : 'https://via.placeholder.com/600x800/FFE4F0/FF67A6?text=Пост';

    const username =
      post.author?.username ||
      post.userName ||
      post.authorName ||
      post.authorUsername ||
      'Пользователь';

    const usernameEl = document.getElementById('postModalUsername');
usernameEl.textContent = username;

usernameEl.style.cursor = "pointer";

usernameEl.onclick = function(event) {
  event.stopPropagation();

  closePostModal();

  openUserProfile(post.author.id);
};

    const avatarPath =
      post.author?.avatarUrl ||
      post.authorAvatarUrl ||
      post.avatarUrl;

    document.getElementById('postModalAvatar').src = avatarPath
      ? `${avatarPath}`
      : '/icons/blank_pfp.jpg';

    document.getElementById('postModalDescription').textContent =
      post.description || 'Описание отсутствует';

    const likes = post.likesCount ?? 0;
    document.getElementById('postModalLikes').textContent =
      `${likes} отметок "Нравится"`;

    const likeBtn = document.getElementById('postModalLikeBtn');
    const likeImg = likeBtn.querySelector('img');

    likeImg.src = post.isLiked
      ? '/icons/heart-filled.svg'
      : '/icons/heart.svg';

    likeBtn.onclick = async function(event) {
      event.stopPropagation();

      const token = localStorage.getItem("token");
      const result = await togglePostLike(token, postId);

      if (!result) return;

      likeImg.src = result.liked
        ? '/icons/heart-filled.svg'
        : '/icons/heart.svg';

      document.getElementById('postModalLikes').textContent =
        `${result.likesCount} отметок "Нравится"`;
    };

const favoriteBtn = document.getElementById('postModalFavoriteBtn');
const favoriteImg = favoriteBtn.querySelector('img');

favoriteImg.src = post.isFavorited
  ? '/icons/bookmark-filled.svg'
  : '/icons/bookmark.svg';

favoriteBtn.onclick = async function(event) {
  event.stopPropagation();

  const token = localStorage.getItem("token");
  const result = await togglePostFavorite(token, postId);

  if (!result) return;

  favoriteImg.src = result.isFavorited
    ? '/icons/bookmark-filled.svg'
    : '/icons/bookmark.svg';
};

const sendBtn = document.getElementById("postModalCommentSend");
const input = document.getElementById("postModalCommentInput");

sendBtn.onclick = async () => {
  const text = input.value.trim();
  if (!text) return;

  const token = localStorage.getItem("token");

  try {
    await createComment(postId, text, token, replyingToCommentId);

    replyingToCommentId = null;
    input.value = "";

    await loadComments(postId);
  } catch (e) {
    console.error("Ошибка комментария", e);
  }
};

    if (post.createdAt) {
      const date = new Date(post.createdAt);
      const now = new Date();
      const diffMs = now - date;
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHours = Math.floor(diffMin / 60);
      const diffDays = Math.floor(diffHours / 24);

      let dateStr;

      if (diffSec < 60) {
        dateStr = 'ТОЛЬКО ЧТО';
      } else if (diffMin < 60) {
        dateStr = `${diffMin} МИН НАЗАД`;
      } else if (diffHours < 24) {
        dateStr = `${diffHours} Ч НАЗАД`;
      } else if (diffDays === 1) {
        dateStr = 'ВЧЕРА';
      } else if (diffDays < 7) {
        dateStr = `${diffDays} ДН НАЗАД`;
      } else {
        dateStr = date.toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'long',
          year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
      }

      document.getElementById('postModalDate').textContent = dateStr;
    }

    modal.classList.remove('hidden');
    modal.classList.add('show');

    await loadComments(postId);

  } catch (error) {
    console.error('Ошибка открытия поста:', error);
  }
}

function closePostModal() {
  const modal = document.getElementById('postViewModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('show');
  }
}

// ===== Глобальные функции для меню на карточках постов =====
window.togglePostCardMenu = function(event, postId) {
  event.stopPropagation();
  
  document.querySelectorAll('.post-card-dropdown').forEach(menu => {
    if (menu.id !== `postCardDropdown-${postId}`) {
      menu.style.display = 'none';
    }
  });
  
  const dropdown = document.getElementById(`postCardDropdown-${postId}`);
  if (dropdown) {
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
  }
};

window.openEditPostModalFromCard = async function(postId) {
  document.querySelectorAll('.post-card-dropdown').forEach(menu => {
    menu.style.display = 'none';
  });
  
  try {
    const post = await getPostById(postId);
    createEditPostModal();
    
    setTimeout(() => {
      openEditPostModal(postId, post);
      setupEditPostModal(postId, post);
    }, 100);
  } catch (error) {
    console.error('Ошибка:', error);
  }
};

window.deletePostFromCard = async function(postId) {
  document.querySelectorAll('.post-card-dropdown').forEach(menu => {
    menu.style.display = 'none';
  });
  
const ok = await showConfirm(
  "Вы уверены, что хотите удалить этот пост?",
  {
    title: "Удаление поста",
    confirmText: "Удалить",
    cancelText: "Отмена",
    danger: true
  }
);

if (!ok) return;

const token = localStorage.getItem("token");

const result = await deletePost(token, postId);

if (result) {
  showToast("Пост удалён");
  await renderProfile();
} else {
  showToast("Ошибка при удалении поста", "error");
}
};

document.addEventListener('click', (e) => {
  if (!e.target.closest('.post-card-menu')) {
    document.querySelectorAll('.post-card-dropdown').forEach(menu => {
      menu.style.display = 'none';
    });
  }
});

// ===== Модальное окно редактирования поста =====
function createEditPostModal() {
  if (!document.getElementById('editPostModal')) {
    const modalHTML = `
      <div class="modal" id="editPostModal">
        <div class="modal-overlay"></div>
        <div class="modal-content" style="max-width: 500px;">
          <img src="/icons/cross.svg" class="modal-close-icon" alt="Закрыть" id="editPostModalClose">
          <div style="width: 100%;">
            <h2 style="color: #FF67A6; margin-bottom: 24px; text-align: center;">Редактировать пост</h2>
            
            <div style="margin-bottom: 20px; text-align: center;">
              <div id="editPostImagePreviewContainer" style="width: 100%; aspect-ratio: 1/1; background: rgba(255, 103, 166, 0.05); border: 2px dashed rgba(255, 103, 166, 0.3); border-radius: 16px; display: flex; align-items: center; justify-content: center; cursor: pointer; margin-bottom: 12px; overflow: hidden;">
                <img id="editPostPreviewImage" style="width: 100%; height: 100%; object-fit: cover;" alt="Предпросмотр">
              </div>
              <label for="editPostImageInput" class="file-upload-btn">
                Сменить фото
              </label>
              <input type="file" id="editPostImageInput" accept="image/*" style="display: none;">
              <div id="editPostFileName" style="margin-top: 8px; color: #FF98C1; font-size: 12px;"></div>
            </div>
            
            <div style="margin-bottom: 20px;">
              <label style="color: #FF67A6; font-size: 14px; margin-bottom: 8px; display: block;">Описание</label>
              <textarea id="editPostDescription" rows="4" placeholder="Описание поста..." style="width: 100%; padding: 12px; border: 1px solid rgba(255, 103, 166, 0.3); border-radius: 12px; outline: none; color: #FF67A6; font-size: 14px; resize: vertical;"></textarea>
            </div>
            
            <div style="display: flex; gap: 12px; justify-content: flex-end;">
              <button class="profile-edit-btn" id="cancelEditPostBtn">Отмена</button>
              <button class="file-upload-btn" id="saveEditPostBtn">Сохранить</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }
}

function openEditPostModal(postId, post) {
  const editModal = document.getElementById('editPostModal');
  if (!editModal) return;
  
  document.getElementById('editPostDescription').value = post.description || '';
  
  const previewImg = document.getElementById('editPostPreviewImage');
  previewImg.src = post.imageUrl 
    ? `${post.imageUrl}` 
    : 'https://via.placeholder.com/400x400/FFE4F0/FF67A6?text=Пост';
  
  editModal.setAttribute('data-post-id', postId);
  editModal.classList.add('show');
}

function setupEditPostModal(postId, post) {
  const editModal = document.getElementById('editPostModal');
  if (!editModal) return;
  
  const closeBtn = document.getElementById('editPostModalClose');
  const cancelBtn = document.getElementById('cancelEditPostBtn');
  const saveBtn = document.getElementById('saveEditPostBtn');
  const imageInput = document.getElementById('editPostImageInput');
  const previewContainer = document.getElementById('editPostImagePreviewContainer');
  const previewImg = document.getElementById('editPostPreviewImage');
  const fileName = document.getElementById('editPostFileName');
  
  previewContainer.onclick = () => imageInput.click();
  
  imageInput.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      fileName.textContent = `Выбран: ${file.name}`;
      const reader = new FileReader();
      reader.onload = (event) => {
        previewImg.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };
  
  function closeEditModal() {
    editModal.classList.remove('show');
    imageInput.value = '';
    fileName.textContent = '';
  }
  
  async function savePostChanges() {
    const token = localStorage.getItem("token");
    const description = document.getElementById('editPostDescription').value;
    const imageFile = imageInput.files[0];
    
    const updateData = {};
    if (description !== (post.description || '')) {
      updateData.description = description;
    }
    if (imageFile) {
      updateData.image = imageFile;
    }
    
    if (Object.keys(updateData).length === 0) {
      closeEditModal();
      return;
    }
    
    saveBtn.disabled = true;
    saveBtn.textContent = 'Сохранение...';
    
    try {
      const result = await updatePost(token, postId, updateData);
      if (result) {
        console.log('Пост обновлен');
        closeEditModal();
        if (currentSection === 'profile') {
          await renderProfile();
        }
      } else {
        showToast('Ошибка при обновлении поста');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      showToast('Ошибка при обновлении поста');
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Сохранить';
    }
  }
  
  closeBtn.onclick = closeEditModal;
  cancelBtn.onclick = closeEditModal;
  saveBtn.onclick = savePostChanges;
  editModal.querySelector('.modal-overlay').onclick = closeEditModal;
}

// ===== Страница создания поста =====
function renderCreatePostPage() {
  if (!document.getElementById('createPostModal')) {
    const createPostModalHTML = `
      <div class="modal" id="createPostModal">
        <div class="modal-overlay"></div>
        <div class="modal-content" style="max-width: 500px;">
          <img src="/icons/cross.svg" class="modal-close-icon" alt="Закрыть" id="createPostModalClose">
          <div style="width: 100%;">
            <h2 style="color: #FF67A6; margin-bottom: 24px; text-align: center;">Создать новый пост</h2>
            
            <div style="margin-bottom: 20px; text-align: center;">
              <div
                  id="imagePreviewContainer"
                  class="image-drop-zone post-drop-zone"
                >
                  <div id="uploadPlaceholder">
                    <img src="/icons/camera-fill.svg" alt="Фото">
                    <div class="drop-zone-title">Перетащите фото сюда</div>
                    <div class="drop-zone-subtitle">или нажмите, чтобы выбрать файл</div>
                  </div>

                  <img id="previewImage" class="post-preview-image" alt="Предпросмотр">
                </div>

                <input type="file" id="postImageInput" accept="image/*" style="display: none;">
            </div>
            
            <div style="margin-bottom: 20px;">
              <label style="color: #FF67A6; font-size: 14px; margin-bottom: 8px; display: block;">Описание</label>
              <textarea id="postDescription" rows="4" placeholder="Напишите описание..." style="width: 100%; padding: 12px; border: 1px solid rgba(255, 103, 166, 0.3); border-radius: 12px; outline: none; color: #FF67A6; font-size: 14px; resize: vertical;"></textarea>
            </div>
            
            <div style="display: flex; gap: 12px; justify-content: flex-end;">
              <button class="profile-edit-btn" id="cancelCreatePostBtn">Отмена</button>
              <button class="file-upload-btn" id="savePostBtn">Опубликовать</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', createPostModalHTML);
  }
setupPostImageDropZone();

  const modal = document.getElementById('createPostModal');
  modal.classList.add('show');

  setTimeout(() => {
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    const postImageInput = document.getElementById('postImageInput');
    const previewImage = document.getElementById('previewImage');
    const uploadPlaceholder = document.getElementById('uploadPlaceholder');

    if (imagePreviewContainer) {
      imagePreviewContainer.onclick = () => {
        if (postImageInput) postImageInput.click();
      };
    }

    if (postImageInput) {
      postImageInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            previewImage.src = event.target.result;
            previewImage.style.display = 'block';
            uploadPlaceholder.style.display = 'none';
          };
          reader.readAsDataURL(file);
        }
      };
    }

    const closeBtn = document.getElementById('createPostModalClose');
    const cancelBtn = document.getElementById('cancelCreatePostBtn');
    const saveBtn = document.getElementById('savePostBtn');
    const postDescription = document.getElementById('postDescription');
    const modalOverlay = modal.querySelector('.modal-overlay');

    function closeModal() {
      modal.classList.remove('show');
      if (postImageInput) postImageInput.value = '';
      if (postDescription) postDescription.value = '';
      if (previewImage) previewImage.style.display = 'none';
      if (uploadPlaceholder) uploadPlaceholder.style.display = 'block';
      switchToSection('profile');
    }

    async function createNewPost() {
      const token = localStorage.getItem("token");
      const imageFile = postImageInput ? postImageInput.files[0] : null;
      
      if (!imageFile) {
        showToast('Пожалуйста, выберите изображение');
        return;
      }

      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Публикация...';
      }

      const data = {
        image: imageFile
      };
      
      const description = postDescription ? postDescription.value.trim() : '';
      if (description) {
        data.description = description;
      }

      try {
        console.log('Отправка поста...');
        const result = await createPost(token, data);
        console.log('Результат createPost:', result);
        
        if (result) {
          showToast('Пост успешно создан!');
          closeModal();
        } else {
          showToast('Ошибка при создании поста. Проверьте консоль.');
        }
      } catch (error) {
        console.error('Ошибка при создании поста:', error);
        showToast('Ошибка: ' + error.message);
      } finally {
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.textContent = 'Опубликовать';
        }
      }
    }

    if (closeBtn) closeBtn.onclick = closeModal;
    if (cancelBtn) cancelBtn.onclick = closeModal;
    if (saveBtn) saveBtn.onclick = createNewPost;
    if (modalOverlay) modalOverlay.onclick = closeModal;
  }, 100);
}

// ===== Функция отображения профиля =====
async function renderProfile() {
  contentArea.innerHTML = `<div class="section-placeholder">🎀 Загрузка профиля...</div>`;
  
  const token = localStorage.getItem("token");
  const data = await getMyProfile(token);
  if (!data) {
    contentArea.innerHTML = `<div class="section-placeholder">😢 Не удалось загрузить профиль</div>`;
    return;
  }
  
  profileData = data;
  
  if (profileAvatar && data.avatarUrl) {
    profileAvatar.src = `${data.avatarUrl}`;
  }

  const userData = {
    name: data.username || "Пользователь",
    avatar: data.avatarUrl ? `${data.avatarUrl}` : "/icons/blank_pfp.jpg",
    description: data.bio || "Описание отсутствует",
    posts: data.postsCount || 0,
    followers: data.followersCount || 0,
    following: data.followingCount || 0,
    city: data.city || "",
    contactMethod: data.contactMethod || ""
  };

const editModalHTML = `
  <div class="modal" id="editProfileModal">
    <div class="modal-overlay"></div>

    <div class="modal-content edit-profile-modal-content">
      <img
        src="/icons/cross.svg"
        class="modal-close-icon"
        alt="Закрыть"
        id="editModalClose"
      >

      <div class="edit-profile-modal-body">

        <h2 class="edit-profile-title">
          Редактировать профиль
        </h2>

        <div class="edit-profile-avatar-section">
          <label class="edit-profile-label">
            Фото профиля
          </label>

          ${
            userData.avatar
              ? `
                <img
                  src="${userData.avatar}"
                  alt="Аватар"
                  class="avatar-preview"
                  id="avatarPreview"
                >
              `
              : `
                <div class="avatar-preview avatar-preview-empty" id="avatarPreview">
                  <img
                    src="/icons/user-placeholder.svg"
                    alt="Пользователь"
                    class="avatar-placeholder-icon"
                  >
                </div>
              `
          }

          <label for="editAvatar" class="file-upload-btn">
            Выбрать фото
          </label>

          <input
            type="file"
            id="editAvatar"
            accept="image/*"
            class="hidden-file-input"
          >

          <div id="fileName" class="edit-profile-file-name"></div>
        </div>

        <div class="edit-profile-field">
          <label>Имя пользователя</label>

          <input
            id="editUsername"
            type="text"
            value="${userData.name}"
            class="edit-profile-input"
          >
        </div>

<div class="edit-profile-field">
  <label>Город</label>
  <input
    id="editProfileCity"
    type="text"
    class="edit-profile-input"
    placeholder="Например: Минск"
  >
</div>

<div class="edit-profile-field">
  <label>Способ связи</label>
  <input
    id="editProfileContactMethod"
    type="text"
    class="edit-profile-input"
    placeholder="@telegram или Discord"
  >
</div>

        <div class="edit-profile-field">
          <label>Описание</label>

          <textarea
            id="editDescription"
            rows="4"
            class="edit-profile-textarea"
          >${userData.description}</textarea>
        </div>

        <div class="edit-profile-actions">
          <button class="profile-edit-btn" id="cancelEditBtn">
            Отмена
          </button>

          <button class="file-upload-btn" id="saveEditBtn">
            Сохранить
          </button>
        </div>

      </div>
    </div>
  </div>
`;

const oldEditModal = document.getElementById("editProfileModal");
if (oldEditModal) oldEditModal.remove();

document.body.insertAdjacentHTML("beforeend", editModalHTML);

  const profileHTML = `
    <div class="profile">
      <div class="profile-header">
        <div class="profile-avatar-wrapper">
          <img src="${userData.avatar}" alt="Аватар" class="profile-avatar">
        </div>
        <div class="profile-info">
          <div class="profile-info-header">
            <h1>${userData.name}</h1>
            <button class="profile-edit-btn" id="openEditProfileBtn">Редактировать профиль</button>
          </div>
          <div class="profile-stats">
            <div class="stat-item"><span class="stat-value">${userData.posts}</span> <span class="stat-label">публикаций</span></div>
            <div class="stat-item clickable-stat" onclick="openMyFollowersModal()">
  <span class="stat-value">${userData.followers}</span>
  <span class="stat-label">подписчиков</span>
</div>
<div class="stat-item clickable-stat" onclick="openMyFollowingModal()">
  <span class="stat-value">${userData.following}</span>
  <span class="stat-label">подписок</span>
</div>          </div>
          <div class="profile-description">${userData.description}</div>
        </div>
      </div>

      <div class="profile-tabs">
        <div class="profile-tab ${currentProfileTab === 'posts' ? 'active' : ''}" data-tab="posts">
          <img src="/icons/grid.svg" alt="Сетка"> 
        </div>
        <div class="profile-tab ${currentProfileTab === 'shop' ? 'active' : ''}" data-tab="shop">
          <img src="/icons/shop.svg" alt="Магазин"> 
        </div>
        <div class="profile-tab ${currentProfileTab === 'favorites' ? 'active' : ''}" data-tab="favorites">
          <img src="/icons/bookmark.svg" alt="Избранное"> 
        </div>
      </div>

      <div class="profile-grid" id="profileGrid"></div>
    </div>
  `;

  contentArea.innerHTML = profileHTML;

  const profileGrid = document.getElementById('profileGrid');
  
  if (currentProfileTab === 'posts') {
    const posts = await getMyPosts(token);
    console.log('Полученные посты:', posts);
    
    if (posts && posts.length > 0) {
     profileGrid.innerHTML = posts.map(post => `
  <div class="profile-grid-item ${post.isHidden ? "hidden-post-card" : ""}">
    
    <img
      src="${post.imageUrl
        ? `${post.imageUrl}`
        : 'https://via.placeholder.com/300x300/FFE4F0/FF67A6?text=Пост'}"
      alt="Пост"
    >

    ${
      post.isHidden
        ? `
          <div class="hidden-post-overlay">

            <div class="hidden-post-message">
              <strong>Пост скрыт модератором</strong>

              <span>
                ${post.hiddenReason || "Причина не указана"}
              </span>
            </div>

            <button
              class="hidden-post-delete-btn"
              onclick="event.stopPropagation(); deletePostFromCard('${post.id}')"
            >
              <img src="/icons/trash.svg" alt="Удалить">
            </button>

          </div>
        `
        : `
          <div class="profile-grid-item-overlay" onclick="openPostModal('${post.id}')">

            <div class="post-card-likes" onclick="toggleLike(event, '${post.id}')">
              <img
                src="${post.isLiked ? '/icons/heart-filled.svg' : '/icons/heart.svg'}"
                alt="Лайк"
              >

              <span>${post.likesCount ?? 0}</span>
            </div>

            <div class="post-card-menu" style="position: relative;">

              <span
                onclick="event.stopPropagation(); togglePostCardMenu(event, '${post.id}')"
                style="cursor: pointer; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;"
                title="Меню"
              >
                <img
                  src="/icons/ellipsis.svg"
                  alt="Меню"
                  style="width: 27px; height: 27px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));"
                >
              </span>

              <div
                class="post-card-dropdown"
                id="postCardDropdown-${post.id}"
                style="display: none; position: absolute; bottom: 100%; right: 0; background: white; border-radius: 12px; box-shadow: 0 8px 24px rgba(255, 103, 166, 0.2); min-width: 150px; z-index: 100; overflow: hidden; margin-bottom: 8px;"
              >

                <button
                  onclick="event.stopPropagation(); openEditPostModalFromCard('${post.id}')"
                  style="display: flex; align-items: center; gap: 8px; padding: 10px 16px; border: none; background: none; width: 100%; cursor: pointer; color: #FF67A6; font-size: 13px; font-weight: 600; border-bottom: 1px solid rgba(255, 103, 166, 0.1);"
                >
                  <img src="/icons/pencil.svg" alt="Редактировать" style="width: 16px; height: 16px;">
                  Редактировать
                </button>

                <button
                  onclick="event.stopPropagation(); deletePostFromCard('${post.id}')"
                  style="display: flex; align-items: center; gap: 8px; padding: 10px 16px; border: none; background: none; width: 100%; cursor: pointer; color: #FF4444; font-size: 13px; font-weight: 600;"
                >
                  <img src="/icons/trash.svg" alt="Удалить" style="width: 16px; height: 16px;">
                  Удалить
                </button>

              </div>

            </div>

          </div>
        `
    }

  </div>
`).join('');
    } else {
      profileGrid.innerHTML = `<div class="section-placeholder" style="grid-column:1/-1;">Нет публикаций</div>`;
    }
} else if (currentProfileTab === 'shop') {
  const ads = await getMyProductAds(token);
  const myId = localStorage.getItem("userId");
  const reviews = await getUserReviews(myId);
  const averageRating = getAverageRating(reviews);
  profileGrid.outerHTML = `
    <div class="profile-shop-layout">

      <div class="profile-shop-left">
        <div class="profile-rating-summary">
<span class="profile-rating-number">${averageRating}</span>

<div class="profile-rating-stars">
  ${renderStars(Math.round(Number(averageRating)))}
</div>

<span class="profile-rating-count">${reviews.length} оценок</span>
        </div>
${
  userData.city || userData.contactMethod
    ? `
      <div class="profile-shop-info">
        ${
          userData.city
            ? `
              <div class="profile-shop-info-item">
                <img src="/icons/location.svg" alt="">
                <span>${userData.city}</span>
              </div>
            `
            : ""
        }

        ${
          userData.contactMethod
            ? `
              <div class="profile-shop-info-item">
                <img src="/icons/chat.svg" alt="">
                <span>${userData.contactMethod}</span>
              </div>
            `
            : ""
        }
      </div>
    `
    : ""
}
        <div class="profile-shop-grid">
          ${
            ads && ads.length > 0
              ? ads.map(ad => {
                  const imageUrl = ad.images && ad.images.length > 0
                    ? `${ad.images[0]}`
                    : "/icons/blank_pfp.jpg";

                  return `
<div class="profile-shop-card ${ad.isHidden ? "hidden-product-card" : ""}" onclick="${ad.isHidden ? "" : `openProductAdModal('${ad.id}')`}">

  <div class="shop-card-image-wrapper">
    <img src="${imageUrl}" alt="${ad.title}">
    <div class="shop-card-overlay"></div>

    ${
      ad.isHidden
        ? `
          <div class="hidden-product-overlay">
            <div class="hidden-product-message">
              <strong>Объявление скрыто модератором</strong>
              <span>${ad.hiddenReason || "Причина не указана"}</span>
            </div>

            <button
              class="hidden-product-delete-btn"
              onclick="event.stopPropagation(); deleteProductAdFromProfile('${ad.id}')"
            >
              <img src="/icons/trash.svg" alt="Удалить">
            </button>
          </div>
        `
        : `
          <div class="product-card-menu"
               onclick="event.stopPropagation(); toggleProductCardMenu(event, '${ad.id}')">
            <img src="/icons/ellipsis.svg" alt="Меню">
          </div>
        `
    }
  </div>

  ${
    ad.isHidden
      ? ""
      : `
        <div class="product-card-dropdown" id="productCardDropdown-${ad.id}">
          <button onclick="event.stopPropagation(); openEditProductAdModal('${ad.id}')">
            <img src="/icons/pencil.svg" alt="">
            Редактировать
          </button>

          <button class="danger" onclick="event.stopPropagation(); deleteProductAdFromProfile('${ad.id}')">
            <img src="/icons/trash.svg" alt="">
            Удалить
          </button>
        </div>
      `
  }

  <div class="profile-shop-price">${ad.price}р</div>
  <div class="profile-shop-title">${ad.title}</div>
</div>
                  `;
                }).join("")
              : `<div class="section-placeholder" style="grid-column:1/-1;">
                   У вас пока нет объявлений
                 </div>`
          }
        </div>
      </div>

<div class="profile-reviews-panel">
  <h2>Отзывы</h2>

  ${
    reviews && reviews.length > 0
      ? reviews.map(review => `
          <div class="profile-review-item">
<div 
  class="profile-review-name review-user-link"
  onclick="openUserProfile('${review.reviewerId}')"
>
  ${review.reviewerUsername}
</div>
            <div class="profile-review-stars">
              ${renderStars(review.rating)}
            </div>

            <div class="profile-review-text">
              ${review.description || ""}
            </div>
          </div>
        `).join("")
      : `<div class="profile-empty-reviews">Отзывов пока нет</div>`
  }
</div>

    </div>
  `;
} else {
  const favorites = await getMyFavoritePosts(token);

  if (favorites && favorites.length > 0) {
    profileGrid.innerHTML = favorites.map(post => `
      <div class="profile-grid-item">
        <img src="${post.imageUrl ? `${post.imageUrl}` : 'https://via.placeholder.com/300x300/FFE4F0/FF67A6?text=Пост'}" alt="Пост">

        <div class="profile-grid-item-overlay" onclick="openPostModal('${post.id}')">
          <div class="post-card-likes" onclick="toggleLike(event, '${post.id}')">
            <img src="${post.isLiked ? '/icons/heart-filled.svg' : '/icons/heart.svg'}" alt="Лайк">
            <span>${post.likesCount ?? 0}</span>
          </div>
        </div>
      </div>
    `).join('');
  } else {
    profileGrid.innerHTML = `
      <div class="section-placeholder" style="grid-column:1/-1;">
         В избранном пока нет публикаций
      </div>
    `;
  }
}

  setTimeout(() => {
    setupEditProfileModal();
  }, 0);

  setTimeout(() => {
    document.querySelectorAll('.profile-tab').forEach(tab => {
      const newTab = tab.cloneNode(true);
      tab.parentNode.replaceChild(newTab, tab);
      
      newTab.addEventListener('click', () => {
        const tabName = newTab.getAttribute('data-tab');
        currentProfileTab = tabName;
        updateURLForSection("profile");
        renderProfile();
      });
    });
  }, 0);
}

window.toggleLike = async function(event, postId) {
  event.stopPropagation();

  const btn = event.currentTarget;
  const img = btn.querySelector('img');
  const countEl = btn.querySelector('span');

  const token = localStorage.getItem("token");
  const result = await togglePostLike(token, postId);

  if (!result) return;

  img.src = result.liked
    ? '/icons/heart-filled.svg'
    : '/icons/heart.svg';

  countEl.textContent = result.likesCount;
};

// ===== Настройка модального окна редактирования профиля =====
function setupEditProfileModal() {
  const editModal = document.getElementById('editProfileModal');
  if (!editModal) return;

  const editModalClose = document.getElementById('editModalClose');
  const cancelEditBtn = document.getElementById('cancelEditBtn');
  const saveEditBtn = document.getElementById('saveEditBtn');
  const editDescription = document.getElementById('editDescription');
  const editUsername = document.getElementById('editUsername');
  const editAvatar = document.getElementById('editAvatar');
  const avatarPreview = document.getElementById('avatarPreview');
  const fileName = document.getElementById('fileName');
  const openEditBtn = document.getElementById('openEditProfileBtn');
const editCity = document.getElementById("editProfileCity");
const editContactMethod = document.getElementById("editProfileContactMethod");

  if (editAvatar) {
    editAvatar.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        if (fileName) {
          fileName.textContent = `Выбран: ${file.name}`;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
          if (avatarPreview) {
            avatarPreview.src = event.target.result;
            avatarPreview.style.display = 'block';
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }

  function openEditModal() {
    editModal.classList.add('show');
    editDescription.value = profileData?.bio || '';
    editUsername.value = profileData?.username || '';
    editCity.value = profileData?.city || "";
    editContactMethod.value = profileData?.contactMethod || "";
  }

  function closeEditModal() {
    editModal.classList.remove('show');
  }

  async function saveProfileChanges() {
    const token = localStorage.getItem("token");
    const bio = editDescription.value;
    const username = editUsername.value.trim();
    const avatarFile = editAvatar.files[0];
    
    const updateData = {
  bio: bio,
  username: username,
  city: editCity.value.trim(),
  contactMethod: editContactMethod.value.trim()
};
    if (avatarFile) updateData.avatar = avatarFile;
    
    const result = await updateProfile(token, updateData);
    
    if (result) {
      localStorage.setItem("username", result.username);
      console.log('Профиль обновлен:', result);
      closeEditModal();
      await renderProfile();
    } else {
      showToast('Ошибка при сохранении профиля');
    }
  }

  editModalClose.onclick = closeEditModal;
  cancelEditBtn.onclick = closeEditModal;
  saveEditBtn.onclick = saveProfileChanges;
  editModal.querySelector('.modal-overlay').onclick = closeEditModal;

  if (openEditBtn) {
    openEditBtn.onclick = openEditModal;
  }
}

// ===== Делаем функции глобальными =====
window.openPostModal = openPostModal;

// ===== Переключение разделов =====
function switchToSection(sectionId, updateURL = true) {
  console.log("switchToSection вызвана:", sectionId, "updateURL:", updateURL);
  if (currentSection !== "profile" && currentSection !== "add") {
    previousSection = currentSection;
  }

  currentSection = sectionId;

  if (!updateURL) {
    const urlState = parseURLState();
    if (urlState.tab) currentProfileTab = urlState.tab;
    if (urlState.category) shopFilters.categoryId = urlState.category;
    if (urlState.priceFrom) shopFilters.priceFrom = urlState.priceFrom;
    if (urlState.priceTo) shopFilters.priceTo = urlState.priceTo;
    if (urlState.search) shopFilters.search = urlState.search;
  }

  menuItems.forEach(item => {
    const sec = item.getAttribute("data-section");
    if (sec === sectionId) item.classList.add("active");
    else item.classList.remove("active");
  });

  const filtersBlock = document.querySelector(".filters");
  const searchWrapper = document.querySelector(".search-wrapper");
  const topbarLeft = document.querySelector(".topbar-left");
  const topbarCartIcon = document.getElementById("topbarCartIcon");
  const shopCategoriesRoof = document.getElementById("shopCategoriesRoof");

  if (shopCategoriesRoof) shopCategoriesRoof.style.display = "none";
  if (topbarLeft) topbarLeft.innerHTML = "";

  if (searchWrapper) {
    searchWrapper.style.display = "none";
    searchWrapper.classList.remove("shop-topbar-search");
    if (searchInput) searchInput.oninput = null;
  }

  if (searchInput) {
    searchInput.value = "";
    searchInput.placeholder = "Поиск в куклопедии";
  }

  if (userSearchWrapper) userSearchWrapper.style.display = "none";
  if (filtersBlock) filtersBlock.style.display = "none";
  if (topbarCartIcon) topbarCartIcon.style.display = "none";
  if (shopCategoriesRoof) shopCategoriesRoof.style.display = "none";

  // Обновляем URL всегда, когда происходит прямое переключение
  if (updateURL) {
    console.log("Обновляем URL для секции:", sectionId); // Для отладки
    updateURLForSection(sectionId);
  }

  if (sectionId === "home") {
    if (profileAvatar) {
      profileAvatar.style.display = "block";
      loadUserAvatar();
    }
    renderHomeFeed();

  } else if (sectionId === "cyclopedia") {
    if (profileAvatar) {
      profileAvatar.style.display = "block";
      loadUserAvatar();
    }

    if (searchWrapper) searchWrapper.style.display = "block";
    if (filtersBlock) filtersBlock.style.display = "flex";

    if (!document.getElementById("dollsGrid")) {
      contentArea.innerHTML = `<div class="dolls-grid" id="dollsGrid"></div>`;
    }

    const urlState = parseURLState();
    if (urlState.dollSearch && searchInput) {
      searchInput.value = urlState.dollSearch;
    }

    loadDolls({
      search: searchInput?.value.trim() || "",
      brand: brandFilter?.value || "",
      releaseYear: yearFilter?.value || ""
    });

} else if (sectionId === "profile") {
  if (profileAvatar) profileAvatar.style.display = "none";
  menuItems.forEach(item => item.classList.remove("active"));

  renderProfile();

  } else if (sectionId === "interesting") {
    if (profileAvatar) {
      profileAvatar.style.display = "block";
      loadUserAvatar();
    }

    if (userSearchWrapper) userSearchWrapper.style.display = "block";
    
    const urlState = parseURLState();
    if (urlState.userSearch && userSearchInput) {
      userSearchInput.value = urlState.userSearch;
      renderUserSearchResults(urlState.userSearch);
    } else {
      if (userSearchInput) userSearchInput.value = "";
      renderInterestingPosts();
    }

  } else if (sectionId === "cart") {
    if (profileAvatar) {
      profileAvatar.style.display = "block";
      loadUserAvatar();
    }

    if (searchWrapper) {
      searchWrapper.style.display = "block";
      searchWrapper.classList.add("shop-topbar-search");
    }

    if (searchInput) {
      const urlState = parseURLState();
      searchInput.value = shopFilters.search || urlState.search || "";
      searchInput.placeholder = "Поиск товаров";
      searchInput.oninput = async () => {
        const query = searchInput.value.trim();

        shopFilters.search = query;

        updateURLForSection("cart");
        await renderShopPage();
      };
    }

    if (topbarCartIcon) topbarCartIcon.style.display = "block";
    if (shopCategoriesRoof) shopCategoriesRoof.style.display = "flex";

    renderShopPage();
    loadShopCategoriesDropdown();

  } else if (sectionId === "notifications") {
    if (profileAvatar) {
      profileAvatar.style.display = "block";
      loadUserAvatar();
    }
    renderNotificationsPage();
  } else {
    if (profileAvatar) {
      profileAvatar.style.display = "block";
      loadUserAvatar();
    }
    contentArea.innerHTML = `
      <div class="section-placeholder">
        Раздел в разработке<br>
      </div>
    `;
  }
}

// ===== Обработчики событий =====
searchInput?.addEventListener("input", async () => {
  const query = searchInput.value.trim();

  if (currentSection === "cyclopedia") {
    loadDolls({
      search: query,
      brand: brandFilter?.value || "",
      releaseYear: yearFilter?.value || ""
    });
  }
});

userSearchInput?.addEventListener("input", async () => {
  const query = userSearchInput.value.trim();

  if (currentSection === "interesting") {
    await renderUserSearchResults(query);

    if (!query) {
  renderInterestingPosts();
  return;
}
  }
});

clearIcon?.addEventListener("click", async () => {
  searchInput.value = "";

  if (currentSection === "cyclopedia") {
    loadDolls();
    return;
  }

  if (currentSection === "cart") {
    shopFilters.search = "";
    updateURLForSection("cart");
    await renderShopPage();
    return;
  }
});

clearIcon?.addEventListener("click", () => {
  searchInput.value = "";
  if (currentSection === "cyclopedia") loadDolls();
});

searchIcon?.addEventListener("click", () => {
  if (currentSection === "cyclopedia") {
    loadDolls({
      search: searchInput.value.trim(),
      brand: brandFilter?.value || "",
      releaseYear: yearFilter?.value || ""
    });
  }
});

brandFilter?.addEventListener("change", () => {
  if (currentSection === "cyclopedia") {
    loadDolls({
      search: searchInput?.value.trim() || "",
      brand: brandFilter.value,
      releaseYear: yearFilter?.value || ""
    });
  }
});

yearFilter?.addEventListener("change", () => {
  if (currentSection === "cyclopedia") {
    loadDolls({
      search: searchInput?.value.trim() || "",
      brand: brandFilter?.value || "",
      releaseYear: yearFilter.value
    });
  }
});

menuItems.forEach(item => {
  item.addEventListener("click", () => {
    const section = item.getAttribute("data-section");

    if (section === "add") {
      renderCreateChoiceModal();
      return;
    }

    if (section) {
      switchToSection(section);
    }
  });
});

settingsBtn?.addEventListener("click", async () => {
  switchToSection("settings");

  contentArea.innerHTML = `
    <div class="settings-page">
      <h2>Настройки</h2>

      <div class="settings-card">
        <div>
          <h3>Тема приложения</h3>
          <p>Светлая или тёмная тема</p>
        </div>

        <button class="theme-toggle-btn" onclick="toggleTheme()">
          Сменить тему
        </button>
      </div>

<div class="settings-card privacy-settings-card">
  <div>
    <h3>Приватность</h3>
  </div>
<div class="privacy-settings-row">
  <span class="privacy-settings-label">
    Кто может видеть мой профиль
  </span>

  <select class="privacy-select" id="profile-privacy-select">
    <option value="public">Все пользователи</option>
    <option value="followers">Только подписчики</option>
  </select>
</div>

  <button class="blacklist-open-btn" onclick="openBlacklistModal()">
    Черный список
  </button>
</div>
      <div class="settings-card notification-settings-card">
  <div class="settings-card-header">
    <h3>Уведомления</h3>
    <p>Какие уведомления вы хотите получать</p>
  </div>

  <div class="notification-setting-item">
    <span>Лайки</span>

    <label class="switch">
      <input type="checkbox" id="notifyLikes">
      <span class="slider"></span>
    </label>
  </div>

  <div class="notification-setting-item">
    <span>Подписчики</span>

    <label class="switch">
      <input type="checkbox" id="notifyFollowers">
      <span class="slider"></span>
    </label>
  </div>

  <div class="notification-setting-item">
    <span>Комментарии</span>

    <label class="switch">
      <input type="checkbox" id="notifyComments">
      <span class="slider"></span>
    </label>
  </div>

  <div class="notification-setting-item">
    <span>Отзывы</span>

    <label class="switch">
      <input type="checkbox" id="notifyReviews">
      <span class="slider"></span>
    </label>
  </div>

  <div class="notification-setting-item">
    <span>Лайки комментариев</span>

    <label class="switch">
      <input type="checkbox" id="notifyCommentLikes">
      <span class="slider"></span>
    </label>
  </div>

  <div class="notification-setting-item">
    <span>Ответы на комментарии</span>

    <label class="switch">
      <input type="checkbox" id="notifyCommentReplies">
      <span class="slider"></span>
    </label>
  </div>

</div>
<div class="settings-card notification-settings-card">
  <div class="settings-card-header">
    <h3>Магазин</h3>
    <p>Настройки отображения магазина и отзывов</p>
  </div>

  <div class="notification-setting-item">
    <span>Показывать магазин в профиле</span>

    <label class="switch">
      <input type="checkbox" id="showStoreInProfile">
      <span class="slider"></span>
    </label>
  </div>

  <div class="notification-setting-item">
    <span>Разрешить отзывы</span>

    <label class="switch">
      <input type="checkbox" id="allowReviews">
      <span class="slider"></span>
    </label>
  </div>

  <div class="notification-setting-item">
    <span>Показывать рейтинг в профиле</span>

    <label class="switch">
      <input type="checkbox" id="showRatingInProfile">
      <span class="slider"></span>
    </label>
  </div>
</div>
<div class="settings-card account-settings-card">
  <div class="settings-card-header">
    <h3>Аккаунт</h3>
    <p>Управление входом и аккаунтом</p>
  </div>

  <div class="account-settings-actions">
    <button class="account-settings-btn" onclick="openChangePasswordModal()">
      Изменить пароль
    </button>

    <button class="account-settings-btn" onclick="logoutAccount()">
      Выйти из аккаунта
    </button>

    <button class="account-settings-btn danger" onclick="deleteMyAccount()">
      Удалить аккаунт
    </button>
  </div>
</div>

<div class="settings-card account-settings-card">
  <div class="settings-card-header">
    <h3>Мои жалобы</h3>
    <p>История отправленных жалоб</p>
  </div>

  <button class="account-settings-btn" onclick="openMyReportsModal()">
    Посмотреть жалобы
  </button>
</div>

<div class="settings-card account-settings-card">
  <div class="settings-card-header">
    <h3>Заявки и предложения</h3>
    <p>Отправка идей, предложений и обращений</p>
  </div>

  <button class="account-settings-btn" onclick="openUserRequestsModal()">
    Оставить заявку
  </button>

  <button class="account-settings-btn" onclick="openMyUserRequestsModal()">
    Мои заявки
  </button>

</div>

    </div>
  `;

  await loadProfilePrivacy();

  const privacySelect = document.getElementById("profile-privacy-select");

  privacySelect.onchange = async () => {
    await updateProfilePrivacy(privacySelect.value);
  };

  const notificationSettings = await getNotificationSettings();

if (notificationSettings) {
  document.getElementById("notifyLikes").checked =
    notificationSettings.notifyLikes;

  document.getElementById("notifyFollowers").checked =
    notificationSettings.notifyFollowers;

  document.getElementById("notifyComments").checked =
    notificationSettings.notifyComments;

  document.getElementById("notifyReviews").checked =
    notificationSettings.notifyReviews;

  document.getElementById("notifyCommentLikes").checked =
    notificationSettings.notifyCommentLikes;

  document.getElementById("notifyCommentReplies").checked =
    notificationSettings.notifyCommentReplies;
}

async function saveNotificationSettings() {
  await updateNotificationSettings({
    notifyLikes:
      document.getElementById("notifyLikes").checked,

    notifyFollowers:
      document.getElementById("notifyFollowers").checked,

    notifyComments:
      document.getElementById("notifyComments").checked,

    notifyReviews:
      document.getElementById("notifyReviews").checked,

    notifyCommentLikes:
      document.getElementById("notifyCommentLikes").checked,

    notifyCommentReplies:
      document.getElementById("notifyCommentReplies").checked
  });
}

[
  "notifyLikes",
  "notifyFollowers",
  "notifyComments",
  "notifyReviews"
].forEach(id => {
  document.getElementById(id)
    ?.addEventListener("change", saveNotificationSettings);
});
const storeSettings = await getStoreSettings();

if (storeSettings) {
  document.getElementById("showStoreInProfile").checked =
    storeSettings.showStoreInProfile;

  document.getElementById("allowReviews").checked =
    storeSettings.allowReviews;

  document.getElementById("showRatingInProfile").checked =
    storeSettings.showRatingInProfile;
}

async function saveStoreSettings() {
  await updateStoreSettings({
    showStoreInProfile:
      document.getElementById("showStoreInProfile").checked,

    allowReviews:
      document.getElementById("allowReviews").checked,

    showRatingInProfile:
      document.getElementById("showRatingInProfile").checked
  });
}

[
  "showStoreInProfile",
  "allowReviews",
  "showRatingInProfile"
].forEach(id => {
  document.getElementById(id)
    ?.addEventListener("change", saveStoreSettings);
});
});



profileAvatar?.addEventListener("click", () => {
  switchToSection("profile");
});

document.getElementById("closeModal")?.addEventListener("click", closeModal);
document.querySelector("#dollModal .modal-overlay")?.addEventListener("click", closeModal);

async function renderUserSearchResults(query) {
  if (!query) {
    renderInterestingPosts();
    return;
  }

  const users = (await searchUsers(query))
  .filter(user =>
    user.username?.toLowerCase() !== "admin"
  );
  const posts = await getInterestingPosts(localStorage.getItem("token"));

  const filteredPosts = (posts || []).filter(post =>
    (post.description || "")
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  contentArea.innerHTML = `
    <div class="interesting-search-results">

      ${
        users && users.length > 0
          ? `
            <div class="users-search-list">
              ${users.map(user => `
                <div class="user-search-card" onclick="openUserProfile('${user.id}')">
                  <img src="${user.avatarUrl ? `${user.avatarUrl}` : '/icons/blank_pfp.jpg'}" alt="Аватар">
                  <div>
                    <h3>${user.username}</h3>
                    <p>${user.bio || 'Описание отсутствует'}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          `
          : ""
      }

      ${
        filteredPosts.length > 0
          ? `
<div class="interesting-search-posts-grid">              ${filteredPosts.map(post => `
                <div class="interesting-search-post-card" onclick="openPostModal('${post.id}')">
                  <img 
                    src="${post.imageUrl ? `${post.imageUrl}` : '/icons/blank_pfp.jpg'}" 
                    alt="Пост"
                  >

                  <div class="interesting-search-post-overlay">
                    <div class="interesting-search-post-actions">
                      <span onclick="toggleInterestingLike(event, '${post.id}')">
                        <img src="${post.isLiked ? '/icons/heart-filled.svg' : '/icons/heart.svg'}" alt="Лайк">
                        <span class="interesting-like-count">${post.likesCount ?? 0}</span>
                      </span>

                      <span onclick="toggleInterestingFavorite(event, '${post.id}')">
                        <img src="${post.isFavorite ? '/icons/bookmark-filled.svg' : '/icons/bookmark.svg'}" alt="Избранное">
                      </span>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          `
          : ""
      }

      ${
        (!users || users.length === 0) && filteredPosts.length === 0
          ? `<div class="section-placeholder">Ничего не найдено</div>`
          : ""
      }

    </div>
  `;
}

window.openUserProfile = async function(userId) {
  closePostModal();

  const myId = localStorage.getItem("userId");

  if (myId && String(userId) === String(myId)) {
    switchToSection("profile");
    return;
  }

  // Обновляем URL с параметром пользователя
  updateURLForSection("user-profile", { userId: userId });

  if (userSearchWrapper) userSearchWrapper.style.display = "none";

  const user = await getUserProfile(userId);

  if (user.isBlocked) {
    contentArea.innerHTML = `
      <div class="profile blocked-profile">
        <div class="blocked-profile-content">
          <h1>${user.username || "Пользователь"}</h1>
          <p>${user.message || "Этот пользователь вас заблокировал"}</p>
        </div>
      </div>
    `;
    return;
  }

  if (!user) {
    contentArea.innerHTML = `
      <div class="section-placeholder">
        😢 Не удалось загрузить профиль
      </div>
    `;
    return;
  }

  openedUserPosts = user.posts || [];

  const followBtnText = user.isFollowing
    ? "Отписаться"
    : user.requestSent
      ? "Заявка отправлена"
      : user.isPrivate
        ? "Запросить подписку"
        : "Подписаться";

  // Скрываем меню и показываем кнопку "назад"
  menuItems.forEach(item => item.classList.remove("active"));
  
  contentArea.innerHTML = `
    <div class="profile">
      <div class="profile-header">
        <div class="profile-avatar-wrapper">
          <img src="${user.avatarUrl ? `${user.avatarUrl}` : '/icons/blank_pfp.jpg'}" class="profile-avatar">
        </div>

        <div class="profile-info">
          <div class="profile-info-header other-profile-header">
            <h1>${user.username}</h1>

            <div class="other-profile-menu">
              <button class="other-profile-menu-btn" onclick="event.stopPropagation(); toggleOtherProfileMenu()">
                <img src="/icons/ellipsis.svg" alt="Меню">
              </button>

              <div class="other-profile-dropdown" id="otherProfileDropdown">
                <button onclick="event.stopPropagation(); openReportUserModal('${userId}')">
                  Пожаловаться
                </button>
                <button onclick="event.stopPropagation(); blockUserFromProfile('${userId}')">
                  Заблокировать пользователя
                </button>
              </div>
            </div>
          </div>

          <div class="profile-stats">
            <div class="stat-item">
              <span class="stat-value">${user.postsCount ?? 0}</span>
              <span class="stat-label">публикаций</span>
            </div>

            <div class="stat-item clickable-stat" onclick="openFollowersModal('${userId}')">
              <span class="stat-value" id="otherFollowersCount">${user.followersCount ?? 0}</span>
              <span class="stat-label">подписчиков</span>
            </div>

            <div class="stat-item clickable-stat" onclick="openFollowingModal('${userId}')">
              <span class="stat-value">${user.followingCount ?? 0}</span>
              <span class="stat-label">подписок</span>
            </div>
          </div>

          <div class="profile-description">${user.bio || 'Описание отсутствует'}</div>

          <button class="profile-follow-btn" id="followBtn" onclick="toggleFollowFromProfile('${userId}')">
            ${followBtnText}
          </button>
        </div>
      </div>

      <div class="profile-tabs">
        <div class="profile-tab active" onclick="showOtherUserTab('posts', event)">
          <img src="/icons/grid.svg">
        </div>

        ${user.showStoreInProfile ? `
          <div class="profile-tab" onclick="showOtherUserTab('shop', event)">
            <img src="/icons/shop.svg">
          </div>
        ` : ""}
      </div>

      <div class="profile-grid" id="otherUserProfileGrid" data-user-id="${userId}">
        ${user.isPrivate ? `
          <div class="section-placeholder" style="grid-column:1/-1;">
            🔒 Профиль закрыт<br>
            Подпишитесь, чтобы видеть публикации
          </div>
        ` : (user.posts || []).map(post => `
          <div class="profile-grid-item">
            <img src="${post.imageUrl ? `${post.imageUrl}` : ''}">
            <div class="profile-grid-item-overlay" onclick="openPostModal('${post.id}')">
              <div class="post-card-likes" onclick="toggleLike(event, '${post.id}')">
                <img src="${post.isLiked ? '/icons/heart-filled.svg' : '/icons/heart.svg'}">
                <span>${post.likesCount ?? 0}</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
};

async function loadComments(postId) {
  try {
    const comments = await getComments(postId);
    const container = document.getElementById("postModalComments");
    const myId = localStorage.getItem("userId");

    if (!container) return;

    if (!comments || comments.length === 0) {
      container.innerHTML = `<div style="color:#FF98C1;">Комментариев пока нет</div>`;
      return;
    }

    container.innerHTML = comments.map(comment => `
      <div class="comment-thread">

        ${renderComment(comment, postId, myId, false)}

        ${
          comment.replies && comment.replies.length > 0
            ? `
              <div class="comment-replies">
                ${comment.replies.slice(0, 2).map(reply =>
                  renderComment(reply, postId, myId, true)
                ).join("")}
              </div>

              ${
                comment.replies.length > 2
                  ? `
                    <button class="comment-toggle-btn" onclick="toggleReplies('${comment.id}')">
                      Показать все ответы (${comment.replies.length})
                    </button>

                    <div class="comment-replies hidden" id="replies-${comment.id}">
                      ${comment.replies.slice(2).map(reply =>
                        renderComment(reply, postId, myId, true)
                      ).join("")}
                    </div>
                  `
                  : ""
              }
            `
            : ""
        }

      </div>
    `).join("");

  } catch (e) {
    console.error("Ошибка загрузки комментариев", e);
  }
}

function renderComment(comment, postId, myId, isReply) {
return `
  <div
    class="comment-item ${isReply ? "comment-reply-item" : ""}"
    onclick="replyToComment('${comment.id}', '${comment.author?.username || ""}')"
  >
    <div class="comment-main">
      <span
        class="comment-username comment-link"
        onclick="event.stopPropagation(); openUserProfile('${comment.author?.id}')"
      >
        ${comment.author?.username || "Пользователь"}
      </span>

      <span class="comment-text">${comment.text}</span>
    </div>

    <div class="comment-actions">
      <button
        class="comment-like-btn"
        id="commentLikeBtn-${comment.id}"
        onclick="likeComment(event, '${comment.id}')"
      >
        <img src="${comment.isLikedByCurrentUser ? '/icons/heart-filled.svg' : '/icons/heart.svg'}">
        <span id="commentLikesCount-${comment.id}">
          ${comment.likesCount ?? 0}
        </span>
      </button>

      ${
        String(comment.author?.id) === String(myId) ||
        String(currentOpenedPostAuthorId) === String(myId)
          ? `
            <button
              class="comment-delete-btn"
              onclick="deleteMyComment(event, '${comment.id}', '${postId}')"
            >
              <img src="/icons/trash.svg" alt="Удалить">
            </button>
          `
          : ""
      }
    </div>
  </div>
`;
}

window.replyToComment = function(commentId, username) {
  replyingToCommentId = commentId;

  const input = document.getElementById("postModalCommentInput");

  if (!input) {
    console.log("postModalCommentInput не найден");
    return;
  }

  input.value = `@${username} `;
  input.focus();
  input.setSelectionRange(input.value.length, input.value.length);
};

window.toggleReplies = function(commentId) {
  const block = document.getElementById(`replies-${commentId}`);
  if (!block) return;

  block.classList.toggle("hidden");
};


window.showOtherUserTab = async function(tab, event) {
  const oldContainer = document.getElementById("otherUserProfileGrid");
  if (!oldContainer) return;

  const userId = oldContainer.dataset.userId;

  document.querySelectorAll(".profile-tab").forEach(t => {
    t.classList.remove("active");
  });

  event.currentTarget.classList.add("active");

  if (tab === "posts") {
    const user = await getUserProfile(userId);

    oldContainer.outerHTML = `
      <div class="profile-grid" id="otherUserProfileGrid" data-user-id="${userId}">
        ${(user.posts || []).map(post => `
          <div class="profile-grid-item">
            <img src="${post.imageUrl ? `${post.imageUrl}` : 'https://via.placeholder.com/300x300/FFE4F0/FF67A6?text=Пост'}" alt="Пост">

            <div class="profile-grid-item-overlay" onclick="openPostModal('${post.id}')">
              <div class="post-card-likes" onclick="toggleLike(event, '${post.id}')">
                <img src="${post.isLiked ? '/icons/heart-filled.svg' : '/icons/heart.svg'}" alt="Лайк">
                <span>${post.likesCount ?? 0}</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  if (tab === "shop") {
const user = await getUserProfile(userId);
const ads = await getUserProductAds(userId);
const reviews = await getUserReviews(userId);
const averageRating = getAverageRating(reviews);
  const city = user.city || user.City || "";
  const contactMethod = user.contactMethod || user.ContactMethod || "";

    oldContainer.outerHTML = `
      <div class="profile-shop-layout" id="otherUserProfileGrid" data-user-id="${userId}">
        <div class="profile-shop-left">
          ${
  user.showRatingInProfile
    ? `
      <div class="profile-rating-summary">
        <span class="profile-rating-number">${averageRating}</span>

        <div class="profile-rating-stars">
          ${renderStars(Math.round(Number(averageRating)))}
        </div>

        <span class="profile-rating-count">${reviews.length} оценок</span>
      </div>
    `
    : ""
}
${
  user.city || user.contactMethod
    ? `
      <div class="profile-shop-info">

        ${
          user.city
            ? `
              <div class="profile-shop-info-item">
                <img src="/icons/location.svg" alt="">
                <span>${user.city}</span>
              </div>
            `
            : ""
        }

        ${
          user.contactMethod
            ? `
              <div class="profile-shop-info-item">
                <img src="/icons/chat.svg" alt="">
                <span>${user.contactMethod}</span>
              </div>
            `
            : ""
        }

      </div>
    `
    : ""
}

          <div class="profile-shop-grid">
            ${
              ads && ads.length > 0
                ? ads.map(ad => {
                    const imageUrl = ad.images && ad.images.length > 0
                      ? `${ad.images[0]}`
                      : "/icons/blank_pfp.jpg";

                    return `
                      <div class="profile-shop-card" onclick="openProductAdModal('${ad.id}')">
                        <img src="${imageUrl}" alt="${ad.title}">
                        <div class="profile-shop-price">${ad.price}р</div>
                        <div class="profile-shop-title">${ad.title}</div>
                      </div>
                    `;
                  }).join("")
                : `<div class="section-placeholder" style="grid-column:1/-1;"> У пользователя пока нет объявлений</div>`
            }
          </div>
        </div>

<div class="profile-reviews-panel">
  <div class="reviews-header">
    <h2>Отзывы</h2>

${
  user.allowReviews
    ? `
      <button class="add-review-btn" onclick="openCreateReviewModal('${userId}')">
        Оставить отзыв
      </button>
    `
    : ""
}
  </div>

  ${
    reviews && reviews.length > 0
      ? reviews.map(review => `
<div class="profile-review-item">

  <div class="profile-review-top">
    <div
      class="profile-review-name review-user-link"
      onclick="openUserProfile('${review.reviewerId}')"
    >
      ${review.reviewerUsername}
    </div>

    ${
      String(review.reviewerId) === String(localStorage.getItem("userId"))
        ? `
          <button
            class="delete-review-btn"
            onclick="event.stopPropagation(); removeReview('${review.id}', '${userId}')"
          >
            <img src="/icons/trash.svg" alt="Удалить">
          </button>
        `
        : ""
    }
  </div>

  <div class="profile-review-stars">
    ${renderStars(review.rating)}
  </div>

  <div class="profile-review-text">
    ${review.description || ""}
  </div>
</div>
        `).join("")
      : `<div class="profile-empty-reviews">Отзывов пока нет</div>`
  }
</div>
      </div>
    `;
  }
};

window.toggleFollowFromProfile = async function(userId) {
  const result = await toggleFollow(userId);

  if (!result) return;

  const btn = document.getElementById("followBtn");

  if (btn) {
    if (result.isFollowing) {
      btn.textContent = "Отписаться";
    } else if (result.requestSent) {
      btn.textContent = "Заявка отправлена";
    } else {
      btn.textContent = "Подписаться";
    }
  }

  const followersEl = document.getElementById("otherFollowersCount");
  if (followersEl) {
    followersEl.textContent = result.followersCount;
  }
};

window.openFollowersModal = async function(userId) {
  const followers = await getFollowers(userId);

  let modal = document.getElementById("followersModal");

  if (!modal) {
    document.body.insertAdjacentHTML("beforeend", `
      <div class="modal hidden" id="followersModal">
        <div class="modal-overlay" onclick="closeFollowersModal()"></div>

        <div class="modal-content followers-modal-content">
          <img src="/icons/cross.svg" class="modal-close-icon" onclick="closeFollowersModal()" alt="Закрыть">

          <h2 class="followers-modal-title">Подписчики</h2>

          <div class="followers-list" id="followersList"></div>
        </div>
      </div>
    `);

    modal = document.getElementById("followersModal");
  }

  const list = document.getElementById("followersList");

  if (!followers || followers.length === 0) {
    list.innerHTML = `
      <div class="section-placeholder">
        Пока нет подписчиков
      </div>
    `;
  } else {
    list.innerHTML = followers.map(user => `
      <div class="follower-item" onclick="closeFollowersModal(); openUserProfile('${user.id}')">
        <img src="${user.avatarUrl ? `${user.avatarUrl}` : '/icons/blank_pfp.jpg'}" alt="Аватар">
        <span>${user.username}</span>
      </div>
    `).join("");
  }

  modal.classList.remove("hidden");
  modal.classList.add("show");
};

window.closeFollowersModal = function() {
  const modal = document.getElementById("followersModal");
  if (!modal) return;

  modal.classList.add("hidden");
  modal.classList.remove("show");
};

window.openMyFollowersModal = async function() {
  const myId = localStorage.getItem("userId");

  if (!myId) {
    console.error("userId не найден в localStorage");
    return;
  }

  await openFollowersModal(myId);
};

window.openFollowingModal = async function(userId) {
  const following = await getFollowing(userId);

  let modal = document.getElementById("followingModal");

  if (!modal) {
    document.body.insertAdjacentHTML("beforeend", `
      <div class="modal hidden" id="followingModal">
        <div class="modal-overlay" onclick="closeFollowingModal()"></div>

        <div class="modal-content followers-modal-content">
          <img src="/icons/cross.svg" class="modal-close-icon" onclick="closeFollowingModal()" alt="Закрыть">

          <h2 class="followers-modal-title">Подписки</h2>

          <div class="followers-list" id="followingList"></div>
        </div>
      </div>
    `);

    modal = document.getElementById("followingModal");
  }

  const list = document.getElementById("followingList");

  if (!following || following.length === 0) {
    list.innerHTML = `<div class="section-placeholder">Пока нет подписок</div>`;
  } else {
    list.innerHTML = following.map(user => `
      <div class="follower-item" onclick="closeFollowingModal(); openUserProfile('${user.id}')">
        <img src="${user.avatarUrl ? `${user.avatarUrl}` : '/icons/blank_pfp.jpg'}" alt="Аватар">
        <span>${user.username}</span>
      </div>
    `).join("");
  }

  modal.classList.remove("hidden");
  modal.classList.add("show");
};

window.closeFollowingModal = function() {
  const modal = document.getElementById("followingModal");
  if (!modal) return;

  modal.classList.add("hidden");
  modal.classList.remove("show");
};

window.openMyFollowingModal = async function() {
  const myId = localStorage.getItem("userId");

  if (!myId) {
    console.error("userId не найден в localStorage");
    return;
  }

  await openFollowingModal(myId);
};

async function renderHomeFeed() {
  const token = localStorage.getItem("token");
  const posts = await getFeedPosts(token);

  if (!posts || posts.length === 0) {
    contentArea.innerHTML = `
      <div class="section-placeholder">
        🎀 В ленте пока нет публикаций
      </div>
    `;
    return;
  }

  contentArea.innerHTML = `
    <div class="feed-page">
      ${posts.map(post => `
        <div class="feed-post">
          <div class="feed-post-header" onclick="openUserProfile('${post.user.id}')">
            <img src="${post.user.avatarUrl ? `${post.user.avatarUrl}` : '/icons/blank_pfp.jpg'}" alt="Аватар">
            <span>${post.user.username}</span>
            
          </div>
<div class="feed-post-image-wrapper">
          <img 
            class="feed-post-image"
            src="${post.imageUrl ? `${post.imageUrl}` : 'https://via.placeholder.com/500x500/FFE4F0/FF67A6?text=Пост'}"
            alt="Пост"
          >
          </div>

          <div class="feed-post-actions">
            <button onclick="toggleFeedLike(event, '${post.id}')">
              <img src="${post.isLiked ? '/icons/heart-filled.svg' : '/icons/heart.svg'}" alt="Лайк">
            </button>

            <button onclick="openFeedComments(event, '${post.id}')">
              <img src="/icons/comment.svg" alt="Комментарии">
            </button>

            <button onclick="toggleFeedFavorite(event, '${post.id}')">
              <img src="${post.isFavorite ? '/icons/bookmark-filled.svg' : '/icons/bookmark.svg'}" alt="Избранное">
            </button>

            <button onclick="event.stopPropagation(); openReportContentModal('post', '${post.id}')">
              <img src="/icons/flag.svg" alt="Жалоба">
            </button>
          </div>

          <div class="feed-post-likes">
            <span id="feedLikes-${post.id}">${post.likesCount ?? 0}</span> отметок "Нравится"
          </div>

          <div class="feed-post-description">
            <b>${post.user.username}</b> ${post.description || ''}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

window.toggleFeedLike = async function(event, postId) {
  event.stopPropagation();

  const btn = event.currentTarget;
  const img = btn.querySelector("img");
  const countEl = document.getElementById(`feedLikes-${postId}`);

  const token = localStorage.getItem("token");
  const result = await togglePostLike(token, postId);

  if (!result) return;

  img.src = result.liked
    ? "/icons/heart-filled.svg"
    : "/icons/heart.svg";

  if (countEl) {
    countEl.textContent = result.likesCount;
  }
};

window.toggleFeedFavorite = async function(event, postId) {
  event.stopPropagation();

  const btn = event.currentTarget;
  const img = btn.querySelector("img");

  const token = localStorage.getItem("token");
  const result = await togglePostFavorite(token, postId);

  if (!result) return;

  img.src = result.isFavorited
    ? "/icons/bookmark-filled.svg"
    : "/icons/bookmark.svg";
};

window.openFeedComments = async function(event, postId) {
  event.stopPropagation();

  const postCard = event.currentTarget.closest(".feed-post");

  document.querySelectorAll(".feed-comments-panel").forEach(panel => {
    panel.remove();
  });

  const panel = document.createElement("div");
  panel.className = "feed-comments-panel";
  panel.innerHTML = `
    <div class="feed-comments-header">
      <span>Комментарии</span>
      <img src="/icons/cross.svg" onclick="this.closest('.feed-comments-panel').remove()" alt="Закрыть">
    </div>

    <div class="feed-comments-list" id="feedCommentsList-${postId}">
      Загрузка...
    </div>

    <div class="feed-comment-input">
      <input id="feedCommentInput-${postId}" placeholder="Добавить комментарий...">
      <button onclick="sendFeedComment('${postId}')">
        <img src="/icons/plane.svg" alt="Отправить">
      </button>
    </div>
  `;

  postCard.appendChild(panel);

  await loadFeedComments(postId);
};

async function loadFeedComments(postId) {
  try {
    const comments = await getComments(postId);
    const container = document.getElementById(`feedCommentsList-${postId}`);
    const myId = localStorage.getItem("userId");

    if (!container) return;

    if (!comments || comments.length === 0) {
      container.innerHTML = `<div style="color:#FF98C1;">Комментариев пока нет</div>`;
      return;
    }

    container.innerHTML = comments.map(comment => `
      <div class="comment-thread">
        ${renderFeedComment(comment, postId, myId, false)}

        ${
          comment.replies && comment.replies.length > 0
            ? `
              <div class="comment-replies">
                ${comment.replies.slice(0, 2).map(reply =>
                  renderFeedComment(reply, postId, myId, true)
                ).join("")}
              </div>

              ${
                comment.replies.length > 2
                  ? `
                    <button class="comment-toggle-btn" onclick="toggleReplies('${comment.id}')">
                      Показать все ответы (${comment.replies.length})
                    </button>

                    <div class="comment-replies hidden" id="replies-${comment.id}">
                      ${comment.replies.slice(2).map(reply =>
                        renderComment(reply, postId, myId, true)
                      ).join("")}
                    </div>
                  `
                  : ""
              }
            `
            : ""
        }
      </div>
    `).join("");

  } catch (e) {
    console.error("Ошибка загрузки комментариев в ленте", e);
  }
}

function renderFeedComment(comment, postId, myId, isReply) {
  return `
    <div
      class="comment-item ${isReply ? "comment-reply-item" : ""}"
      onclick="replyToFeedComment('${postId}', '${comment.id}', '${comment.author?.username || ""}')"
    >
      <div class="comment-main">
        <span
          class="comment-username comment-link"
          onclick="event.stopPropagation(); openUserProfile('${comment.author?.id}')"
        >
          ${comment.author?.username || "Пользователь"}
        </span>

        <span class="comment-text">${comment.text}</span>
      </div>

      <div class="comment-actions">
        <button
          class="comment-like-btn"
          id="commentLikeBtn-${comment.id}"
          onclick="likeComment(event, '${comment.id}')"
        >
          <img
            src="${comment.isLikedByCurrentUser ? '/icons/heart-filled.svg' : '/icons/heart.svg'}"
            alt="Лайк"
          >

          <span id="commentLikesCount-${comment.id}">
            ${comment.likesCount ?? 0}
          </span>
        </button>

        ${
          String(comment.author?.id) === String(myId)
            ? `
              <button
                class="comment-delete-btn"
                onclick="deleteMyFeedComment(event, '${comment.id}', '${postId}')"
              >
                <img src="/icons/trash.svg" alt="Удалить">
              </button>
            `
            : ""
        }
      </div>
    </div>
  `;
}

window.sendFeedComment = async function(postId) {
const input = document.getElementById(`feedCommentInput-${postId}`);
const text = input.value.trim();

  if (!text) return;

  const token = localStorage.getItem("token");
await createComment(postId, text, token, replyingToCommentId);

replyingToCommentId = null;
input.value = "";

await loadFeedComments(postId);
};

window.replyToFeedComment = function(postId, commentId, username) {
  replyingToCommentId = commentId;

  const input = document.getElementById(`feedCommentInput-${postId}`);

  if (!input) {
    console.log("Инпут комментария ленты не найден");
    return;
  }

  input.value = `@${username} `;
  input.focus();
  input.setSelectionRange(input.value.length, input.value.length);
};

async function renderInterestingPosts() {
  const token = localStorage.getItem("token");
  const posts = await getInterestingPosts(token);

  if (!posts || posts.length === 0) {
    contentArea.innerHTML = `
      <div class="section-placeholder">
        🎀 Пока нет интересных публикаций
      </div>
    `;
    return;
  }

contentArea.innerHTML = `
  <div class="interesting-grid">
    ${posts.map(post => `
      <div class="interesting-post-card" onclick="openPostModal('${post.id}')">
        <img 
          src="${post.imageUrl ? `${post.imageUrl}` : '/icons/blank_pfp.jpg'}" 
          alt="Пост"
        >

        <div class="interesting-post-overlay">
          <div class="interesting-post-actions">

<span onclick="toggleInterestingLike(event, '${post.id}')">
  <img src="${post.isLiked ? '/icons/heart-filled.svg' : '/icons/heart.svg'}" alt="Лайк">
  <span class="interesting-like-count">${post.likesCount ?? 0}</span>
</span>

            <span onclick="toggleInterestingFavorite(event, '${post.id}')">
              <img src="${post.isFavorite ? '/icons/bookmark-filled.svg' : '/icons/bookmark.svg'}" alt="Избранное">
            </span>

          </div>
        </div>
      </div>
    `).join('')}
  </div>
`;
}

window.setInterestingImageType = function(img) {
  const card = img.closest(".interesting-post-card");
  if (!card) return;

  const w = img.naturalWidth;
  const h = img.naturalHeight;

  card.classList.remove("portrait", "landscape", "square");

  if (h > w) {
    card.classList.add("portrait");
  } else if (w > h) {
    card.classList.add("landscape");
  } else {
    card.classList.add("square");
  }
};

const logoHome = document.getElementById("logoHome");

logoHome?.addEventListener("click", () => {
  switchToSection("home");
});

window.toggleInterestingFavorite = async function(event, postId) {
  event.stopPropagation();

  const btn = event.currentTarget;
  const img = btn.querySelector("img");

  const token = localStorage.getItem("token");
  const result = await togglePostFavorite(token, postId);

  if (!result) return;

  img.src = result.isFavorited
    ? "/icons/bookmark-filled.svg"
    : "/icons/bookmark.svg";
};
window.toggleInterestingLike = async function(event, postId) {
  event.stopPropagation();

  const btn = event.currentTarget;
  const img = btn.querySelector("img");
  const countEl = btn.querySelector(".interesting-like-count");

  const token = localStorage.getItem("token");
  const result = await togglePostLike(token, postId);

  if (!result) return;

  img.src = result.liked
    ? "/icons/heart-filled.svg"
    : "/icons/heart.svg";

  countEl.textContent = result.likesCount;
};

async function renderShopPage() {
const ads = await getProductAds(shopFilters);
  contentArea.innerHTML = `
    <div class="shop-page">

<div class="shop-price-filter-wrapper">
  <button class="shop-filter-btn" onclick="togglePriceFilterPopup(event)">
    Цена
  </button>

  <div class="shop-price-popup" id="shopPricePopup">
    <div class="shop-price-row">
      <input id="priceFromInput" type="number" placeholder="от">
      <input id="priceToInput" type="number" placeholder="до">
    </div>

    <div class="shop-price-actions">
      <button onclick="applyShopPriceFilter()">Применить</button>
      <button onclick="resetShopPriceFilter()">Сбросить</button>
    </div>
  </div>
</div>

      <div class="shop-grid">
        ${
          ads && ads.length > 0
            ? ads.map(ad => {
                const imageUrl = ad.images && ad.images.length > 0
                  ? `${ad.images[0]}`
                  : "/icons/blank_pfp.jpg";

                return `
                  <div class="shop-card" onclick="openProductAdModal('${ad.id}')">
                    <div class="shop-card-image-wrapper">
                      <img src="${imageUrl}" alt="${ad.title}">
                      <div class="shop-card-overlay"></div>
                    </div>

                    <div class="shop-card-price">${ad.price}р</div>
                    <div class="shop-card-description">${ad.title}</div>
                  </div>
                `;
                if (searchInput) {
  searchInput.value = shopFilters.search || "";
}
              }).join("")
            : `
              <div class="section-placeholder" style="grid-column:1/-1;">
                Объявления не найдены
              </div>
            `
        }
      </div>
    </div>
  `;
}

function renderCreateChoiceModal() {
  if (!document.getElementById("createChoiceModal")) {
    const modalHTML = `
      <div class="modal" id="createChoiceModal">
        <div class="modal-overlay"></div>

        <div class="modal-content create-choice-content">
          <img src="/icons/cross.svg" class="modal-close-icon" id="createChoiceClose" alt="Закрыть">

          <h2 class="create-choice-title">Что создать?</h2>

          <div class="create-choice-buttons">
            <button class="create-choice-btn" id="createPostChoice">
              <img src="/icons/plus.svg" alt="">
              Пост
            </button>

            <button class="create-choice-btn" id="createAdChoice">
              <img src="/icons/cart.svg" alt="">
              Объявление
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    document.getElementById("createChoiceClose").onclick = closeCreateChoiceModal;
    document.querySelector("#createChoiceModal .modal-overlay").onclick = closeCreateChoiceModal;

    document.getElementById("createPostChoice").onclick = () => {
      closeCreateChoiceModal();
      renderCreatePostPage();
    };

    document.getElementById("createAdChoice").onclick = () => {
      closeCreateChoiceModal();
      renderCreateProductAdModal();
    };
  }

  document.getElementById("createChoiceModal").classList.add("show");
}

function closeCreateChoiceModal() {
  const modal = document.getElementById("createChoiceModal");
  if (!modal) return;

  modal.classList.remove("show");
}

function renderCreateProductAdModal() {
  if (!document.getElementById("createProductAdModal")) {
    const modalHTML = `
      <div class="modal" id="createProductAdModal">
        <div class="modal-overlay"></div>

        <div class="modal-content create-product-content">
          <img src="/icons/cross.svg" class="modal-close-icon" id="createProductClose" alt="Закрыть">

          <div style="width: 100%;">
            <h2 class="create-product-title">Создать объявление</h2>

              <div class="product-images-box image-drop-zone" id="productImagesBox">

                <div class="product-upload-placeholder" id="productUploadPlaceholder">
                  <img src="/icons/camera-fill.svg" alt="">
                  <div class="drop-zone-title">
                    Перетащите фото товара сюда
                  </div>

                  <div class="drop-zone-subtitle">
                    или нажмите для выбора
                  </div>
                </div>

              </div>

              <input
                type="file"
                id="productImagesInput"
                accept="image/*"
                multiple
                style="display:none;"
              >

            <input id="productTitleInput" class="product-input" placeholder="Название товара">

            <textarea id="productDescriptionInput" class="product-textarea" placeholder="Описание товара"></textarea>

            <input id="productPriceInput" class="product-input" type="number" min="0" placeholder="Цена">

            <select id="productCategoryInput" class="product-input">
              <option value="">Выберите категорию</option>
            </select>

            <div class="product-modal-actions">
              <button class="profile-edit-btn" id="cancelProductBtn">Отмена</button>
              <button class="file-upload-btn" id="saveProductBtn">Опубликовать</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);
  }
  setupProductImageDropZone();

  const modal = document.getElementById("createProductAdModal");
  const closeBtn = document.getElementById("createProductClose");
  const cancelBtn = document.getElementById("cancelProductBtn");
  const saveBtn = document.getElementById("saveProductBtn");
  const overlay = modal.querySelector(".modal-overlay");

  const imagesBox = document.getElementById("productImagesBox");
  const imagesInput = document.getElementById("productImagesInput");

  imagesBox.onclick = () => imagesInput.click();

  imagesInput.onchange = () => {
    const files = Array.from(imagesInput.files);

    if (files.length === 0) return;

    imagesBox.innerHTML = `
      <div class="product-preview-grid">
        ${files.map(file => `
          <img src="${URL.createObjectURL(file)}" alt="Фото">
        `).join("")}
      </div>
    `;
  };

  function closeModal() {
    modal.classList.remove("show");
    imagesInput.value = "";
    imagesBox.innerHTML = `
      <div class="product-upload-placeholder">
        <img src="/icons/camera-fill.svg" alt="">
        <div>Выберите фото товара</div>
      </div>
    `;
  }

  async function saveProductAd() {
    const token = localStorage.getItem("token");

    const title = document.getElementById("productTitleInput").value.trim();
    const description = document.getElementById("productDescriptionInput").value.trim();
    const price = document.getElementById("productPriceInput").value;
    const categoryId = document.getElementById("productCategoryInput").value;
    const images = Array.from(imagesInput.files);

    if (!title || !description || !price || !categoryId) {
      showToast("Заполните название, описание, цену и категорию");
      return;
    }

    if (images.length === 0) {
      showToast("Добавьте хотя бы одно фото");
      return;
    }

    saveBtn.disabled = true;
    saveBtn.textContent = "Публикация...";

    try {
      await createProductAd(token, {
        title,
        description,
        price,
        categoryId,
        images
      });

      showToast("Объявление создано!");
      closeModal();
      switchToSection("cart");

    } catch (error) {
      showToast("Ошибка создания объявления: " + error.message);
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = "Опубликовать";
    }
  }

  closeBtn.onclick = closeModal;
  cancelBtn.onclick = closeModal;
  overlay.onclick = closeModal;
  saveBtn.onclick = saveProductAd;

  modal.classList.add("show");
  loadProductCategoriesToSelect("productCategoryInput");
}

let currentProductImages = [];
let currentProductImageIndex = 0;

function createProductAdViewModal() {
  if (document.getElementById("productAdViewModal")) return;

  const modalHTML = `
    <div class="modal hidden" id="productAdViewModal">
      <div class="modal-overlay"></div>

      <div class="modal-content product-ad-modal-content">
        <img src="/icons/cross.svg" class="modal-close-icon" id="productAdClose" alt="Закрыть">
          <button
            class="product-ad-report-icon-btn"
            id="productAdReportBtn"
            title="Пожаловаться"
          >
            <img src="/icons/flag.svg" alt="Жалоба">
          </button>

        <div class="product-ad-image-side">
          <button class="product-ad-arrow left" id="productAdPrev">‹</button>

          <img id="productAdImage" src="" alt="Объявление">

          <button class="product-ad-arrow right" id="productAdNext">›</button>
        </div>

        <div class="product-ad-info-side">
          <h2 id="productAdTitle"></h2>

          <div class="product-ad-price" id="productAdPrice"></div>

          <div class="product-ad-meta">
            <span id="productAdCategory"></span>
            <span id="productAdDate"></span>
          </div>

          <div class="product-ad-seller" id="productAdSeller"></div>

          <p class="product-ad-description" id="productAdDescription"></p>
          <button class="product-add-cart-btn" id="productAddToCartBtn">
            Добавить в корзину
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);

  document.getElementById("productAdClose").onclick = closeProductAdModal;
  document.querySelector("#productAdViewModal .modal-overlay").onclick = closeProductAdModal;

  document.getElementById("productAdPrev").onclick = (e) => {
    e.stopPropagation();
    showProductImage(currentProductImageIndex - 1);
  };

  document.getElementById("productAdNext").onclick = (e) => {
    e.stopPropagation();
    showProductImage(currentProductImageIndex + 1);
  };
}

async function openProductAdModal(adId) {
  const ad = await getProductAdById(adId);

  if (!ad) {
    showToast("Не удалось загрузить объявление");
    return;
  }

  createProductAdViewModal();
  await refreshCartState();

  currentProductImages = ad.images && ad.images.length > 0
    ? ad.images.map(img => `${img}`)
    : ["/icons/blank_pfp.jpg"];

  currentProductImageIndex = 0;

  document.getElementById("productAdTitle").textContent = ad.title || "Без названия";
  document.getElementById("productAdPrice").textContent = `${ad.price}р`;
  document.getElementById("productAdCategory").textContent = ad.categoryName || "Без категории";
const sellerElement = document.getElementById("productAdSeller");

sellerElement.innerHTML = `
  Продавец:
  <span class="product-ad-seller-link">
    ${ad.username || "Пользователь"}
  </span>
`;
const sellerLink = sellerElement.querySelector(".product-ad-seller-link");

sellerLink.onclick = (e) => {
  e.stopPropagation();

  closeProductAdModal();

  const currentUserId = Number(localStorage.getItem("userId"));

  if (currentUserId === ad.userId) {
    switchToSection("profile");
  } else {
    openUserProfile(ad.userId);
  }
};
document.getElementById("productAdDescription").textContent = ad.description || "Описание отсутствует";

const addCartBtn = document.getElementById("productAddToCartBtn");

if (addCartBtn) {
  const currentUserId = Number(localStorage.getItem("userId"));
  const isOwnProduct = currentUserId === Number(ad.userId);
  const isInCart = cartProductIds.has(String(ad.id));

  if (isOwnProduct) {
    addCartBtn.style.display = "none";
  } else {
    addCartBtn.style.display = "block";
    addCartBtn.disabled = isInCart;
    addCartBtn.textContent = isInCart ? "Уже в корзине" : "Добавить в корзину";

    addCartBtn.onclick = async () => {
      const token = localStorage.getItem("token");
      const result = await addToCart(token, ad.id);

      if (!result) return;

      await refreshCartState();

      addCartBtn.textContent = "Уже в корзине";
      addCartBtn.disabled = true;
    };
  }
}

const reportBtn = document.getElementById("productAdReportBtn");

if (reportBtn) {
  const currentUserId = Number(localStorage.getItem("userId"));
  const isOwnProduct = currentUserId === Number(ad.userId);

  if (isOwnProduct) {
    reportBtn.style.display = "none";
  } else {
    reportBtn.style.display = "flex";

    reportBtn.onclick = (event) => {
      event.stopPropagation();

      openReportContentModal("productAd", ad.id);
    };
  }
}

  if (ad.createdAt) {
    document.getElementById("productAdDate").textContent =
      new Date(ad.createdAt).toLocaleDateString("ru-RU");
  }

  showProductImage(0);

  const modal = document.getElementById("productAdViewModal");
  modal.classList.remove("hidden");
  modal.classList.add("show");
}

function showProductImage(index) {
  if (!currentProductImages.length) return;

  if (index < 0) index = currentProductImages.length - 1;
  if (index >= currentProductImages.length) index = 0;

  currentProductImageIndex = index;

  const img = document.getElementById("productAdImage");
  img.src = currentProductImages[currentProductImageIndex];

  const prev = document.getElementById("productAdPrev");
  const next = document.getElementById("productAdNext");

  const showArrows = currentProductImages.length > 1;

  prev.style.display = showArrows ? "flex" : "none";
  next.style.display = showArrows ? "flex" : "none";
}

function closeProductAdModal() {
  const modal = document.getElementById("productAdViewModal");
  if (!modal) return;

  modal.classList.add("hidden");
  modal.classList.remove("show");
}

async function loadShopCategoriesDropdown() {
  const dropdown = document.getElementById("shopCategoriesDropdown");
  if (!dropdown) return;

  const categories = await getProductCategories();

  if (!categories || categories.length === 0) {
    dropdown.innerHTML = `
      <div class="shop-category-item">
        Категории не найдены
      </div>
    `;
    return;
  }

  dropdown.innerHTML = `
<div class="shop-category-item" onclick="filterShopByCategory(null, event)">
  Все категории
</div>

    ${categories.map(category => `
<div class="shop-category-item" onclick="filterShopByCategory('${category.id}', event)">
  ${category.name}
</div>
    `).join("")}
  `;
}

window.filterShopByCategory = async function(categoryId, event) {
  shopFilters.categoryId = categoryId || null;

  document.querySelectorAll(".shop-category-item").forEach(item => {
    item.classList.remove("active");
  });

  if (event?.currentTarget) {
    event.currentTarget.classList.add("active");
  }

  await renderShopPage();
};

window.setShopPriceFilter = async function(priceFrom, priceTo) {
  shopFilters.priceFrom = priceFrom;
  shopFilters.priceTo = priceTo;

  await renderShopPage();
};

window.togglePriceFilterPopup = function(event) {
  event.stopPropagation();

  const popup = document.getElementById("shopPricePopup");
  if (!popup) return;

  popup.classList.toggle("show");
};

window.applyShopPriceFilter = async function() {
  const from = document.getElementById("priceFromInput").value;
  const to = document.getElementById("priceToInput").value;

  shopFilters.priceFrom = from || null;
  shopFilters.priceTo = to || null;

  document.getElementById("shopPricePopup")?.classList.remove("show");

  await renderShopPage();
};

window.resetShopPriceFilter = async function() {
  shopFilters.priceFrom = null;
  shopFilters.priceTo = null;

  const fromInput = document.getElementById("priceFromInput");
  const toInput = document.getElementById("priceToInput");

  if (fromInput) fromInput.value = "";
  if (toInput) toInput.value = "";

  document.getElementById("shopPricePopup")?.classList.remove("show");

  await renderShopPage();
};

document.addEventListener("click", (event) => {
  if (!event.target.closest(".shop-price-filter-wrapper")) {
    document.getElementById("shopPricePopup")?.classList.remove("show");
  }
});

window.toggleProductCardMenu = function(event, adId) {
  event.stopPropagation();

  document.querySelectorAll(".product-card-dropdown").forEach(menu => {
    if (menu.id !== `productCardDropdown-${adId}`) {
      menu.classList.remove("show");
    }
  });

  const dropdown = document.getElementById(`productCardDropdown-${adId}`);
  if (dropdown) {
    dropdown.classList.toggle("show");
  }
};

document.addEventListener("click", (e) => {
  if (!e.target.closest(".product-card-menu")) {
    document.querySelectorAll(".product-card-dropdown").forEach(menu => {
      menu.classList.remove("show");
    });
  }
});

window.deleteProductAdFromProfile = async function(adId) {
  document.querySelectorAll(".product-card-dropdown").forEach(menu => {
    menu.classList.remove("show");
  });

const ok = await showConfirm("Удалить объявление?", {
  title: "Удаление",
  confirmText: "Удалить",
  cancelText: "Отмена",
  danger: true
});

if (!ok) return;
  const token = localStorage.getItem("token");
  const result = await deleteProductAd(token, adId);

  if (!result) {
    showToast("Ошибка при удалении объявления");
    return;
  }

  await renderProfile();
};

window.openEditProductAdModal = async function(adId) {
  document.querySelectorAll(".product-card-dropdown").forEach(menu => {
    menu.classList.remove("show");
  });

  const ad = await getProductAdById(adId);

  if (!ad) {
    showToast("Не удалось загрузить объявление");
    return;
  }

  renderEditProductAdModal(ad);
};

function renderEditProductAdModal(ad) {
  if (!document.getElementById("editProductAdModal")) {
    const modalHTML = `
      <div class="modal" id="editProductAdModal">
        <div class="modal-overlay"></div>

        <div class="modal-content create-product-content">
          <img src="/icons/cross.svg" class="modal-close-icon" id="editProductClose" alt="Закрыть">

          <div style="width: 100%;">
            <h2 class="create-product-title">Редактировать объявление</h2>

            <input id="editProductTitleInput" class="product-input" placeholder="Название товара">

            <textarea id="editProductDescriptionInput" class="product-textarea" placeholder="Описание товара"></textarea>

            <input id="editProductPriceInput" class="product-input" type="number" min="0" placeholder="Цена">

            <select id="editProductCategoryInput" class="product-input">
              <option value="">Выберите категорию</option>
              <option value="1">Куклы</option>
            </select>

            <div class="product-modal-actions">
              <button class="profile-edit-btn" id="cancelEditProductBtn">Отмена</button>
              <button class="file-upload-btn" id="saveEditProductBtn">Сохранить</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);
  }

  const modal = document.getElementById("editProductAdModal");

  document.getElementById("editProductTitleInput").value = ad.title || "";
  document.getElementById("editProductDescriptionInput").value = ad.description || "";
  document.getElementById("editProductPriceInput").value = ad.price || "";

loadProductCategoriesToSelect(
  "editProductCategoryInput",
  ad.categoryId
);

  function closeModal() {
    modal.classList.remove("show");
  }

  async function saveChanges() {
    const token = localStorage.getItem("token");

    const title = document.getElementById("editProductTitleInput").value.trim();
    const description = document.getElementById("editProductDescriptionInput").value.trim();
    const price = document.getElementById("editProductPriceInput").value;
    const categoryId = document.getElementById("editProductCategoryInput").value;

    if (!title || !description || !price || !categoryId) {
      showToast("Заполните все поля");
      return;
    }

    const result = await updateProductAd(token, ad.id, {
      title,
      description,
      price,
      categoryId
    });

    if (!result) {
      showToast("Ошибка при обновлении объявления");
      return;
    }

    closeModal();
    await renderProfile();
  }

  document.getElementById("editProductClose").onclick = closeModal;
  document.getElementById("cancelEditProductBtn").onclick = closeModal;
  document.querySelector("#editProductAdModal .modal-overlay").onclick = closeModal;
  document.getElementById("saveEditProductBtn").onclick = saveChanges;

  modal.classList.add("show");
}

async function loadProductCategoriesToSelect(selectId, selectedId = null) {
  const select = document.getElementById(selectId);
  if (!select) return;

  const categories = await getProductCategories();

  select.innerHTML = `
    <option value="">Выберите категорию</option>
    ${categories.map(category => `
      <option value="${category.id}" ${String(selectedId) === String(category.id) ? "selected" : ""}>
        ${category.name}
      </option>
    `).join("")}
  `;
}

document.getElementById("topbarCartIcon")?.addEventListener("click", () => {
  openCartModal();
});

async function openCartModal() {
  const token = localStorage.getItem("token");
  const items = await getMyCart(token);

  let modal = document.getElementById("cartModal");

  if (!modal) {
    document.body.insertAdjacentHTML("beforeend", `
      <div class="modal hidden" id="cartModal">
        <div class="modal-overlay" onclick="closeCartModal()"></div>

        <div class="modal-content cart-modal-content">
          <img src="/icons/cross.svg" class="modal-close-icon" onclick="closeCartModal()" alt="Закрыть">

          <h2 class="cart-modal-title">Корзина</h2>

          <button class="cart-clear-btn" onclick="clearMyCart()">
  Очистить корзину
          </button>

          <div class="cart-items-list" id="cartItemsList"></div>
        </div>
      </div>
    `);

    modal = document.getElementById("cartModal");
  }

  const list = document.getElementById("cartItemsList");

  if (!items || items.length === 0) {
    list.innerHTML = `
      <div class="section-placeholder">
        Корзина пока пустая
      </div>
    `;
  } else {
    list.innerHTML = items.map(item => {
      const imageUrl = item.images && item.images.length > 0
        ? `${item.images[0]}`
        : "/icons/blank_pfp.jpg";

      return `
        <div class="cart-item" onclick="openProductAdModal('${item.id}')">
          <img src="${imageUrl}" alt="${item.title}">

          <div class="cart-item-info">
            <div class="cart-item-title">${item.title}</div>
            <div class="cart-item-category">${item.categoryName || "Без категории"}</div>
            <div class="cart-item-seller">${item.username || "Пользователь"}</div>
          </div>

          <div class="cart-item-price">${item.price}р</div>
          <button class="cart-remove-btn" onclick="removeCartItem(event, '${item.id}')">
  <img src="/icons/trash.svg" alt="Удалить">
          </button>
        </div>
      `;
    }).join("");
  }

  modal.classList.remove("hidden");
  modal.classList.add("show");
}

function closeCartModal() {
  const modal = document.getElementById("cartModal");
  if (!modal) return;

  modal.classList.add("hidden");
  modal.classList.remove("show");
}
window.removeCartItem = async function(event, productAdId) {
  event.stopPropagation();

  const token = localStorage.getItem("token");
  const result = await removeFromCart(token, productAdId);

  if (!result) return;

  await refreshCartState();
  await openCartModal();
};

window.clearMyCart = async function() {
const ok = await showConfirm("Очистить корзину?", {
  title: "Очистка",
  confirmText: "Очистить",
  cancelText: "Отмена",
  danger: true
});

if (!ok) return;
  const token = localStorage.getItem("token");
  const result = await clearCart(token);

  if (!result) return;

  await openCartModal();
};

function renderStars(rating) {
  let html = "";

  for (let i = 1; i <= 5; i++) {
    html += `
      <img 
        src="${i <= rating ? '/icons/star-filled.svg' : '/icons/star.svg'}" 
        alt="star"
      >
    `;
  }

  return html;
}

function getAverageRating(reviews) {
  if (!reviews || reviews.length === 0) return "0.0";

  const sum = reviews.reduce((acc, review) => acc + Number(review.rating), 0);
  return (sum / reviews.length).toFixed(1);
}

window.openCreateReviewModal = function(userId) {
  let modal = document.getElementById("createReviewModal");

  if (!modal) {
    document.body.insertAdjacentHTML("beforeend", `
      <div class="modal hidden" id="createReviewModal">
        <div class="modal-overlay" onclick="closeCreateReviewModal()"></div>

        <div class="modal-content create-review-content">
          <img src="/icons/cross.svg" class="modal-close-icon" onclick="closeCreateReviewModal()" alt="Закрыть">

          <h2 class="create-review-title">Оставить отзыв</h2>

          <div class="review-stars-input" id="reviewStarsInput">
            ${[1,2,3,4,5].map(i => `
              <img src="/icons/star.svg" data-rating="${i}" onclick="setReviewRating(${i})">
            `).join("")}
          </div>

          <textarea id="reviewDescriptionInput" class="product-textarea" placeholder="Напишите отзыв..."></textarea>

          <button class="file-upload-btn" id="saveReviewBtn">
            Отправить отзыв
          </button>
        </div>
      </div>
    `);

    modal = document.getElementById("createReviewModal");
  }

  modal.dataset.userId = userId;
  modal.dataset.rating = "0";

  document.getElementById("reviewDescriptionInput").value = "";
  setReviewRating(0);

  modal.classList.remove("hidden");
  modal.classList.add("show");
};

window.closeCreateReviewModal = function() {
  const modal = document.getElementById("createReviewModal");
  if (!modal) return;

  modal.classList.add("hidden");
  modal.classList.remove("show");
};

window.setReviewRating = function(rating) {
  const modal = document.getElementById("createReviewModal");
  if (modal) modal.dataset.rating = rating;

  document.querySelectorAll("#reviewStarsInput img").forEach(star => {
    const value = Number(star.dataset.rating);
    star.src = value <= rating
      ? "/icons/star-filled.svg"
      : "/icons/star.svg";
  });
};

document.addEventListener("click", async function(event) {
  if (event.target.id !== "saveReviewBtn") return;

  const modal = document.getElementById("createReviewModal");
  const userId = modal.dataset.userId;
  const rating = modal.dataset.rating;
  const description = document.getElementById("reviewDescriptionInput").value.trim();

  const result = await createUserReview(userId, rating, description);

  if (!result) return;

  closeCreateReviewModal();
  await showOtherUserTab("shop", { currentTarget: document.querySelector(".profile-tab.active") });
});

async function refreshCartState() {
  const token = localStorage.getItem("token");
  const items = await getMyCart(token);

  cartProductIds = new Set((items || []).map(item => String(item.id)));
}

window.removeReview = async function(reviewId, profileUserId) {
const ok = await showConfirm("Удалить отзыв?", {
  title: "Удаление",
  confirmText: "Удалить",
  cancelText: "Отмена",
  danger: true
});

if (!ok) return;
  const result = await deleteReview(reviewId);

  if (!result) return;

  const activeTab = document.querySelector(".profile-tab.active");

  await showOtherUserTab("shop", {
    currentTarget: activeTab
  });
};

window.deleteMyComment = async function(event, commentId, postId) {
  event.stopPropagation();

const ok = await showConfirm("Удалить комментарий?", {
  title: "Удаление",
  confirmText: "Удалить",
  cancelText: "Отмена",
  danger: true
});

if (!ok) return;
  const result = await deleteComment(commentId);

  if (!result) return;

  await loadComments(postId);

};

window.likeComment = async function(event, commentId) {
  event.stopPropagation();

  const result = await toggleCommentLike(commentId);
  if (!result) return;

  const btn = document.getElementById(`commentLikeBtn-${commentId}`);
  const count = document.getElementById(`commentLikesCount-${commentId}`);

  if (!btn || !count) return;

  const img = btn.querySelector("img");

  img.src = result.isLiked
    ? "/icons/heart-filled.svg"
    : "/icons/heart.svg";

  count.textContent = result.likesCount;

  btn.classList.remove("liked-pop");
  void btn.offsetWidth;
  btn.classList.add("liked-pop");
};

window.deleteMyFeedComment = async function(event, commentId, postId) {
  event.stopPropagation();

const ok = await showConfirm("Удалить комментарий?", {
  title: "Удаление",
  confirmText: "Удалить",
  cancelText: "Отмена",
  danger: true
});

if (!ok) return;
  const token = localStorage.getItem("token");
  const result = await deleteComment(commentId, token);

  if (!result) return;

  await loadFeedComments(postId);
};
async function renderNotificationsPage() {
  const notifications = await getNotifications();

  contentArea.innerHTML = `
    <div class="notifications-page">
      <div class="notifications-header">
        <h2>Уведомления</h2>

        <button class="notifications-read-all-btn" onclick="readAllNotifications()">
          Прочитать все
        </button>
      </div>

      <div class="notifications-list">
        ${
          notifications && notifications.length > 0
            ? notifications.map(n => `
              <div class="notification-card ${n.isRead ? "" : "unread"}" onclick="openNotification('${n.id}', '${n.postId || ""}', '${n.fromUserId}')">
                <img
                  src="${n.fromUserAvatar ? `${n.fromUserAvatar}` : '/icons/blank_pfp.jpg'}"
                  class="notification-avatar"
                  onclick="event.stopPropagation(); openUserProfile('${n.fromUserId}')"
                >

                <div class="notification-info">
                  <div class="notification-text">
                    <span onclick="event.stopPropagation(); openUserProfile('${n.fromUserId}')">
                      ${n.fromUserName}
                    </span>
                    ${n.message || getNotificationText(n.type)}
                  </div>

                  <div class="notification-date">
                    ${formatNotificationDate(n.createdAt)}
                  </div>

                  ${
  n.type === "FollowRequest" && n.followRequestId && !n.isRead
    ? `
<div class="notification-request-actions">
  <button onclick="event.stopPropagation(); acceptRequestFromNotification('${n.followRequestId}', this)">
    Принять
  </button>

  <button onclick="event.stopPropagation(); rejectRequestFromNotification('${n.followRequestId}', this)">
    Отклонить
  </button>
</div>
    `
    : ""
}

                </div>

                ${!n.isRead ? `<div class="notification-dot"></div>` : ""}

                <button class="notification-delete-btn" onclick="event.stopPropagation(); removeNotification('${n.id}')">
                  <img src="/icons/trash.svg" alt="Удалить">
                </button>
              </div>
            `).join("")
            : `
              <div class="section-placeholder">
                Уведомлений пока нет
              </div>
            `
        }
      </div>
    </div>
  `;

  updateNotificationsBadge();
}

function getNotificationText(type) {
  switch (type) {
    case "Like":
      return "поставил(а) лайк вашей публикации";
    case "Comment":
      return "оставил(а) комментарий к вашей публикации";
    case "Follow":
      return "подписался(ась) на вас";
    case "Review":
      return "оставил(а) отзыв";
    case "NewPost":
      return "добавил(а) новый пост";
    case "FollowRequest":
      return "хочет подписаться на вас";
    default:
      return "у вас новое уведомление";
  }
}

function formatNotificationDate(dateValue) {
  if (!dateValue) return "";

  const date = new Date(dateValue);
  const now = new Date();

  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 1) return "только что";
  if (diffMin < 60) return `${diffMin} мин назад`;
  if (diffHours < 24) return `${diffHours} ч назад`;
  if (diffDays < 7) return `${diffDays} дн назад`;

  return date.toLocaleDateString("ru-RU");
}

window.openNotification = async function(id, postId, fromUserId) {
  await markNotificationAsRead(id);

  if (postId) {
    await openPostModal(postId);
  } else if (fromUserId) {
    openUserProfile(fromUserId);
  }

  updateNotificationsBadge();
};

window.readAllNotifications = async function() {
  await markAllNotificationsAsRead();
  await renderNotificationsPage();
};

window.removeNotification = async function(id) {
  await deleteNotification(id);
  await renderNotificationsPage();
};

async function updateNotificationsBadge() {
  const badge = document.getElementById("notificationBadge");
  if (!badge) return;

  const count = await getUnreadNotificationsCount();

  if (count > 0) {
    badge.textContent = count > 99 ? "99+" : count;
    badge.style.display = "flex";
  } else {
    badge.style.display = "none";
  }
}

async function initTheme() {
  const dbTheme = await getUserTheme();
  applyTheme(dbTheme || "light");
}

function applyTheme(theme) {
  document.body.classList.remove("light-theme", "dark-theme");
  document.documentElement.classList.remove("light-theme", "dark-theme");

  document.body.classList.add(`${theme}-theme`);
  document.documentElement.classList.add(`${theme}-theme`);
}

window.toggleTheme = async function() {
  const isDark = document.body.classList.contains("dark-theme");
  const newTheme = isDark ? "light" : "dark";
  applyTheme(newTheme);
  await updateUserTheme(newTheme);
};

window.acceptRequestFromNotification = async function(requestId, button) {
  const res = await acceptFollowRequest(requestId);

  if (!res.ok) {
    alert(await res.text());
    return;
  }

  const actions = button.closest(".notification-request-actions");

  if (actions) {
    actions.remove();
  }
};

window.rejectRequestFromNotification = async function(requestId, button) {
  const res = await rejectFollowRequest(requestId);

  if (!res.ok) {
    alert(await res.text());
    return;
  }

  const actions = button.closest(".notification-request-actions");

  if (actions) {
    actions.remove();
  }
};

window.openChangePasswordModal = function() {
  let modal = document.getElementById("changePasswordModal");

  if (!modal) {
    document.body.insertAdjacentHTML("beforeend", `
      <div class="modal hidden" id="changePasswordModal">
        <div class="modal-overlay" onclick="closeChangePasswordModal()"></div>

        <div class="modal-content change-password-content">
          <img src="/icons/cross.svg" class="modal-close-icon" onclick="closeChangePasswordModal()" alt="Закрыть">

          <h2 class="change-password-title">Изменить пароль</h2>

          <input id="oldPasswordInput" type="password" class="edit-profile-input" placeholder="Старый пароль">
          <input id="newPasswordInput" type="password" class="edit-profile-input" placeholder="Новый пароль">

          <button class="file-upload-btn" onclick="saveNewPassword()">
            Сохранить
          </button>
        </div>
      </div>
    `);

    modal = document.getElementById("changePasswordModal");
  }

  document.getElementById("oldPasswordInput").value = "";
  document.getElementById("newPasswordInput").value = "";

  modal.classList.remove("hidden");
  modal.classList.add("show");
};

window.closeChangePasswordModal = function() {
  const modal = document.getElementById("changePasswordModal");
  if (!modal) return;

  modal.classList.add("hidden");
  modal.classList.remove("show");
};

window.saveNewPassword = async function() {
  const oldPassword = document.getElementById("oldPasswordInput").value.trim();
  const newPassword = document.getElementById("newPasswordInput").value.trim();

  if (!oldPassword || !newPassword) {
    showToast("Заполните оба поля");
    return;
  }

  const result = await changePassword(oldPassword, newPassword);

  if (!result) return;

  showToast("Пароль изменён");
  closeChangePasswordModal();
};

window.logoutAccount = function() {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("username");

  window.location.href = "loginpage.html";
};

window.deleteMyAccount = async function() {
const ok = await showConfirm("Вы точно хотите удалить аккаунт? Это действие нельзя отменить", {
  title: "Удаление",
  confirmText: "Удалить",
  cancelText: "Отмена",
  danger: true
});

if (!ok) return;
  const result = await deleteAccount();

  if (!result) return;

  localStorage.clear();
  window.location.href = "login.html";
};

window.toggleOtherProfileMenu = function() {
  const dropdown = document.getElementById("otherProfileDropdown");
  if (!dropdown) return;

  dropdown.classList.toggle("show");
};

document.addEventListener("click", (event) => {
  if (!event.target.closest(".other-profile-menu")) {
    document.getElementById("otherProfileDropdown")?.classList.remove("show");
  }
});

window.blockUserFromProfile = async function(userId) {
const ok = await showConfirm("Заблокировать пользователя?", {
  title: "Блокировка",
  confirmText: "Заблокировать",
  cancelText: "Отмена",
  danger: true
});

if (!ok) return;
  const result = await blockUser(userId);

  if (!result) return;

  showToast("Пользователь добавлен в черный список");
  switchToSection("home");
};
window.openBlacklistModal = async function() {
  const users = await getBlockedUsers();

  let modal = document.getElementById("blacklistModal");

  if (!modal) {
    document.body.insertAdjacentHTML("beforeend", `
      <div class="modal hidden" id="blacklistModal">
        <div class="modal-overlay" onclick="closeBlacklistModal()"></div>

        <div class="modal-content blacklist-modal-content">
          <img src="/icons/cross.svg" class="modal-close-icon" onclick="closeBlacklistModal()" alt="Закрыть">

          <h2 class="blacklist-title">Черный список</h2>

          <div class="blacklist-list" id="blacklistList"></div>
        </div>
      </div>
    `);

    modal = document.getElementById("blacklistModal");
  }

  const list = document.getElementById("blacklistList");

  if (!users || users.length === 0) {
    list.innerHTML = `<div class="section-placeholder">Черный список пуст</div>`;
  } else {
    list.innerHTML = users.map(user => `
      <div class="blacklist-item">
        <img src="${user.avatarUrl ? `${user.avatarUrl}` : "/icons/blank_pfp.jpg"}" alt="Аватар">

        <span>${user.username}</span>

        <button onclick="unblockUserFromList('${user.id}')">
          Разблокировать
        </button>
      </div>
    `).join("");
  }

  modal.classList.remove("hidden");
  modal.classList.add("show");
};

window.closeBlacklistModal = function() {
  const modal = document.getElementById("blacklistModal");
  if (!modal) return;

  modal.classList.add("hidden");
  modal.classList.remove("show");
};

window.unblockUserFromList = async function(userId) {
  const result = await unblockUser(userId);

  if (!result) return;

  await openBlacklistModal();
};

window.openReportUserModal = function(userId) {
  let modal = document.getElementById("reportUserModal");

  if (!modal) {
    document.body.insertAdjacentHTML("beforeend", `
      <div class="modal hidden" id="reportUserModal">
        <div class="modal-overlay" onclick="closeReportUserModal()"></div>

        <div class="modal-content report-user-modal-content">
          <img src="/icons/cross.svg" class="modal-close-icon" onclick="closeReportUserModal()" alt="Закрыть">

          <h2 class="report-user-title">Пожаловаться на пользователя</h2>

          <input
            id="reportUserReason"
            class="edit-profile-input"
            placeholder="Причина жалобы"
          >

          <textarea
            id="reportUserDescription"
            class="edit-profile-textarea"
            placeholder="Описание (необязательно)"
          ></textarea>

          <button class="file-upload-btn" onclick="sendUserReport()">
            Отправить жалобу
          </button>
        </div>
      </div>
    `);

    modal = document.getElementById("reportUserModal");
  }

  modal.dataset.userId = userId;

  document.getElementById("reportUserReason").value = "";
  document.getElementById("reportUserDescription").value = "";

  modal.classList.remove("hidden");
  modal.classList.add("show");
};

window.closeReportUserModal = function() {
  const modal = document.getElementById("reportUserModal");
  if (!modal) return;

  modal.classList.add("hidden");
  modal.classList.remove("show");
};

window.sendUserReport = async function() {
  const modal = document.getElementById("reportUserModal");
  const userId = modal.dataset.userId;

  const reason = document.getElementById("reportUserReason").value.trim();
  const description = document.getElementById("reportUserDescription").value.trim();

  if (!reason) {
    showToast("Укажите причину жалобы");
    return;
  }

  const result = await reportUser(userId, reason, description);

  if (!result) return;

  showToast("Жалоба отправлена");
  closeReportUserModal();
};

window.openMyReportsModal = async function() {
  const reports = await getMyReports();

  let modal = document.getElementById("myReportsModal");

  if (!modal) {
    document.body.insertAdjacentHTML("beforeend", `
      <div class="modal hidden" id="myReportsModal">
        <div class="modal-overlay" onclick="closeMyReportsModal()"></div>

        <div class="modal-content my-reports-modal-content">
          <img src="/icons/cross.svg" class="modal-close-icon" onclick="closeMyReportsModal()" alt="Закрыть">

          <h2 class="my-reports-title">Мои жалобы</h2>

          <div class="my-reports-list" id="myReportsList"></div>
        </div>
      </div>
    `);

    modal = document.getElementById("myReportsModal");
  }

  const list = document.getElementById("myReportsList");

list.innerHTML = reports.length > 0
  ? reports.map(report => {
      const targetHtml = report.reportedUser
        ? `
          <div class="my-report-user">
            <img src="${
              report.reportedUser.avatarUrl
                ? `${report.reportedUser.avatarUrl}`
                : "/icons/blank_pfp.jpg"
            }">

            <div>
              <h4
                class="report-user-link"
                onclick="openUserProfile('${report.reportedUser.id}')"
              >
                ${report.reportedUser.username}
              </h4>

              <span>${new Date(report.createdAt).toLocaleDateString("ru-RU")}</span>
            </div>
          </div>
        `
        : `
          <div class="my-report-user">
            <div>
              <h4>
                ${
                  report.reportedPost
                    ? "Жалоба на пост"
                    : report.reportedProductAd
                      ? `Жалоба на объявление: ${report.reportedProductAd.title}`
                      : "Жалоба"
                }
              </h4>

              <span>${new Date(report.createdAt).toLocaleDateString("ru-RU")}</span>
            </div>
          </div>
        `;

      return `
        <div class="my-report-item">
          ${targetHtml}

          <div class="my-report-field">
            <span class="my-report-label">Причина жалобы:</span>

            <div class="my-report-reason">
              ${report.reason}
            </div>
          </div>

          <div class="my-report-field">
            <span class="my-report-label">Описание:</span>

            <div class="my-report-description">
              ${report.description || "Описание не указано"}
            </div>
          </div>

          <div class="my-report-field">
            <span class="my-report-label">Статус:</span>

            <div class="my-report-status">
              ${getReportStatusText(report.status)}
            </div>
          </div>
        </div>
      `;
    }).join("")
  : `<div class="section-placeholder">Вы пока не отправляли жалобы</div>`;

  modal.classList.remove("hidden");
  modal.classList.add("show");
};

window.closeMyReportsModal = function() {
  const modal = document.getElementById("myReportsModal");
  if (!modal) return;

  modal.classList.add("hidden");
  modal.classList.remove("show");
};
function getReportStatusText(status) {
  switch (status) {
    case 0:
      return "На рассмотрении";

    case 1:
      return "Рассмотрена";

    case 2:
      return "Отклонена";

    default:
      return "Неизвестно";
  }
}

window.openReportContentModal = function(type, id) {
  let modal = document.getElementById("reportContentModal");

  if (!modal) {
    document.body.insertAdjacentHTML("beforeend", `
      <div class="modal hidden" id="reportContentModal">
        <div class="modal-overlay" onclick="closeReportContentModal()"></div>

        <div class="modal-content report-user-modal-content">
          <img src="/icons/cross.svg" class="modal-close-icon" onclick="closeReportContentModal()" alt="Закрыть">

          <h2 class="report-user-title" id="reportContentTitle">Пожаловаться</h2>

          <input
            id="reportContentReason"
            class="edit-profile-input"
            placeholder="Причина жалобы"
          >

          <textarea
            id="reportContentDescription"
            class="edit-profile-textarea"
            placeholder="Описание (необязательно)"
          ></textarea>

          <button class="file-upload-btn" onclick="sendContentReport()">
            Отправить жалобу
          </button>
        </div>
      </div>
    `);

    modal = document.getElementById("reportContentModal");
  }

  modal.dataset.reportType = type;
  modal.dataset.reportId = id;

  document.getElementById("reportContentTitle").textContent =
    type === "post" ? "Пожаловаться на пост" : "Пожаловаться на объявление";

  document.getElementById("reportContentReason").value = "";
  document.getElementById("reportContentDescription").value = "";

  modal.classList.remove("hidden");
  modal.classList.add("show");
};

window.closeReportContentModal = function() {
  const modal = document.getElementById("reportContentModal");
  if (!modal) return;

  modal.classList.add("hidden");
  modal.classList.remove("show");
};

window.sendContentReport = async function() {
  const modal = document.getElementById("reportContentModal");
  const type = modal.dataset.reportType;
  const id = modal.dataset.reportId;

  const reason = document.getElementById("reportContentReason").value.trim();
  const description = document.getElementById("reportContentDescription").value.trim();

  if (!reason) {
    showToast("Укажите причину жалобы");
    return;
  }

  const result = type === "post"
    ? await reportPost(id, reason, description)
    : await reportProductAd(id, reason, description);

  if (!result) return;

  showToast("Жалоба отправлена");
  closeReportContentModal();
};

window.openUserRequestsModal = function() {
  let modal = document.getElementById("userRequestsModal");

  if (!modal) {
    document.body.insertAdjacentHTML("beforeend", `
      <div class="modal hidden" id="userRequestsModal">
        <div class="modal-overlay" onclick="closeUserRequestsModal()"></div>

        <div class="modal-content user-requests-modal-content">
          <img src="/icons/cross.svg"
               class="modal-close-icon"
               onclick="closeUserRequestsModal()"
               alt="Закрыть">

          <h2 class="user-requests-title">Создать заявку</h2>

          <select id="userRequestType" class="edit-profile-input">
            <option value="0">Добавление куклы</option>
            <option value="1">Добавление категории</option>
            <option value="2">Добавление бренда</option>
            <option value="3">Добавление серии</option>
            <option value="4">Добавление функционала</option>
            <option value="5">Сообщение об ошибке</option>
            <option value="6">Улучшение интерфейса</option>
            <option value="7">Другое</option>
          </select>

          <textarea
            id="userRequestDescription"
            class="edit-profile-textarea"
            placeholder="Опишите вашу заявку..."
          ></textarea>

          <label class="file-upload-btn" for="userRequestImages">
            Добавить изображения
          </label>

          <input
            type="file"
            id="userRequestImages"
            multiple
            accept="image/*"
            style="display:none;"
          >

          <button class="file-upload-btn" onclick="submitUserRequest()">
            Отправить
          </button>
        </div>
      </div>
    `);

    modal = document.getElementById("userRequestsModal");
  }

  document.getElementById("userRequestDescription").value = "";
  document.getElementById("userRequestImages").value = "";

  modal.classList.remove("hidden");
  modal.classList.add("show");
};

window.submitUserRequest = async function() {
  const type = Number(document.getElementById("userRequestType").value);

  const description =
    document.getElementById("userRequestDescription")
      .value
      .trim();

  if (!description) {
    showToast("Введите описание");
    return;
  }

  const formData = new FormData();

  formData.append("type", type);
  formData.append("description", description);

  const files =
    document.getElementById("userRequestImages").files;

  for (const file of files) {
    formData.append("images", file);
  }

  const result = await createUserRequest(formData);

  if (!result) return;

  showToast("Заявка отправлена");

  closeUserRequestsModal();

  await openUserRequestsModal();
};

window.closeUserRequestsModal = function() {
  const modal = document.getElementById("userRequestsModal");

  if (!modal) return;

  modal.classList.add("hidden");
  modal.classList.remove("show");
};

function getUserRequestTypeText(type) {
  switch (type) {
    case 0:
      return "Добавление куклы";

    case 1:
      return "Добавление категории";

    case 2:
      return "Добавление бренда";

    case 3:
      return "Добавление серии";

    case 4:
      return "Добавление функционала";

    case 5:
      return "Сообщение об ошибке";

    case 6:
      return "Улучшение интерфейса";

    case 7:
      return "Другое";

    default:
      return "Неизвестно";
  }
}

function getUserRequestStatusText(status) {
  switch (status) {
    case 0:
      return "На рассмотрении";

    case 1:
      return "Одобрено";

    case 2:
      return "Отклонено";

    case 3:
      return "В процессе";

    case 4:
      return "Завершено";

    default:
      return "Неизвестно";
  }
}

window.openMyUserRequestsModal = async function() {
  const requests = await getMyUserRequests();

  let modal = document.getElementById("myUserRequestsModal");

  if (!modal) {
    document.body.insertAdjacentHTML("beforeend", `
      <div class="modal hidden" id="myUserRequestsModal">
        <div class="modal-overlay" onclick="closeMyUserRequestsModal()"></div>

        <div class="modal-content user-requests-modal-content">
          <img
            src="/icons/cross.svg"
            class="modal-close-icon"
            onclick="closeMyUserRequestsModal()"
            alt="Закрыть"
          >

          <h2 class="user-requests-title">
            Мои заявки
          </h2>

          <div
            class="user-requests-history"
            id="myUserRequestsHistory"
          ></div>

        </div>
      </div>
    `);

    modal = document.getElementById("myUserRequestsModal");
  }

  const history = document.getElementById("myUserRequestsHistory");

  history.innerHTML = requests.length > 0
    ? requests.map(request => `
      <div class="user-request-item">

        <div class="user-request-header">

          <h4>
            ${getUserRequestTypeText(request.type)}
          </h4>

          <span>
            ${getUserRequestStatusText(request.status)}
          </span>

        </div>

        <p class="user-request-description">
          ${request.description}
        </p>

        ${
          request.adminComment
            ? `
              <div class="user-request-admin-comment">
                <strong>Комментарий администратора:</strong>

                <p>${request.adminComment}</p>
              </div>
            `
            : ""
        }

      </div>
    `).join("")
    : `
      <div class="section-placeholder">
        У вас пока нет заявок
      </div>
    `;

  modal.classList.remove("hidden");
  modal.classList.add("show");
};

window.closeMyUserRequestsModal = function() {
  const modal = document.getElementById("myUserRequestsModal");

  if (!modal) return;

  modal.classList.add("hidden");
  modal.classList.remove("show");
};

function renderCommentThread(comment, postId) {
  const replies = comment.replies || [];
  const visibleReplies = replies.slice(0, 2);
  const hiddenReplies = replies.slice(2);

  return `
    <div class="comment-thread" id="commentThread-${comment.id}">

      ${renderCommentItem(comment, postId, false)}

      ${
        replies.length > 0
          ? `
            <div class="comment-replies" id="commentReplies-${comment.id}">
              ${visibleReplies.map(reply => renderCommentItem(reply, postId, true)).join("")}
            </div>
          `
          : ""
      }

      ${
        hiddenReplies.length > 0
          ? `
            <button
              class="comment-toggle-replies-btn"
              id="toggleRepliesBtn-${comment.id}"
              onclick="toggleCommentReplies('${comment.id}')"
            >
              Показать все ответы (${replies.length})
            </button>

            <div class="comment-hidden-replies hidden" id="hiddenReplies-${comment.id}">
              ${hiddenReplies.map(reply => renderCommentItem(reply, postId, true)).join("")}
            </div>
          `
          : ""
      }

    </div>
  `;
}

function renderCommentItem(comment, postId, isReply) {
  const avatar = comment.author?.avatarUrl
    ? `${comment.author.avatarUrl}`
    : "/icons/blank_pfp.jpg";

  return `
    <div
      class="comment-item ${isReply ? "comment-reply-item" : ""}"
      data-comment-id="${comment.id}"
      data-username="${comment.author?.username || ""}"
    >
      <img src="${avatar}" class="comment-avatar">

      <div class="comment-body">
        <div class="comment-top">
          <span
            class="comment-author"
            data-user-id="${comment.author?.id}"
          >
            ${comment.author?.username || "Пользователь"}
          </span>

          <span class="comment-date">
            ${formatCommentDate(comment.createdAt)}
          </span>
        </div>

        <div class="comment-text">
          ${formatMentions(comment.text)}
        </div>
      </div>
    </div>
  `;
}

window.toggleCommentReplies = function(commentId) {
  const hiddenReplies = document.getElementById(`hiddenReplies-${commentId}`);
  const btn = document.getElementById(`toggleRepliesBtn-${commentId}`);

  if (!hiddenReplies || !btn) return;

  const isHidden = hiddenReplies.classList.contains("hidden");

  if (isHidden) {
    hiddenReplies.classList.remove("hidden");
    btn.textContent = "Скрыть ответы";
  } else {
    hiddenReplies.classList.add("hidden");
    btn.textContent = "Показать все ответы";
  }
};


function formatMentions(text) {
  if (!text) return "";

  return text.replace(
    /@([a-zA-Z0-9_а-яА-ЯёЁ]+)/g,
    `<span class="comment-mention">@$1</span>`
  );
}

function formatCommentDate(dateString) {
  if (!dateString) return "";

  return new Date(dateString).toLocaleDateString("ru-RU");
}


function setupCommentReplyClicks() {
  document.querySelectorAll(".comment-item").forEach(item => {
    item.onclick = function(event) {
      const authorClick = event.target.closest(".comment-author");

      if (authorClick) {
        event.stopPropagation();

        const userId = authorClick.dataset.userId;
        if (userId) openUserProfile(userId);

        return;
      }

      const commentId = item.dataset.commentId;
      const username = item.dataset.username;

      replyingToCommentId = commentId;

      const input = document.getElementById("postModalCommentInput");

      if (!input) {
        console.log("postModalCommentInput не найден");
        return;
      }

      input.value = `@${username} `;
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    };
  });
}

window.addEventListener("popstate", (event) => {
  console.log("Popstate event:", event.state);

  const urlState = parseURLState();

  if (urlState.userId) {
    openUserProfile(urlState.userId, false);
  } else {
    switchToSection(urlState.section, false);
  }
});

// Преобразуем каждый фильтр в кастомный дропдаун
document.querySelectorAll('.filter-dropdown').forEach(dropdown => {
  const originalSelect = dropdown.querySelector('.filter-select');
  const originalArrow = dropdown.querySelector('.dropdown-arrow');
  
  // Скрываем оригинальную стрелку (но не удаляем)
  if (originalArrow) {
    originalArrow.style.display = 'none';
  }
  
  // Создаём кастомный триггер
  const trigger = document.createElement('div');
  trigger.className = 'custom-select-trigger';
  
  // Получаем текст выбранной опции
  const getSelectedText = () => {
    const selectedOption = originalSelect.options[originalSelect.selectedIndex];
    return selectedOption ? selectedOption.textContent : 'Выберите';
  };
  
  const selectedTextSpan = document.createElement('span');
  selectedTextSpan.textContent = getSelectedText();
  
  // Создаём НОВУЮ стрелку
  const newArrow = document.createElement('div');
  newArrow.className = 'dropdown-arrow';
  newArrow.innerHTML = '▼';
  newArrow.style.display = 'block';
  
  trigger.appendChild(selectedTextSpan);
  trigger.appendChild(newArrow);
  
  // Вставляем триггер перед select
  dropdown.insertBefore(trigger, originalSelect);
  
  // Создаём выпадающий список
  const dropdownList = document.createElement('div');
  dropdownList.className = 'custom-dropdown-list';
  
  // Заполняем опциями из select
  const updateDropdownList = () => {
    dropdownList.innerHTML = '';
    Array.from(originalSelect.options).forEach((option, index) => {
      const optionDiv = document.createElement('div');
      optionDiv.className = 'custom-dropdown-option';
      if (option.selected) optionDiv.classList.add('active');
      optionDiv.textContent = option.textContent;
      optionDiv.dataset.value = option.value;
      optionDiv.dataset.index = index;
      
      optionDiv.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Обновляем select
        originalSelect.selectedIndex = index;
        
        // Обновляем отображаемый текст
        selectedTextSpan.textContent = option.textContent;
        
        // Триггерим событие change
        originalSelect.dispatchEvent(new Event('change'));
        
        // Обновляем активные классы
        dropdownList.querySelectorAll('.custom-dropdown-option').forEach(opt => {
          opt.classList.remove('active');
        });
        optionDiv.classList.add('active');
        
        // Закрываем дропдаун
        dropdown.classList.remove('open');
      });
      
      dropdownList.appendChild(optionDiv);
    });
  };
  
  updateDropdownList();
  dropdown.appendChild(dropdownList);
  
  // Открытие/закрытие по клику на триггер
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    
    // Закрываем другие дропдауны
    document.querySelectorAll('.filter-dropdown.open').forEach(d => {
      if (d !== dropdown) d.classList.remove('open');
    });
    
    dropdown.classList.toggle('open');
    
    // Анимируем новую стрелку
    if (dropdown.classList.contains('open')) {
      newArrow.style.transform = 'rotate(180deg)';
    } else {
      newArrow.style.transform = 'rotate(0deg)';
    }
  });
  
  // Синхронизация при изменении select
  originalSelect.addEventListener('change', () => {
    selectedTextSpan.textContent = getSelectedText();
    updateDropdownList();
  });
  
  // Синхронизация при динамической загрузке опций
  const observer = new MutationObserver(() => {
    updateDropdownList();
    selectedTextSpan.textContent = getSelectedText();
  });
  
  observer.observe(originalSelect, { childList: true, subtree: true });
});

// Закрытие при клике вне дропдауна
document.addEventListener('click', (e) => {
  if (!e.target.closest('.filter-dropdown')) {
    document.querySelectorAll('.filter-dropdown.open').forEach(dropdown => {
      dropdown.classList.remove('open');
      // Возвращаем стрелку в исходное положение
      const arrow = dropdown.querySelector('.custom-select-trigger .dropdown-arrow');
      if (arrow) arrow.style.transform = 'rotate(0deg)';
    });
  }
});

function setupPostImageDropZone() {
  const dropZone = document.getElementById("imagePreviewContainer");
  const input = document.getElementById("postImageInput");
  const preview = document.getElementById("previewImage");
  const placeholder = document.getElementById("uploadPlaceholder");

  if (!dropZone || !input || !preview || !placeholder) return;

  dropZone.onclick = () => input.click();

  dropZone.ondragover = (event) => {
    event.preventDefault();
    dropZone.classList.add("drag-over");
  };

  dropZone.ondragleave = () => {
    dropZone.classList.remove("drag-over");
  };

  dropZone.ondrop = (event) => {
    event.preventDefault();
    dropZone.classList.remove("drag-over");

    const file = [...event.dataTransfer.files].find(file =>
      file.type.startsWith("image/")
    );

    if (!file) return;

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    input.files = dataTransfer.files;

    showPostImagePreview(file);
  };

  input.onchange = () => {
    const file = input.files[0];
    if (!file) return;

    showPostImagePreview(file);
  };
}

function showPostImagePreview(file) {
  const preview = document.getElementById("previewImage");
  const placeholder = document.getElementById("uploadPlaceholder");

  const reader = new FileReader();

  reader.onload = (event) => {
    preview.src = event.target.result;
    preview.style.display = "block";
    placeholder.style.display = "none";
  };

  reader.readAsDataURL(file);
}

function setupProductImageDropZone() {
  const dropZone = document.getElementById("productImagesBox");
  const input = document.getElementById("productImagesInput");

  if (!dropZone || !input) return;

  dropZone.onclick = () => input.click();

  dropZone.ondragover = (event) => {
    event.preventDefault();
    dropZone.classList.add("drag-over");
  };

  dropZone.ondragleave = () => {
    dropZone.classList.remove("drag-over");
  };

  dropZone.ondrop = (event) => {
    event.preventDefault();
    dropZone.classList.remove("drag-over");

    const files = [...event.dataTransfer.files]
      .filter(file => file.type.startsWith("image/"));

    if (files.length === 0) return;

    const dataTransfer = new DataTransfer();

    files.forEach(file => {
      dataTransfer.items.add(file);
    });

    input.files = dataTransfer.files;

    renderProductImagesPreview(files);
  };

  input.onchange = () => {
    renderProductImagesPreview([...input.files]);
  };
}

function renderProductImagesPreview(files) {
  const box = document.getElementById("productImagesBox");

  if (!box) return;

  box.innerHTML = "";

  files.forEach(file => {
    const reader = new FileReader();

    reader.onload = (event) => {
      box.insertAdjacentHTML(
        "beforeend",
        `
        <div class="product-preview-item">
          <img src="${event.target.result}">
        </div>
        `
      );
    };

    reader.readAsDataURL(file);
  });
}

function showToast(message, type = "success") {
  let container = document.getElementById("toastContainer");

  if (!container) {
    document.body.insertAdjacentHTML("beforeend", `
      <div id="toastContainer" class="toast-container"></div>
    `);

    container = document.getElementById("toastContainer");
  }

  const toast = document.createElement("div");
  toast.className = `custom-toast ${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("hide");

    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 2500);
}

function showConfirm(message, options = {}) {
  return new Promise(resolve => {
    const {
      title = "Подтверждение",
      confirmText = "Да",
      cancelText = "Отмена",
      danger = false
    } = options;

    const modal = document.createElement("div");
    modal.className = "confirm-modal";

    modal.innerHTML = `
      <div class="confirm-overlay"></div>

      <div class="confirm-box">
        <h2>${title}</h2>
        <p>${message}</p>

        <div class="confirm-actions">
          <button class="confirm-cancel">${cancelText}</button>
          <button class="confirm-ok ${danger ? "danger" : ""}">
            ${confirmText}
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const close = result => {
      modal.classList.add("hide");

      setTimeout(() => {
        modal.remove();
        resolve(result);
      }, 200);
    };

    modal.querySelector(".confirm-cancel").onclick = () => close(false);
    modal.querySelector(".confirm-overlay").onclick = () => close(false);
    modal.querySelector(".confirm-ok").onclick = () => close(true);
  });
}

initTheme();
updateNotificationsBadge();
createPostViewModal();
createEditPostModal();
loadUserAvatar();

const initialState = parseURLState();
currentProfileTab = initialState.tab || "posts";
if (initialState.category) shopFilters.categoryId = initialState.category;
if (initialState.priceFrom) shopFilters.priceFrom = initialState.priceFrom;
if (initialState.priceTo) shopFilters.priceTo = initialState.priceTo;
if (initialState.search) shopFilters.search = initialState.search;

if (initialState.userId) {
  openUserProfile(initialState.userId);
} else {
  switchToSection(initialState.section, false);
}
