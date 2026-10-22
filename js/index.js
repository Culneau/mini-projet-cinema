import { getMovieById } from "./api.js";

const movies = [
  { title: "Fate/stay night: Heaven's Feel I. presage flower", id: "tt4054952" },
  { title: "Sword Art Online the Movie: Ordinal Scale", id: "tt5544384" },
  { title: "One Piece Film: Red", id: "tt16183464" },
  { title: "The Quintessential Quintuplets Movie", id: "tt15721650" },
  { title: "Detective Conan: Fallen Angel of the Highway", id: "tt39123115" },
  { title: "Fate/stay night: Heaven's Feel II. lost butterfly", id: "tt8091892" },
  { title: "Fate/strange Fake: Whispers of Dawn", id: "tt22264336" },
  { title: "Fate/Grand Order Camelot: Paladin; Agateram", id: "tt13997358" },
  { title: "Sword Art Online Progressive: Aria of a Starless Night", id: "tt13424422" },
  { title: "Fate/Grand Order: First Order", id: "tt6213810" },
  { title: "Fate/Grand Order: The Grand Temple of Time", id: "tt12007484" },
  { title: "Sword Art Online Progressive: Scherzo of Deep Night", id: "tt15830702" },
  { title: "One Piece: Stampede", id: "tt9430698" },
  { title: "Detective Conan: One-Eyed Flashback", id: "tt35444710" },
  { title: "Fate/stay night: Heaven's Feel III. spring song", id: "tt8092118" },
  { title: "Detective Conan: The Million-Dollar Pentagram", id: "tt31474158" },
  { title: "One Piece Film: Gold", id: "tt5251328" },
];

const moviesElement = document.querySelector("#movies");
const message = document.querySelector("#home-message");
const loadMoreButton = document.querySelector("#load-more");
const moviesPerLoad = 8;
let nextMovie = 0;

function createMovieCard(movie) {
  const card = document.createElement("article");
  card.className = "movie-card";

  const title = document.createElement("h3");
  title.textContent = movie.title;

  const posterPlaceholder = document.createElement("div");
  posterPlaceholder.className = "poster-placeholder";
  posterPlaceholder.textContent = "Chargement de l’affiche...";

  const year = document.createElement("p");
  year.textContent = "Chargement...";

  const plot = document.createElement("p");
  plot.textContent = "Chargement du résumé...";

  const link = document.createElement("a");
  link.href = "movie.html?id=" + encodeURIComponent(movie.id);
  link.textContent = "En savoir plus";

  card.append(title, posterPlaceholder, year, plot, link);
  moviesElement.append(card);

  return { card, title, year, plot, posterPlaceholder };
}

function animateCards(cards) {
  const columns = getComputedStyle(moviesElement).gridTemplateColumns.split(" ").length;
  const firstCard = moviesElement.children.length - cards.length;

  cards.forEach((cardElements, index) => {
    const position = firstCard + index;
    const row = Math.floor(position / columns);
    const column = position % columns;
    const rowStart = index - column;
    const positionInRow = row % 2 === 0 ? column : columns - column - 1;
    const delay = rowStart + positionInRow;

    cardElements.card.style.setProperty("--card-delay", delay * 100 + "ms");
    cardElements.card.style.setProperty("--card-slide", row % 2 === 0 ? "-18px" : "18px");
  });
}

function showMovie(movie, cardElements) {
  cardElements.title.textContent = movie.Title;
  cardElements.year.textContent = "Année : " + movie.Year;

  if (movie.Poster && movie.Poster !== "N/A") {
    const poster = document.createElement("img");
    poster.alt = "Affiche de " + movie.Title;
    poster.loading = "eager";
    poster.decoding = "async";
    poster.addEventListener("load", () => {
      if (cardElements.posterPlaceholder.isConnected) {
        cardElements.posterPlaceholder.replaceWith(poster);
      }
    }, { once: true });
    poster.addEventListener("error", () => {
      cardElements.posterPlaceholder.textContent = "Affiche non disponible";
    }, { once: true });
    poster.src = movie.Poster;

    if (poster.complete && poster.naturalWidth > 0) {
      cardElements.posterPlaceholder.replaceWith(poster);
    }
  } else {
    cardElements.posterPlaceholder.textContent = "Affiche non disponible";
  }

  let shortPlot = movie.Plot;

  if (!shortPlot || shortPlot === "N/A") {
    shortPlot = "";
  } else if (shortPlot.length > 150) {
    shortPlot = shortPlot.slice(0, 150) + "...";
  }

  cardElements.plot.textContent = shortPlot;
}

async function loadMovie(movie, cardElements) {
  try {
    const details = await getMovieById(movie.id, "short");

    if (details.Response === "True") {
      showMovie(details, cardElements);
      return true;
    }
  } catch (error) {
    console.error(error);
  }

  cardElements.year.textContent = "Film indisponible.";
  cardElements.plot.textContent = "Les informations du film n'ont pas pu être chargées.";
  return false;
}

async function loadMovies() {
  loadMoreButton.disabled = true;
  message.textContent = "Chargement des films...";

  const moviesToLoad = movies.slice(nextMovie, nextMovie + moviesPerLoad);
  nextMovie += moviesToLoad.length;

  const cards = moviesToLoad.map((movie) => createMovieCard(movie));
  animateCards(cards);

  const results = await Promise.all(moviesToLoad.map((movie, index) => {
    return loadMovie(movie, cards[index]);
  }));

  if (results.every((result) => result === false)) {
    message.textContent = "Aucun film n'a pu être chargé. Vérifie la clé API et Live Server.";
  } else {
    message.textContent = "";
  }

  loadMoreButton.disabled = false;
  loadMoreButton.hidden = nextMovie >= movies.length;
}

loadMoreButton.addEventListener("click", loadMovies);
loadMovies();
