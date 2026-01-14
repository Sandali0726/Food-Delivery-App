import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, MapPinIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function SearchAddressPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const debounceRef = useRef(null);

  useEffect(() => {
    const storedRecent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    setRecentSearches(storedRecent);
  }, []);

  const searchLocation = async (q) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=LK&limit=8`,
          { headers: { 'User-Agent': 'DynamicSearchApp' } }
      );
      const data = await res.json();
      setResults(data.map(item => ({
        id: item.place_id,
        name: item.display_name.split(',')[0],
        address: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon)
      })));
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchLocation(val), 400);
  };

  const selectLocation = (location) => {
    const updatedRecent = [location, ...recentSearches.filter(r => r.address !== location.address)].slice(0, 5);
    localStorage.setItem('recentSearches', JSON.stringify(updatedRecent)); // Save selected location to localStorage
    localStorage.setItem('userLocationAddress', location.address);
    localStorage.setItem('userLocationLat', location.lat);
    localStorage.setItem('userLocationLng', location.lon);
    navigate(-2);
  };

  return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b px-4 py-4 flex items-center">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full mr-2">
            <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
                type="text"
                placeholder="Search for places"
                value={query}
                onChange={handleQueryChange}
                className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="p-4">
          {!query && recentSearches.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3">Recent Searches</h2>
                {recentSearches.map((recent, i) => (
                    <button key={i} onClick={() => selectLocation(recent)} className="w-full text-left p-4 bg-white rounded-xl border mb-2 flex items-center hover:border-primary/30">
                      <MapPinIcon className="w-5 h-5 text-gray-400 mr-3" />
                      <span>{recent.name || recent.address}</span>
                    </button>
                ))}
              </div>
          )}

          {results.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3">Search Results</h2>
                {results.map(r => (
                    <button key={r.id} onClick={() => selectLocation(r)} className="w-full text-left p-4 bg-white rounded-xl border mb-2 flex items-start hover:border-primary/30">
                      <MapPinIcon className="w-5 h-5 text-primary mt-1 mr-3" />
                      <div>
                        <h3 className="font-medium truncate">{r.name}</h3>
                        <p className="text-sm text-gray-500">{r.address}</p>
                      </div>
                    </button>
                ))}
              </div>
          )}

          {query && results.length === 0 && !loading && (
              <div className="text-center py-12">
                <MagnifyingGlassIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p>No results found</p>
              </div>
          )}

          {loading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-gray-500 mt-2">Searching...</p>
              </div>
          )}
        </div>
      </div>
  );
}
