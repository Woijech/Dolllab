const API_URL = "";

// ===== Проверка авторизации =====
const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "login.html";
}

// ===== Загрузка кукол =====
async function loadDolls(filters = {}) {
  try {
    const params = new URLSearchParams();

    if (filters.search) params.append("Search", filters.search);
    if (filters.brand) params.append("Brand", filters.brand);
    if (filters.series) params.append("Series", filters.series);
    if (filters.releaseYear) params.append("ReleaseYear", filters.releaseYear);

    const response = await fetch(
      `${API_URL}/api/dolls?${params.toString()}`,
      {
        headers: {
          "Authorization": "Bearer " + token
        }
      }
    );

    if (!response.ok) {
      console.error("Ошибка загрузки куклопедии");
      return;
    }

    const dolls = await response.json();
    renderDolls(dolls);

  } catch (error) {
    console.error(error);
  }
}

// ===== Отрисовка карточек =====
function renderDolls(dolls) {
  const grid = document.getElementById("dollsGrid");
  if (!grid) return;

  grid.innerHTML = "";

  if (!dolls || dolls.length === 0) {
    grid.innerHTML = `<div class="section-placeholder" style="grid-column:1/-1;">😢 Ничего не найдено... Попробуйте другой запрос 🎀</div>`;
    return;
  }

  grid.innerHTML = dolls.map(doll => {
    const imageSrc = doll.imageUrl ? `${API_URL}${doll.imageUrl}` : "https://via.placeholder.com/300x300/FFE4F0/FF67A6?text=Кукла";
    const escapedName = escapeHtml(doll.name);
    const escapedSeries = escapeHtml(doll.series ?? "");
    return `
      <div class="doll-card" data-id="${doll.id}">
        <img class="doll-image" src="${imageSrc}" alt="${escapedName}">
        <div class="doll-info">
          <div class="doll-name">${escapedName}</div>
          <div class="doll-series">${escapedSeries}</div>
        </div>
      </div>
    `;
  }).join('');

  document.querySelectorAll('.doll-card').forEach(card => {
    card.addEventListener('click', async () => {
      const dollId = card.getAttribute('data-id');
      try {
        const response = await fetch(`${API_URL}/api/dolls/${dollId}`, {
          headers: { "Authorization": "Bearer " + token }
        });
        if (!response.ok) throw new Error();
        const doll = await response.json();
        openDollModal(doll);
      } catch (err) {
        console.error("Не удалось загрузить детали куклы");
      }
    });
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m] || m));
}

// ===== Модальное окно куклы =====
function openDollModal(doll) {
  document.getElementById("modalImage").src = doll.imageUrl ? `${API_URL}${doll.imageUrl}` : "https://via.placeholder.com/400x400/FFE4F0/FF67A6?text=Кукла";
  document.getElementById("modalName").textContent = doll.name;
  document.getElementById("modalBrand").textContent = doll.brand ?? "—";
  document.getElementById("modalSeries").textContent = doll.series ?? "—";
  document.getElementById("modalYear").textContent = doll.releaseYear ?? "—";
  document.getElementById("modalDescription").textContent = doll.description ?? "Описание отсутствует";

  document.getElementById("dollModal").classList.remove("hidden");
  document.getElementById("dollModal").classList.add("show");
}

function closeModal() {
  document.getElementById("dollModal").classList.add("hidden");
  document.getElementById("dollModal").classList.remove("show");
}

// ===== Загрузка фильтров =====
async function loadBrands() {
  try {
    const response = await fetch(`${API_URL}/api/dolls/brands`, {
      headers: { "Authorization": "Bearer " + token }
    });
    if (!response.ok) return;
    const brands = await response.json();
    const select = document.getElementById("brandFilter");
    brands.forEach(brand => {
      const option = document.createElement("option");
      option.value = brand;
      option.textContent = brand;
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Ошибка загрузки брендов", error);
  }
}

async function loadYears() {
  try {
    const response = await fetch(`${API_URL}/api/dolls/years`, {
      headers: { "Authorization": "Bearer " + token }
    });
    if (!response.ok) return;
    const years = await response.json();
    const select = document.getElementById("yearFilter");
    years.forEach(year => {
      const option = document.createElement("option");
      option.value = year;
      option.textContent = year;
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Ошибка загрузки годов", error);
  }
}

// ===== Инициализация после загрузки DOM =====
document.addEventListener("DOMContentLoaded", () => {
  loadDolls();
  loadBrands();
  loadYears();
});