# CLI Weather App

A command-line application that fetches and displays the current weather for a city using the [Open-Meteo](https://open-meteo.com/) API (no API key required).

## Requirements

- Node.js 18 or higher (uses built-in `fetch`).

## Usage

```bash
node index.js "London"
```

**Example output:**

```
Weather in London: 15°C, Clear sky
```

## How it works

1. Reads the city name from the first command-line argument.
2. Uses Open-Meteo’s Geocoding API to get coordinates for the city.
3. Fetches current weather (temperature and conditions) from Open-Meteo’s Forecast API.
4. Prints a short summary: city name, temperature in °C, and weather description.

## Error handling

- **No city given:** Shows usage and exits.
- **City not found:** Clear message asking to check the city name.
- **Network/API errors:** Message about connection or service issues.

## Example commands

```bash
node index.js "London"
node index.js "New York"
node index.js "Tokyo"
node index.js "Paris"
```

## License

ISC.
