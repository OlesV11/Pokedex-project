(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=`https://pokeapi.co/api/v2`,t=new Map;async function n(e){if(t.has(e))return t.get(e);let n=await fetch(e);if(!n.ok)throw Error(`HTTP ${n.status} for ${e}`);let r=await n.json();return t.set(e,r),r}async function r(t=0,r=20,i=151){let a=Math.max(i-t,0);if(a===0)return{results:[],hasMore:!1};let o=await n(`${e}/pokemon?offset=${t}&limit=${Math.min(r,a)}`),s=await Promise.all(o.results.map(e=>n(e.url)));return{results:s,hasMore:t+s.length<i&&o.next!==null}}async function i(t){return n(`${e}/pokemon/${t}`)}async function a(t){return n(`${e}/pokemon-species/${t}`)}async function o(e){return s((await n((await a(e)).evolution_chain.url)).chain)}function s(e){let t=[];function n(e){let r=l(e.species.url);t.push({name:e.species.name,id:r,spriteUrl:u(r)}),e.evolves_to.forEach(n)}return n(e),t}async function c(){return(await n(`${e}/type`)).results.map(e=>e.name).filter(e=>e!==`unknown`&&e!==`shadow`).sort()}function l(e){let t=e.replace(/\/$/,``).split(`/`);return parseInt(t[t.length-1],10)}function u(e){return`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${e}.png`}var d=`pokedex_favorites`;function f(){try{return JSON.parse(localStorage.getItem(d))||[]}catch{return[]}}function p(e){localStorage.setItem(d,JSON.stringify(e))}function m(e){let t=f(),n=t.indexOf(e);return n===-1?t.push(e):t.splice(n,1),p(t),t.includes(e)}function h(e){return f().includes(e)}function g(){return f()}var _={normal:`#a8a878`,fire:`#f08030`,water:`#6890f0`,electric:`#f8d030`,grass:`#78c850`,ice:`#98d8d8`,fighting:`#c03028`,poison:`#a040a0`,ground:`#e0c068`,flying:`#a890f0`,psychic:`#f85888`,bug:`#a8b820`,rock:`#b8a038`,ghost:`#705898`,dragon:`#7038f8`,dark:`#705848`,steel:`#b8b8d0`,fairy:`#ee99ac`};function v(e){return _[e]||`#888`}function y(e){return e>=120?`#22c55e`:e>=80?`#84cc16`:e>=50?`#eab308`:`#ef4444`}var b={hp:`HP`,attack:`ATK`,defense:`DEF`,"special-attack":`SPA`,"special-defense":`SPD`,speed:`SPE`};function x(e){let t=e.types[0].type.name,n=document.createElement(`div`);n.className=`poke-card type-${t}`,n.dataset.id=e.id;let r=h(e.id);return n.innerHTML=`
    <button class="fav-btn ${r?`active`:``}" data-fav-id="${e.id}" title="Toggle favorite">
      ${r?`❤️`:`🤍`}
    </button>
    <div class="poke-card-img-wrap">
      <img src="${u(e.id)}"
           alt="${e.name}" loading="lazy" />
    </div>
    <div class="poke-card-info">
      <span class="poke-card-id">#${String(e.id).padStart(3,`0`)}</span>
      <p class="poke-card-name">${e.name}</p>
      <div class="poke-card-types">
        ${e.types.map(e=>`<span class="type-badge" style="background:${v(e.type.name)}">${e.type.name}</span>`).join(``)}
      </div>
    </div>
  `,n}function S(e=20){let t=document.createDocumentFragment();for(let n=0;n<e;n++){let e=document.createElement(`div`);e.className=`skeleton-card`,e.innerHTML=`
      <div class="skeleton-img"></div>
      <div class="skeleton-info">
        <div class="skeleton-line short"></div>
        <div class="skeleton-line medium"></div>
        <div class="skeleton-line tags"></div>
      </div>
    `,t.appendChild(e)}return t}function C(){document.querySelectorAll(`.skeleton-card`).forEach(e=>e.remove())}async function w(e){let t=document.getElementById(`detail-modal`),n=document.getElementById(`modal-body`);n.innerHTML=`<div style="display:flex;justify-content:center;padding:3rem"><div class="spinner"></div></div>`,t.classList.remove(`hidden`);let r=await i(e),a=r.types[0].type.name;n.innerHTML=`
    <div class="detail-header" style="background: linear-gradient(135deg, ${v(a)}, rgba(255,255,255,0.15))">
      <img class="detail-header-img" src="${u(r.id)}" alt="${r.name}" />
      <div class="detail-header-info">
        <span class="poke-card-id">#${String(r.id).padStart(3,`0`)}</span>
        <h2>${r.name}</h2>
        <div class="poke-card-types">
          ${r.types.map(e=>`<span class="type-badge" style="background:${v(e.type.name)}">${e.type.name}</span>`).join(``)}
        </div>
      </div>
    </div>

    <div class="detail-section">
      <h3>Physical</h3>
      <div class="detail-physical">
        <span>Height: <strong>${(r.height/10).toFixed(1)} m</strong></span>
        <span>Weight: <strong>${(r.weight/10).toFixed(1)} kg</strong></span>
      </div>
    </div>

    <div class="detail-section">
      <h3>Base Stats</h3>
      ${r.stats.map(e=>{let t=e.base_stat,n=Math.min(t/255*100,100);return`
          <div class="stat-row">
            <span class="stat-label">${b[e.stat.name]||e.stat.name}</span>
            <div class="stat-bar-container">
              <div class="stat-bar" style="width:${n}%;background:${y(t)}"></div>
            </div>
            <span class="stat-value">${t}</span>
          </div>`}).join(``)}
    </div>

    <div class="detail-section">
      <h3>Abilities</h3>
      <ul class="ability-list">
        ${r.abilities.map(e=>`<li class="${e.is_hidden?`hidden-ability`:``}">${e.ability.name.replace(`-`,` `)}${e.is_hidden?` (hidden)`:``}</li>`).join(``)}
      </ul>
    </div>

    <div class="detail-section" id="evo-section">
      <h3>Evolution Chain</h3>
      <div id="evo-chain-content"><p style="color:var(--text-muted)">Loading evolution data...</p></div>
    </div>
  `;try{let e=await o(r.id),t=document.getElementById(`evo-chain-content`);t&&(t.innerHTML=`
        <div class="evo-chain">
          ${e.map((e,t)=>`
            ${t>0?`<span class="evo-arrow">→</span>`:``}
            <div class="evo-stage ${e.id===r.id?`current`:``}" data-id="${e.id}">
              <img src="${e.spriteUrl}" alt="${e.name}" loading="lazy" />
              <span>${e.name}</span>
            </div>
          `).join(``)}
        </div>
      `)}catch{let e=document.getElementById(`evo-chain-content`);e&&(e.innerHTML=`<p style="color:var(--text-muted)">Evolution data unavailable.</p>`)}}function T(e,t){let n=document.getElementById(`compare-body`);if(!e||!t){n.innerHTML=`<p style="text-align:center;color:var(--text-muted);width:100%">Select two Pokémon to compare.</p>`;return}function r(n){return`
      <div class="compare-poke">
        <img src="${u(n.id)}" alt="${n.name}" />
        <h3>${n.name}</h3>
        <div class="poke-card-types" style="justify-content:center;margin-bottom:0.75rem">
          ${n.types.map(e=>`<span class="type-badge" style="background:${v(e.type.name)}">${e.type.name}</span>`).join(``)}
        </div>
        ${n.stats.map(r=>{let i=r.base_stat,a=Math.min(i/255*100,100),o=(n===e?t:e).stats.find(e=>e.stat.name===r.stat.name),s=o&&i>o.base_stat;return`
            <div class="compare-stat-row">
              <span class="compare-stat-label">${b[r.stat.name]||r.stat.name}</span>
              <div class="compare-stat-bar-container">
                <div class="compare-stat-bar" style="width:${a}%;background:${y(i)}"></div>
              </div>
              <span class="compare-stat-value ${s?`compare-winner`:``}">${i}</span>
            </div>`}).join(``)}
      </div>
    `}n.innerHTML=r(e)+r(t)}function E(e){let t=document.getElementById(`type-filter`);e.forEach(e=>{let n=document.createElement(`option`);n.value=e,n.textContent=e.charAt(0).toUpperCase()+e.slice(1),t.appendChild(n)})}function D(e){[document.getElementById(`compare-select-1`),document.getElementById(`compare-select-2`)].forEach(t=>{for(;t.options.length>1;)t.remove(1);e.slice().sort((e,t)=>e.id-t.id).forEach(e=>{let n=document.createElement(`option`);n.value=e.id,n.textContent=`#${String(e.id).padStart(3,`0`)} ${e.name}`,t.appendChild(n)})})}var O={allLoaded:[],offset:0,limit:20,hasMore:!0,loading:!1,searchQuery:``,typeFilter:``,showFavoritesOnly:!1},k=document.getElementById(`gallery`),A=document.getElementById(`scroll-sentinel`),j=document.getElementById(`search-input`),M=document.getElementById(`type-filter`),N=document.getElementById(`theme-toggle`),P=document.getElementById(`favorites-btn`),F=document.getElementById(`favorites-count`),I=document.getElementById(`compare-btn`),L=document.getElementById(`detail-modal`),R=document.getElementById(`compare-modal`),z=document.getElementById(`active-filters`);function B(){let e=g().length;F.textContent=String(e),P.classList.toggle(`is-active`,O.showFavoritesOnly),P.style.outline=O.showFavoritesOnly?`2px solid white`:``}function V(){return O.allLoaded.filter(e=>{let t=e.name.includes(O.searchQuery.toLowerCase()),n=!O.typeFilter||e.types.some(e=>e.type.name===O.typeFilter),r=!O.showFavoritesOnly||h(e.id);return t&&n&&r})}function H(){return!!(O.searchQuery||O.typeFilter||O.showFavoritesOnly)}function U(){return!!(O.searchQuery||O.typeFilter)}function W(){A.classList.toggle(`hidden`,!O.hasMore||H())}function G(){k.innerHTML=``;let e=V();if(e.length===0&&!O.loading){k.innerHTML=`<div class="gallery-empty">No Pokémon found.</div>`;return}let t=document.createDocumentFragment();e.forEach(e=>t.appendChild(x(e))),k.appendChild(t)}async function K(){if(q(),G(),W(),U()&&O.hasMore)for(;O.hasMore;)await J({skipRender:!0});G(),W()}function q(){z.innerHTML=``,O.typeFilter&&(z.innerHTML+=`
      <span class="filter-tag">
        Type: ${O.typeFilter}
        <button data-clear="type">&times;</button>
      </span>`),O.showFavoritesOnly&&(z.innerHTML+=`
      <span class="filter-tag">
        Favorites only
        <button data-clear="favorites">&times;</button>
      </span>`)}async function J({skipRender:e=!1}={}){if(!(O.loading||!O.hasMore)){O.loading=!0,O.allLoaded.length===0&&k.appendChild(S(O.limit));try{let{results:e,hasMore:t}=await r(O.offset,O.limit,151);O.allLoaded.push(...e),O.offset+=e.length,O.hasMore=t,D(O.allLoaded)}catch(e){console.error(`Failed to load Pokémon:`,e)}finally{O.loading=!1,C(),e||G(),W()}}}new IntersectionObserver(e=>{e[0].isIntersecting&&J()},{rootMargin:`200px`}).observe(A),j.addEventListener(`input`,async()=>{O.searchQuery=j.value.trim(),await K()}),M.addEventListener(`change`,async()=>{O.typeFilter=M.value,await K()}),z.addEventListener(`click`,async e=>{let t=e.target.closest(`[data-clear]`);if(!t)return;let n=t.dataset.clear;n===`type`?(O.typeFilter=``,M.value=``):n===`favorites`&&(O.showFavoritesOnly=!1,B()),await K()}),k.addEventListener(`click`,e=>{let t=e.target.closest(`.fav-btn`);if(t){e.stopPropagation();let n=m(Number(t.dataset.favId));t.classList.toggle(`active`,n),t.textContent=n?`❤️`:`🤍`,B(),O.showFavoritesOnly&&G();return}let n=e.target.closest(`.poke-card`);n&&w(Number(n.dataset.id))}),document.getElementById(`modal-body`).addEventListener(`click`,e=>{let t=e.target.closest(`.evo-stage`);t&&w(Number(t.dataset.id))}),document.getElementById(`modal-close`).addEventListener(`click`,()=>L.classList.add(`hidden`)),L.querySelector(`.modal-backdrop`).addEventListener(`click`,()=>L.classList.add(`hidden`)),N.addEventListener(`click`,()=>{let e=document.documentElement,t=e.dataset.theme===`dark`;e.dataset.theme=t?`light`:`dark`,N.textContent=t?`🌙`:`☀️`,localStorage.setItem(`pokedex_theme`,e.dataset.theme)});var Y=localStorage.getItem(`pokedex_theme`);Y&&(document.documentElement.dataset.theme=Y,N.textContent=Y===`dark`?`☀️`:`🌙`),P.addEventListener(`click`,async()=>{O.showFavoritesOnly=!O.showFavoritesOnly,B(),await K()}),I.addEventListener(`click`,()=>{R.classList.remove(`hidden`),T(null,null)}),document.getElementById(`compare-modal-close`).addEventListener(`click`,()=>R.classList.add(`hidden`)),R.querySelector(`.modal-backdrop`).addEventListener(`click`,()=>R.classList.add(`hidden`));async function X(){let e=document.getElementById(`compare-select-1`).value,t=document.getElementById(`compare-select-2`).value;if(!e||!t){T(null,null);return}try{let[n,r]=await Promise.all([i(e),i(t)]);T(n,r)}catch(e){console.error(`Compare fetch error:`,e)}}document.getElementById(`compare-select-1`).addEventListener(`change`,X),document.getElementById(`compare-select-2`).addEventListener(`change`,X),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&(L.classList.add(`hidden`),R.classList.add(`hidden`))});async function Z(){B();try{E(await c())}catch(e){console.error(`Failed to load types:`,e)}J()}Z();