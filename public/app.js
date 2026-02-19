const state = {
  q: "",
  category: "",
  sort: "name_asc",
  page: 1,
  pageSize: 20,
  totalPages: 1,
  total: 0,
};

const els = {
  form: document.getElementById("filters"),
  searchInput: document.getElementById("searchInput"),
  categorySelect: document.getElementById("categorySelect"),
  sortSelect: document.getElementById("sortSelect"),
  resetBtn: document.getElementById("resetBtn"),
  statTools: document.getElementById("statTools"),
  resultCount: document.getElementById("resultCount"),
  queryPerf: document.getElementById("queryPerf"),
  toolGrid: document.getElementById("toolGrid"),
  emptyState: document.getElementById("emptyState"),
  prevPage: document.getElementById("prevPage"),
  nextPage: document.getElementById("nextPage"),
  pageIndicator: document.getElementById("pageIndicator"),
  categoryChips: document.getElementById("categoryChips"),
};

let activeController = null;
let debounceTimer = null;

function truncate(text, maxLen) {
  if (!text) return "";
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen - 1)}...`;
}

function normalizeExternalUrl(input) {
  const raw = String(input || "").trim();
  if (!raw) return "#";
  try {
    const absolute = raw.startsWith("http://") || raw.startsWith("https://") ? raw : `https://${raw}`;
    const parsed = new URL(absolute);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      return parsed.toString();
    }
  } catch (_) {
    return "#";
  }
  return "#";
}

