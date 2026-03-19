import {
  fetchPokemonPage,
  fetchAllTypes,
  fetchPokemon,
  MAX_POKEMON,
} from "./api.js";
import {
  renderCard,
  renderSkeletons,
  clearSkeletons,
  renderDetailModal,
  renderCompareResult,
  populateTypeFilter,
  populateCompareSelects,
  toggleFavorite,
  isFavorite,
  getFavoriteIds,
} from "./ui.js";

/* ============================
   State
   ============================ */
const state = {
  allLoaded: [], // every pokémon fetched so far
  offset: 0,
  limit: 20,
  hasMore: true,
  loading: false,
  searchQuery: "",
  typeFilter: "",
  showFavoritesOnly: false,
};

/* ============================
   DOM refs
   ============================ */
const gallery = document.getElementById("gallery");
const sentinel = document.getElementById("scroll-sentinel");
const searchInput = document.getElementById("search-input");
const typeFilterEl = document.getElementById("type-filter");
const themeToggle = document.getElementById("theme-toggle");
const favoritesBtn = document.getElementById("favorites-btn");
const favoritesCountEl = document.getElementById("favorites-count");
const compareBtn = document.getElementById("compare-btn");
const detailModal = document.getElementById("detail-modal");
const compareModal = document.getElementById("compare-modal");
const activeFiltersEl = document.getElementById("active-filters");

function updateFavoritesUi() {
  const favoritesCount = getFavoriteIds().length;
  favoritesCountEl.textContent = String(favoritesCount);
  favoritesBtn.classList.toggle("is-active", state.showFavoritesOnly);
  favoritesBtn.style.outline = state.showFavoritesOnly ? "2px solid white" : "";
}

/* ============================
   Filter & Render
   ============================ */
function getFilteredPokemon() {
  return state.allLoaded.filter((p) => {
    const matchesSearch = p.name.includes(state.searchQuery.toLowerCase());
    const matchesType =
      !state.typeFilter ||
      p.types.some((t) => t.type.name === state.typeFilter);
    const matchesFav = !state.showFavoritesOnly || isFavorite(p.id);
    return matchesSearch && matchesType && matchesFav;
  });
}

function hasActiveFilters() {
  return Boolean(
    state.searchQuery || state.typeFilter || state.showFavoritesOnly,
  );
}

function needsFullDatasetForFilters() {
  return Boolean(state.searchQuery || state.typeFilter);
}

function updateSentinelVisibility() {
  sentinel.classList.toggle("hidden", !state.hasMore || hasActiveFilters());
}

function renderGallery() {
  gallery.innerHTML = "";
  const filtered = getFilteredPokemon();
  if (filtered.length === 0 && !state.loading) {
    gallery.innerHTML = '<div class="gallery-empty">No Pokémon found.</div>';
    return;
  }
  const frag = document.createDocumentFragment();
  filtered.forEach((p) => frag.appendChild(renderCard(p)));
  gallery.appendChild(frag);
}

async function refreshGalleryAfterFilters() {
  renderActiveFilters();
  renderGallery();
  updateSentinelVisibility();

  if (needsFullDatasetForFilters() && state.hasMore) {
    while (state.hasMore) {
      await loadMore({ skipRender: true });
    }
  }

  renderGallery();
  updateSentinelVisibility();
}

function renderActiveFilters() {
  activeFiltersEl.innerHTML = "";
  if (state.typeFilter) {
    activeFiltersEl.innerHTML += `
      <span class="filter-tag">
        Type: ${state.typeFilter}
        <button data-clear="type">&times;</button>
      </span>`;
  }
  if (state.showFavoritesOnly) {
    activeFiltersEl.innerHTML += `
      <span class="filter-tag">
        Favorites only
        <button data-clear="favorites">&times;</button>
      </span>`;
  }
}

/* ============================
   Load more Pokémon
   ============================ */
async function loadMore({ skipRender = false } = {}) {
  if (state.loading || !state.hasMore) return;
  state.loading = true;

  // show skeletons only on initial load
  if (state.allLoaded.length === 0) {
    gallery.appendChild(renderSkeletons(state.limit));
  }

  try {
    const { results, hasMore } = await fetchPokemonPage(
      state.offset,
      state.limit,
      MAX_POKEMON,
    );
    state.allLoaded.push(...results);
    state.offset += results.length;
    state.hasMore = hasMore;
    populateCompareSelects(state.allLoaded);
  } catch (err) {
    console.error("Failed to load Pokémon:", err);
  } finally {
    state.loading = false;
    clearSkeletons();
    if (!skipRender) {
      renderGallery();
    }
    updateSentinelVisibility();
  }
}

