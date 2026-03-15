#!/usr/bin/env node
/**
 * CLI Weather App
 * Usage: node index.js "City Name"
 * Fetches current weather from Open-Meteo API (no API key required).
 */

const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";

// WMO Weather interpretation codes (Open-Meteo)
const WEATHER_CODES = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

/**
 * Fetch JSON from a URL (async).
 * @param {string} url
 * @returns {Promise<object>}
 */
async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

/**
 * Get latitude and longitude for a city name.
 * @param {string} cityName
 * @returns {Promise<{ latitude: number, longitude: number, name: string }>}
 */
async function geocodeCity(cityName) {
  const url = `${GEOCODE_URL}?name=${encodeURIComponent(cityName)}&count=1`;
  const data = await fetchJson(url);

  if (!data.results || data.results.length === 0) {
    throw new Error(`No location found for "${cityName}". Check the city name and try again.`);
  }

  const first = data.results[0];
  return {
    latitude: first.latitude,
    longitude: first.longitude,
    name: first.name,
  };
}

/**
 * Get current weather for given coordinates.
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<{ temp: number, code: number }>}
 */
async function getWeather(lat, lon) {
  const url = `${WEATHER_URL}?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`;
  const data = await fetchJson(url);

  if (!data.current) {
    throw new Error("Invalid response from weather API.");
  }

  return {
    temp: data.current.temperature_2m,
    code: data.current.weather_code,
  };
}

/**
 * Map WMO code to short description.
 * @param {number} code
 * @returns {string}
 */
function weatherDescription(code) {
  return WEATHER_CODES[code] ?? "Unknown";
}

/**
 * Main: read city from argv, geocode, fetch weather, print summary.
 */
async function main() {
  const cityArg = process.argv[2];

  if (!cityArg || cityArg.trim() === "") {
    console.error("Error: Please provide a city name.");
    console.error('Usage: node index.js "London"');
    process.exit(1);
  }

  const cityName = cityArg.trim();

  try {
    const { latitude, longitude, name } = await geocodeCity(cityName);
    const { temp, code } = await getWeather(latitude, longitude);
    const description = weatherDescription(code);

    console.log(`Weather in ${name}: ${Math.round(temp)}°C, ${description}`);
  } catch (err) {
    if (err.cause && err.cause.code === "ENOTFOUND") {
      console.error("Error: Could not reach the weather service. Check your internet connection.");
    } else if (err.message) {
      console.error("Error:", err.message);
    } else {
      console.error("Error: Something went wrong. Please try again.");
    }
    process.exit(1);
  }
}

main();
