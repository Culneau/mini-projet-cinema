import { getMovieById } from "./api.js";

const movieId = new URLSearchParams(window.location.search).get("id");
const message = document.querySelector("#movie-message");
const details = document.querySelector("#movie-details");

function formatDate(date) {
  if (!date || date === "N/A") {
    return "Non renseignée";
  }

  const months = {
    Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
    Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
  };
  const parts = date.split(" ");

  if (parts.length !== 3 || !months[parts[1]]) {
    return date;
  }

  return parts[0].padStart(2, "0") + "/" + months[parts[1]] + "/" + parts[2];
}

async function loadMovie() {
  if (!movieId) {
    message.textContent = "Aucun film n’a été sélectionné.";
    return;
  }

  try {
    const movie = await getMovieById(movieId, "full");

    if (movie.Response === "False") {
      message.textContent = movie.Error;
      return;
    }

    document.title = movie.Title + " - Le Ciné du Village";
    document.querySelector("#movie-title").textContent = movie.Title;
    document.querySelector("#movie-year").textContent = movie.Year;
    document.querySelector("#movie-genre").textContent = movie.Genre;
    document.querySelector("#movie-actors").textContent = movie.Actors;
    document.querySelector("#movie-dvd").textContent = formatDate(movie.DVD);
    document.querySelector("#movie-plot").textContent = movie.Plot && movie.Plot !== "N/A"
      ? movie.Plot
      : "Résumé non disponible.";

    const poster = document.querySelector("#movie-poster");
    const posterPlaceholder = document.querySelector("#movie-poster-placeholder");
    if (movie.Poster && movie.Poster !== "N/A") {
      poster.loading = "eager";
      poster.decoding = "async";
      const showPoster = () => {
        poster.hidden = false;
        posterPlaceholder.hidden = true;
      };
      poster.addEventListener("load", showPoster, { once: true });
      poster.addEventListener("error", () => {
        posterPlaceholder.textContent = "Affiche non disponible";
        details.classList.add("no-poster");
      }, { once: true });
      poster.src = movie.Poster;

      if (poster.complete && poster.naturalWidth > 0) {
        showPoster();
      }
    } else {
      details.classList.add("no-poster");
      posterPlaceholder.textContent = "Affiche non disponible";
    }

    const ratings = document.querySelector("#movie-ratings");
    if (movie.Ratings && movie.Ratings.length > 0) {
      movie.Ratings.forEach((rating) => {
        const item = document.createElement("li");
        item.textContent = rating.Source + " : " + rating.Value;
        ratings.append(item);
      });
    } else {
      ratings.textContent = "Aucune note disponible.";
    }

    message.hidden = true;
    details.hidden = false;
  } catch (error) {
    message.textContent = error.message;
  }
}

loadMovie();