function logoUrl(domain, websiteUrl) {
  const source = String(domain || "").trim() || String(websiteUrl || "").trim();
  if (!source) return "";
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(source)}&sz=128`;
}

function createPill(text) {
  const span = document.createElement("span");
  span.className = "pill";
  span.textContent = text;
  return span;
}

function createToolLogo(item) {
  const wrapper = document.createElement("span");
  wrapper.className = "tool-logo";

  const source = logoUrl(item.domain, item.website_url);
  if (source) {
    const img = document.createElement("img");
    img.src = source;
    img.alt = `${item.name} logo`;
    img.loading = "lazy";
    img.decoding = "async";
    wrapper.appendChild(img);
    return wrapper;
  }

  const fallback = document.createElement("strong");
  fallback.textContent = String(item.name || "?").slice(0, 1).toUpperCase();
  wrapper.appendChild(fallback);
  return wrapper;
}

function readStateFromUrl() {
  const params = new URLSearchParams(window.location.search);
  state.q = (params.get("q") || "").trim();
  state.category = (params.get("category") || "").trim();
  state.sort = (params.get("sort") || "name_asc").trim();
  state.page = Math.max(1, Number(params.get("page") || "1"));
}

function syncUrlFromState() {
  const params = new URLSearchParams();
  if (state.q) params.set("q", state.q);
  if (state.category) params.set("category", state.category);
  if (state.sort && state.sort !== "name_asc") params.set("sort", state.sort);
  if (state.page > 1) params.set("page", String(state.page));
  const next = params.toString();
  const url = `${window.location.pathname}${next ? `?${next}` : ""}`;
  window.history.replaceState({}, "", url);
}

function syncFormFromState() {
  els.searchInput.value = state.q;
  els.categorySelect.value = state.category;
  els.sortSelect.value = state.sort;
}

function syncStateFromForm() {
  state.q = els.searchInput.value.trim();
  state.category = els.categorySelect.value.trim();
  state.sort = els.sortSelect.value.trim() || "name_asc";
}

function renderTools(items) {
  els.toolGrid.textContent = "";
  if (!items.length) {
    els.emptyState.classList.remove("hidden");
    return;
  }
  els.emptyState.classList.add("hidden");

  for (const item of items) {
    const li = document.createElement("li");
    li.className = "tool-card";

    const head = document.createElement("div");
    head.className = "tool-head";
    head.appendChild(createToolLogo(item));

    const title = document.createElement("h2");
    const titleLink = document.createElement("a");
    titleLink.href = `/tool/${encodeURIComponent(item.slug)}`;
    titleLink.textContent = item.name;
    titleLink.rel = "bookmark";
    title.appendChild(titleLink);
    head.appendChild(title);

    const metaRow = document.createElement("div");
    metaRow.className = "meta-row";
    metaRow.appendChild(createPill(item.category));

    const tags = String(item.tags || "")
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .slice(0, 2);
    for (const tag of tags) {
      metaRow.appendChild(createPill(tag));
    }

    if (item.quality_status === "recovered") {
      metaRow.appendChild(createPill("Recovered"));
    } else if (item.quality_status === "scraped_verified") {
      metaRow.appendChild(createPill("New"));
    }

    const description = document.createElement("p");
    description.textContent = truncate(item.description, 165);

    const actions = document.createElement("div");
    actions.className = "tool-actions";

    const details = document.createElement("a");
    details.href = `/tool/${encodeURIComponent(item.slug)}`;
    details.textContent = "View details";

    const link = document.createElement("a");
    link.href = normalizeExternalUrl(item.website_url);
    link.target = "_blank";
    link.rel = "noopener noreferrer nofollow";
    link.textContent = "Visit website";

    actions.append(details, link);
    li.append(head, metaRow, description, actions);
    els.toolGrid.appendChild(li);
  }
}

function renderMeta(loadMs) {
  const first = (state.page - 1) * state.pageSize + 1;
  const last = Math.min(state.page * state.pageSize, state.total);
  if (!state.total) {
    els.resultCount.textContent = "0 tools";
  } else {
    els.resultCount.textContent = `${first}-${last} of ${state.total} tools`;
  }
  els.pageIndicator.textContent = `Page ${state.page} / ${state.totalPages}`;
  els.prevPage.disabled = state.page <= 1;
  els.nextPage.disabled = state.page >= state.totalPages;
  els.queryPerf.textContent = typeof loadMs === "number" ? `Loaded in ${loadMs} ms` : "";
  els.statTools.textContent = `${state.total.toLocaleString()} indexed tools`;
}

function buildQuery() {
  const params = new URLSearchParams();
  params.set("page", String(state.page));
  params.set("pageSize", String(state.pageSize));
  params.set("sort", state.sort);
  if (state.q) params.set("q", state.q);
  if (state.category) params.set("category", state.category);
  return params.toString();
}

async function fetchJson(path, signal) {
  const response = await fetch(path, { headers: { Accept: "application/json" }, signal });
  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }
  return response.json();
}

function renderCategoryChips(categories) {
  if (!els.categoryChips) return;
  els.categoryChips.textContent = "";

  const all = document.createElement("button");
  all.type = "button";
  all.className = `category-chip ${!state.category ? "active" : ""}`;
  all.textContent = "All categories";
  all.addEventListener("click", async () => {
    state.category = "";
    state.page = 1;
    syncFormFromState();
    await loadTools();
    renderCategoryChips(categories);
  });
  els.categoryChips.appendChild(all);

  for (const row of categories.slice(0, 12)) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = `category-chip ${state.category === row.category ? "active" : ""}`;
    chip.textContent = `${row.category} (${row.count})`;
    chip.addEventListener("click", async () => {
      state.category = row.category;
      state.page = 1;
      syncFormFromState();
      await loadTools();
      renderCategoryChips(categories);
    });
    els.categoryChips.appendChild(chip);
  }
}

async function loadCategories() {
  const payload = await fetchJson("/api/categories");
  const categories = payload.items || [];
  for (const row of categories) {
    const option = document.createElement("option");
    option.value = row.category;
    option.textContent = `${row.category} (${row.count})`;
    els.categorySelect.appendChild(option);
  }
  if (state.category) {
    const match = [...els.categorySelect.options].some((option) => option.value === state.category);
    if (!match) {
      state.category = "";
    }
  }
  renderCategoryChips(categories);
}

async function loadTools() {
  if (activeController) {
    activeController.abort();
  }
  activeController = new AbortController();
  els.resultCount.textContent = "Loading tools...";
  const started = performance.now();

  const payload = await fetchJson(`/api/tools?${buildQuery()}`, activeController.signal);
  const items = payload.items || [];
  state.total = Number(payload.total || 0);
  state.totalPages = Number(payload.totalPages || 1);
  if (state.page > state.totalPages) {
    state.page = state.totalPages;
  }
  renderTools(items);
  renderMeta(Math.round(performance.now() - started));
  syncUrlFromState();
}

function debounceLoad() {
  window.clearTimeout(debounceTimer);
  debounceTimer = window.setTimeout(async () => {
    syncStateFromForm();
    state.page = 1;
    await loadTools();
  }, 280);
}

els.form.addEventListener("submit", async (event) => {
  event.preventDefault();
  syncStateFromForm();
  state.page = 1;
  await loadTools();
});

els.resetBtn.addEventListener("click", async () => {
  state.q = "";
  state.category = "";
  state.sort = "name_asc";
  state.page = 1;
  syncFormFromState();
  await loadTools();
});

els.searchInput.addEventListener("input", debounceLoad);
els.categorySelect.addEventListener("change", debounceLoad);
els.sortSelect.addEventListener("change", debounceLoad);

els.prevPage.addEventListener("click", async () => {
  if (state.page <= 1) return;
  state.page -= 1;
  await loadTools();
});

els.nextPage.addEventListener("click", async () => {
  if (state.page >= state.totalPages) return;
  state.page += 1;
  await loadTools();
});

async function bootstrap() {
  try {
    readStateFromUrl();
    await loadCategories();
    syncFormFromState();
    await loadTools();
  } catch (error) {
    els.resultCount.textContent = "Failed to load data. Check API setup.";
    els.emptyState.classList.remove("hidden");
    els.emptyState.textContent = String(error.message || error);
  }
}

bootstrap();