/* ============================
   Infinite Scroll (IntersectionObserver)
   ============================ */
const observer = new IntersectionObserver(
  (entries) => {
    if (entries[0].isIntersecting) loadMore();
  },
  { rootMargin: "200px" },
);

observer.observe(sentinel);

/* ============================
   Event Listeners
   ============================ */

// Live search
searchInput.addEventListener("input", async () => {
  state.searchQuery = searchInput.value.trim();
  await refreshGalleryAfterFilters();
});

// Type filter
typeFilterEl.addEventListener("change", async () => {
  state.typeFilter = typeFilterEl.value;
  await refreshGalleryAfterFilters();
});

// Active filter tag clear
activeFiltersEl.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-clear]");
  if (!btn) return;
  const key = btn.dataset.clear;
  if (key === "type") {
    state.typeFilter = "";
    typeFilterEl.value = "";
  } else if (key === "favorites") {
    state.showFavoritesOnly = false;
    updateFavoritesUi();
  }
  await refreshGalleryAfterFilters();
});

// Click on a card (event delegation)
gallery.addEventListener("click", (e) => {
  // Favorite button
  const favBtn = e.target.closest(".fav-btn");
  if (favBtn) {
    e.stopPropagation();
    const id = Number(favBtn.dataset.favId);
    const nowFav = toggleFavorite(id);
    favBtn.classList.toggle("active", nowFav);
    favBtn.textContent = nowFav ? "❤️" : "🤍";
    updateFavoritesUi();
    if (state.showFavoritesOnly) {
      renderGallery();
    }
    return;
  }

  // Card click → detail modal
  const card = e.target.closest(".poke-card");
  if (card) renderDetailModal(Number(card.dataset.id));
});

// Evolution stage click inside detail modal
document.getElementById("modal-body").addEventListener("click", (e) => {
  const stage = e.target.closest(".evo-stage");
  if (stage) renderDetailModal(Number(stage.dataset.id));
});

// Close detail modal
document
  .getElementById("modal-close")
  .addEventListener("click", () => detailModal.classList.add("hidden"));
detailModal
  .querySelector(".modal-backdrop")
  .addEventListener("click", () => detailModal.classList.add("hidden"));

// Theme toggle
themeToggle.addEventListener("click", () => {
  const html = document.documentElement;
  const isDark = html.dataset.theme === "dark";
  html.dataset.theme = isDark ? "light" : "dark";
  themeToggle.textContent = isDark ? "🌙" : "☀️";
  localStorage.setItem("pokedex_theme", html.dataset.theme);
});

// Restore theme
const savedTheme = localStorage.getItem("pokedex_theme");
if (savedTheme) {
  document.documentElement.dataset.theme = savedTheme;
  themeToggle.textContent = savedTheme === "dark" ? "☀️" : "🌙";
}

// Favorites toggle
favoritesBtn.addEventListener("click", async () => {
  state.showFavoritesOnly = !state.showFavoritesOnly;
  updateFavoritesUi();
  await refreshGalleryAfterFilters();
});

// Compare modal
compareBtn.addEventListener("click", () => {
  compareModal.classList.remove("hidden");
  renderCompareResult(null, null);
});
document
  .getElementById("compare-modal-close")
  .addEventListener("click", () => compareModal.classList.add("hidden"));
compareModal
  .querySelector(".modal-backdrop")
  .addEventListener("click", () => compareModal.classList.add("hidden"));

// Compare selectors
async function handleCompareChange() {
  const id1 = document.getElementById("compare-select-1").value;
  const id2 = document.getElementById("compare-select-2").value;
  if (!id1 || !id2) {
    renderCompareResult(null, null);
    return;
  }
  try {
    const [p1, p2] = await Promise.all([fetchPokemon(id1), fetchPokemon(id2)]);
    renderCompareResult(p1, p2);
  } catch (err) {
    console.error("Compare fetch error:", err);
  }
}

document
  .getElementById("compare-select-1")
  .addEventListener("change", handleCompareChange);
document
  .getElementById("compare-select-2")
  .addEventListener("change", handleCompareChange);

// Close modals on Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    detailModal.classList.add("hidden");
    compareModal.classList.add("hidden");
  }
});

/* ============================
   Init
   ============================ */
async function init() {
  updateFavoritesUi();
  try {
    const types = await fetchAllTypes();
    populateTypeFilter(types);
  } catch (err) {
    console.error("Failed to load types:", err);
  }
  loadMore();
}

init();
