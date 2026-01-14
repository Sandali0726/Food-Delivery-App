const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/reverse";
const cache = new Map();

const buildAddress = (payload) => {
  if (payload?.display_name) {
    return payload.display_name;
  }
  const { house_number, road, city, town, state, country } = payload?.address || {};
  const line = [house_number && road ? `${house_number} ${road}` : road, city || town, state, country]
    .filter(Boolean)
    .join(", ");
  return line || null;
};

export const reverseGeocode = async (latitude, longitude) => {
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    throw new Error("Latitude and longitude must be numbers");
  }

  const key = `${latitude.toFixed(6)},${longitude.toFixed(6)}`;
  if (cache.has(key)) {
    return cache.get(key);
  }

  const url = new URL(NOMINATIM_BASE_URL);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", latitude.toString());
  url.searchParams.set("lon", longitude.toString());

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error("Reverse geocoding request failed");
  }

  const data = await response.json();
  const address = buildAddress(data);
  cache.set(key, address);
  return address;
};
