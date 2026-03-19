import { artworkUrl, fetchEvolutionChain, fetchPokemon } from "./api.js";

/* ============================
   Favorites (localStorage)
   ============================ */
const FAV_KEY = "pokedex_favorites";

function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAV_KEY)) || [];
  } catch {
    return [];
  }
}

function saveFavorites(list) {
  localStorage.setItem(FAV_KEY, JSON.stringify(list));
}

export function toggleFavorite(id) {
  const favs = getFavorites();
  const idx = favs.indexOf(id);
  if (idx === -1) favs.push(id);
  else favs.splice(idx, 1);
  saveFavorites(favs);
  return favs.includes(id);
}

export function isFavorite(id) {
  return getFavorites().includes(id);
}

export function getFavoriteIds() {
  return getFavorites();
}

/* ============================
   Type color helpers
   ============================ */
const TYPE_COLORS = {
  normal: "#a8a878",
  fire: "#f08030",
  water: "#6890f0",
  electric: "#f8d030",
  grass: "#78c850",
  ice: "#98d8d8",
  fighting: "#c03028",
  poison: "#a040a0",
  ground: "#e0c068",
  flying: "#a890f0",
  psychic: "#f85888",
  bug: "#a8b820",
  rock: "#b8a038",
  ghost: "#705898",
  dragon: "#7038f8",
  dark: "#705848",
  steel: "#b8b8d0",
  fairy: "#ee99ac",
};

function typeColor(typeName) {
  return TYPE_COLORS[typeName] || "#888";
}

/* ============================
   Stat bar color
   ============================ */
function statColor(value) {
  if (value >= 120) return "#22c55e";
  if (value >= 80) return "#84cc16";
  if (value >= 50) return "#eab308";
  return "#ef4444";
}

const STAT_SHORT = {
  hp: "HP",
  attack: "ATK",
  defense: "DEF",
  "special-attack": "SPA",
  "special-defense": "SPD",
  speed: "SPE",
};

/* ============================
   Render Pokémon card
   ============================ */
export function renderCard(pokemon) {
  const primaryType = pokemon.types[0].type.name;
  const card = document.createElement("div");
  card.className = `poke-card type-${primaryType}`;
  card.dataset.id = pokemon.id;

  const fav = isFavorite(pokemon.id);
  card.innerHTML = `
    <button class="fav-btn ${fav ? "active" : ""}" data-fav-id="${pokemon.id}" title="Toggle favorite">
      ${fav ? "❤️" : "🤍"}
    </button>
    <div class="poke-card-img-wrap">
      <img src="${artworkUrl(pokemon.id)}"
           alt="${pokemon.name}" loading="lazy" />
    </div>
    <div class="poke-card-info">
      <span class="poke-card-id">#${String(pokemon.id).padStart(3, "0")}</span>
      <p class="poke-card-name">${pokemon.name}</p>
      <div class="poke-card-types">
        ${pokemon.types
          .map(
            (t) =>
              `<span class="type-badge" style="background:${typeColor(t.type.name)}">${t.type.name}</span>`,
          )
          .join("")}
      </div>
    </div>
  `;
  return card;
}

/* ============================
   Skeleton cards (loading)
   ============================ */
export function renderSkeletons(count = 20) {
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    el.className = "skeleton-card";
    el.innerHTML = `
      <div class="skeleton-img"></div>
      <div class="skeleton-info">
        <div class="skeleton-line short"></div>
        <div class="skeleton-line medium"></div>
        <div class="skeleton-line tags"></div>
      </div>
    `;
    frag.appendChild(el);
  }
  return frag;
}

export function clearSkeletons() {
  document.querySelectorAll(".skeleton-card").forEach((el) => el.remove());
}

/* ============================
   Detail Modal
   ============================ */
