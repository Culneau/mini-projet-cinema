import { searchMovies } from "./api.js";

const searchInput = document.querySelector("#search-input");
const resultsElement = document.querySelector("#search-results");
const message = document.querySelector("#search-message");
const loadMoreButton = document.querySelector("#load-more");

let searchTimer;
let currentSearch = "";
let currentPage = 1;
let totalResults = 0;
let latestRequest = 0;

function createMovieCard(movie) {
  const card = document.createElement("article");
  card.className = "movie-card";

  const posterPlaceholder = document.createElement("div");
  posterPlaceholder.className = "poster-placeholder";
  posterPlaceholder.textContent = "Chargement de l’affiche...";
  card.append(posterPlaceholder);

  if (movie.Poster && movie.Poster !== "N/A") {
    const poster = document.createElement("img");
    poster.alt = "Affiche de " + movie.Title;
    poster.loading = "eager";
    poster.decoding = "async";
    poster.hidden = true;
    poster.addEventListener("load", () => {
      poster.hidden = false;
      posterPlaceholder.hidden = true;
    }, { once: true });
    poster.addEventListener("error", () => {
      posterPlaceholder.textContent = "Affiche non disponible";
    }, { once: true });
    poster.src = movie.Poster;
    card.append(poster);

    if (poster.complete && poster.naturalWidth > 0) {
      poster.hidden = false;
      posterPlaceholder.hidden = true;
    }
  } else {
    posterPlaceholder.textContent = "Affiche non disponible";
  }

  const title = document.createElement("h3");
  title.textContent = movie.Title;

  const year = document.createElement("p");
  year.textContent = "Année : " + movie.Year;

  const link = document.createElement("a");
  link.href = "movie.html?id=" + encodeURIComponent(movie.imdbID);
  link.textContent = "En savoir plus";

  card.append(title, year, link);
  return card;
}

function normalizeTitle(title) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function sortSearchResults(movies, query) {
  const normalizedQuery = normalizeTitle(query);

  return movies
    .map((movie, index) => ({ movie, index }))
    .sort((a, b) => {
      const titleA = normalizeTitle(a.movie.Title);
      const titleB = normalizeTitle(b.movie.Title);
      const startsA = titleA.startsWith(normalizedQuery);
      const startsB = titleB.startsWith(normalizedQuery);

      if (startsA !== startsB) {
        return startsA ? -1 : 1;
      }

      return a.index - b.index;
    })
    .map((item) => item.movie);
}

async function search(query, page, addResults) {
  const requestNumber = ++latestRequest;
  message.textContent = "Recherche en cours...";
  loadMoreButton.disabled = true;

  try {
    const data = await searchMovies(query, page);

    if (requestNumber !== latestRequest || query !== currentSearch) {
      return;
    }

    if (data.Response === "False") {
      if (!addResults) {
        resultsElement.innerHTML = "";
      }
      if (data.Error === "Movie not found!") {
        message.textContent = "Aucun film trouvé. Essaie un autre titre.";
      } else if (data.Error === "Too many results") {
        message.textContent = "La recherche est trop large. Ajoute quelques lettres, par exemple « Dune » au lieu de « Du ».";
      } else {
        message.textContent = "Erreur de recherche : " + data.Error;
      }
      loadMoreButton.hidden = true;
      return;
    }

    if (!addResults) {
      resultsElement.innerHTML = "";
    }

    sortSearchResults(data.Search, query).forEach((movie) => {
      resultsElement.append(createMovieCard(movie));
    });

    currentPage = page;
    totalResults = Number(data.totalResults);
    message.textContent = totalResults + " résultat(s) trouvé(s).";
    loadMoreButton.hidden = resultsElement.children.length >= totalResults;
  } catch (error) {
    if (requestNumber === latestRequest) {
      message.textContent = error.message;
    }
  } finally {
    if (requestNumber === latestRequest) {
      loadMoreButton.disabled = false;
    }
  }
}

function searchWhileTyping() {
  clearTimeout(searchTimer);
  currentSearch = searchInput.value.trim();
  currentPage = 1;
  latestRequest++;
  resultsElement.innerHTML = "";
  loadMoreButton.hidden = true;
  loadMoreButton.disabled = false;

  if (currentSearch.length < 2) {
    message.textContent = "Tape au moins deux lettres pour commencer.";
    return;
  }

  const query = currentSearch;
  searchTimer = window.setTimeout(() => search(query, 1, false), 300);
}

searchInput.addEventListener("input", searchWhileTyping);

loadMoreButton.addEventListener("click", () => {
  search(currentSearch, currentPage + 1, true);
});
