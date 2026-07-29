const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const open = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!open));
    siteNav.classList.toggle("open", !open);
  });
}

const searchInput = document.querySelector("#search-input");
const countryGrid = document.querySelector("#country-grid");
const resultCount = document.querySelector("#result-count");
const emptyState = document.querySelector("#empty-state");
const filterButtons = [...document.querySelectorAll(".filter")];
let activeFilter = "all";

function filterCountries() {
  if (!countryGrid) return;
  const query = (searchInput?.value || "").trim().toLowerCase();
  const cards = [...countryGrid.querySelectorAll(".country-card")];
  let visible = 0;
  cards.forEach(card => {
    const haystack = card.dataset.search.toLowerCase();
    const matchesQuery = !query || haystack.includes(query);
    const matchesFilter = activeFilter === "all" || haystack.includes(activeFilter);
    const show = matchesQuery && matchesFilter;
    card.hidden = !show;
    if (show) visible++;
  });
  if (resultCount) resultCount.textContent = `显示 ${visible} 个国家`;
  if (emptyState) emptyState.hidden = visible !== 0;
}

searchInput?.addEventListener("input", filterCountries);
document.querySelector("#country-search")?.addEventListener("submit", event => {
  event.preventDefault();
  document.querySelector("#countries")?.scrollIntoView({ behavior: "smooth" });
  filterCountries();
});

filterButtons.forEach(button => button.addEventListener("click", () => {
  activeFilter = button.dataset.filter;
  filterButtons.forEach(item => item.classList.toggle("active", item === button));
  filterCountries();
}));

const revealObserver = "IntersectionObserver" in window
  ? new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    }), { threshold: 0.08 })
  : null;

document.querySelectorAll(".reveal").forEach(element => {
  if (revealObserver) revealObserver.observe(element);
  else element.classList.add("visible");
});

document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener("click", event => {
  const target = document.querySelector(link.getAttribute("href"));
  if (!target) return;
  event.preventDefault();
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}));