export async function renderDetailModal(pokemonId) {
  const modal = document.getElementById("detail-modal");
  const body = document.getElementById("modal-body");
  body.innerHTML =
    '<div style="display:flex;justify-content:center;padding:3rem"><div class="spinner"></div></div>';
  modal.classList.remove("hidden");

  const pokemon = await fetchPokemon(pokemonId);
  const primaryType = pokemon.types[0].type.name;

  let evoHTML =
    '<p style="color:var(--text-muted)">Loading evolution data...</p>';

  body.innerHTML = `
    <div class="detail-header" style="background: linear-gradient(135deg, ${typeColor(primaryType)}, rgba(255,255,255,0.15))">
      <img class="detail-header-img" src="${artworkUrl(pokemon.id)}" alt="${pokemon.name}" />
      <div class="detail-header-info">
        <span class="poke-card-id">#${String(pokemon.id).padStart(3, "0")}</span>
        <h2>${pokemon.name}</h2>
        <div class="poke-card-types">
          ${pokemon.types
            .map(
              (t) =>
                `<span class="type-badge" style="background:${typeColor(t.type.name)}">${t.type.name}</span>`,
            )
            .join("")}
        </div>
      </div>
    </div>

    <div class="detail-section">
      <h3>Physical</h3>
      <div class="detail-physical">
        <span>Height: <strong>${(pokemon.height / 10).toFixed(1)} m</strong></span>
        <span>Weight: <strong>${(pokemon.weight / 10).toFixed(1)} kg</strong></span>
      </div>
    </div>

    <div class="detail-section">
      <h3>Base Stats</h3>
      ${pokemon.stats
        .map((s) => {
          const val = s.base_stat;
          const pct = Math.min((val / 255) * 100, 100);
          return `
          <div class="stat-row">
            <span class="stat-label">${STAT_SHORT[s.stat.name] || s.stat.name}</span>
            <div class="stat-bar-container">
              <div class="stat-bar" style="width:${pct}%;background:${statColor(val)}"></div>
            </div>
            <span class="stat-value">${val}</span>
          </div>`;
        })
        .join("")}
    </div>

    <div class="detail-section">
      <h3>Abilities</h3>
      <ul class="ability-list">
        ${pokemon.abilities
          .map(
            (a) =>
              `<li class="${a.is_hidden ? "hidden-ability" : ""}">${a.ability.name.replace("-", " ")}${a.is_hidden ? " (hidden)" : ""}</li>`,
          )
          .join("")}
      </ul>
    </div>

    <div class="detail-section" id="evo-section">
      <h3>Evolution Chain</h3>
      <div id="evo-chain-content">${evoHTML}</div>
    </div>
  `;

  // Load evolution chain async
  try {
    const stages = await fetchEvolutionChain(pokemon.id);
    const evoContainer = document.getElementById("evo-chain-content");
    if (evoContainer) {
      evoContainer.innerHTML = `
        <div class="evo-chain">
          ${stages
            .map(
              (s, i) => `
            ${i > 0 ? '<span class="evo-arrow">→</span>' : ""}
            <div class="evo-stage ${s.id === pokemon.id ? "current" : ""}" data-id="${s.id}">
              <img src="${s.spriteUrl}" alt="${s.name}" loading="lazy" />
              <span>${s.name}</span>
            </div>
          `,
            )
            .join("")}
        </div>
      `;
    }
  } catch {
    const evoContainer = document.getElementById("evo-chain-content");
    if (evoContainer)
      evoContainer.innerHTML =
        '<p style="color:var(--text-muted)">Evolution data unavailable.</p>';
  }
}

/* ============================
   Compare View
   ============================ */
export function renderCompareResult(p1, p2) {
  const body = document.getElementById("compare-body");
  if (!p1 || !p2) {
    body.innerHTML =
      '<p style="text-align:center;color:var(--text-muted);width:100%">Select two Pokémon to compare.</p>';
    return;
  }

  function renderSide(p) {
    return `
      <div class="compare-poke">
        <img src="${artworkUrl(p.id)}" alt="${p.name}" />
        <h3>${p.name}</h3>
        <div class="poke-card-types" style="justify-content:center;margin-bottom:0.75rem">
          ${p.types
            .map(
              (t) =>
                `<span class="type-badge" style="background:${typeColor(t.type.name)}">${t.type.name}</span>`,
            )
            .join("")}
        </div>
        ${p.stats
          .map((s) => {
            const val = s.base_stat;
            const pct = Math.min((val / 255) * 100, 100);
            const otherPoke = p === p1 ? p2 : p1;
            const otherStat = otherPoke.stats.find(
              (os) => os.stat.name === s.stat.name,
            );
            const isWinner = otherStat && val > otherStat.base_stat;
            return `
            <div class="compare-stat-row">
              <span class="compare-stat-label">${STAT_SHORT[s.stat.name] || s.stat.name}</span>
              <div class="compare-stat-bar-container">
                <div class="compare-stat-bar" style="width:${pct}%;background:${statColor(val)}"></div>
              </div>
              <span class="compare-stat-value ${isWinner ? "compare-winner" : ""}">${val}</span>
            </div>`;
          })
          .join("")}
      </div>
    `;
  }

  body.innerHTML = renderSide(p1) + renderSide(p2);
}

/* ============================
   Populate type filter dropdown
   ============================ */
export function populateTypeFilter(types) {
  const select = document.getElementById("type-filter");
  types.forEach((t) => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t.charAt(0).toUpperCase() + t.slice(1);
    select.appendChild(opt);
  });
}

/* ============================
   Populate compare selects
   ============================ */
export function populateCompareSelects(allPokemon) {
  const s1 = document.getElementById("compare-select-1");
  const s2 = document.getElementById("compare-select-2");
  [s1, s2].forEach((sel) => {
    // keep the first "Select Pokémon" option
    while (sel.options.length > 1) sel.remove(1);
    allPokemon
      .slice()
      .sort((a, b) => a.id - b.id)
      .forEach((p) => {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = `#${String(p.id).padStart(3, "0")} ${p.name}`;
        sel.appendChild(opt);
      });
  });
}
