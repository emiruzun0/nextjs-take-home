export type Location = {
  // Open-Meteo's ID for the place, so a specific "Paris" can be put in the URL.
  id: number;
  name: string;
  region: string | null;
  country: string;
  latitude: number;
  longitude: number;
};

// One forecast hour, in US units. `time` is local to the city, e.g. "2026-10-21T18:00".
export type HourlyWeather = {
  time: string;
  feelsLikeF: number;
  windMph: number;
  precipitationIn: number;
  precipitationChance: number;
  weatherCode: number;
  isDay: boolean;
};

export type CityForecast = {
  location: Location;
  hours: HourlyWeather[];
};
