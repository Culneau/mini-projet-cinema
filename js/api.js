import { API_KEY } from "./config.js";

const API_URL = "https://www.omdbapi.com/?apikey=" + API_KEY;

async function getData(url) {
  const response = await fetch(url);
  return response.json();
}

export function searchMovies(title, page = 1) {
  const url = API_URL + "&s=" + encodeURIComponent(title) + "&type=movie&page=" + page;
  return getData(url);
}

export function getMovieByTitle(title, year) {
  const url = API_URL + "&t=" + encodeURIComponent(title) + "&y=" + year + "&plot=short";
  return getData(url);
}

export function getMovieById(id, plotLength = "full") {
  const url = API_URL + "&i=" + encodeURIComponent(id) + "&plot=" + plotLength;
  return getData(url);
}
