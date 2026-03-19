const BASE_URL = "https://pokeapi.co/api/v2";
export const MAX_POKEMON = 151;

const cache = new Map();

async function fetchJSON(url) {
  if (cache.has(url)) return cache.get(url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const data = await res.json();
  cache.set(url, data);
  return data;
}

/**
 * Fetch a page of Pokémon with full details.
 * Returns { results: [...pokemonData], hasMore: boolean }
 */
export async function fetchPokemonPage(
  offset = 0,
  limit = 20,
  maxTotal = MAX_POKEMON,
) {
  const remaining = Math.max(maxTotal - offset, 0);
  if (remaining === 0) {
    return {
      results: [],
      hasMore: false,
    };
  }

  const pageLimit = Math.min(limit, remaining);
  const list = await fetchJSON(
    `${BASE_URL}/pokemon?offset=${offset}&limit=${pageLimit}`,
  );
  const details = await Promise.all(list.results.map((p) => fetchJSON(p.url)));
  return {
    results: details,
    hasMore: offset + details.length < maxTotal && list.next !== null,
  };
}

/** Fetch a single Pokémon by ID or name. */
export async function fetchPokemon(idOrName) {
  return fetchJSON(`${BASE_URL}/pokemon/${idOrName}`);
}

/** Fetch Pokémon species data (needed for evolution chain URL). */
export async function fetchSpecies(idOrName) {
  return fetchJSON(`${BASE_URL}/pokemon-species/${idOrName}`);
}

/** Fetch and parse the evolution chain for a given species ID. */
export async function fetchEvolutionChain(speciesId) {
  const species = await fetchSpecies(speciesId);
  const chainData = await fetchJSON(species.evolution_chain.url);
  return parseChain(chainData.chain);
}

/**
 * Walk the chain recursively and return a flat array:
 * [{ name, id, spriteUrl }, ...]
 */
function parseChain(node) {
  const stages = [];

  function walk(n) {
    const id = extractIdFromUrl(n.species.url);
    stages.push({
      name: n.species.name,
      id,
      spriteUrl: artworkUrl(id),
    });
    n.evolves_to.forEach(walk);
  }

  walk(node);
  return stages;
}

/** Get all Pokémon type names (for the filter dropdown). */
export async function fetchAllTypes() {
  const data = await fetchJSON(`${BASE_URL}/type`);
  // Filter out "unknown" and "shadow" types
  return data.results
    .map((t) => t.name)
    .filter((name) => name !== "unknown" && name !== "shadow")
    .sort();
}

/** Extract the numeric ID from a PokéAPI resource URL. */
function extractIdFromUrl(url) {
  const parts = url.replace(/\/$/, "").split("/");
  return parseInt(parts[parts.length - 1], 10);
}

/** Get the official artwork URL for a given Pokémon ID. */
export function artworkUrl(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}
