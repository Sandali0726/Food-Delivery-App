import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPinIcon } from '@heroicons/react/24/outline';
import Header from '../../components/Header';
import SearchBar from './components/SearchBar';
import RestaurantCard from '../Resturant/RestaurantCard';
import RestaurantMap from './components/RestaurantMap';
import Footer from '../../components/Footer';
import { fetchAllRestaurants } from '../../Function/RestaurantFunctions';
import ClosedRestaurantModal from './components/ClosedRestaurantModal';
import ReviewBar from './components/ReviewBar';
import {haversineKm} from "../../Function/AddressFunction";

const HomePage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState('Getting your location...');
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [isClosedModalOpen, setIsClosedModalOpen] = useState(false);
  const [closedRestaurant, setClosedRestaurant] = useState(null);
  const navigate = useNavigate();

  // Fetch restaurants on mount
  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        setLoading(true);
        const data = await fetchAllRestaurants();
        //console.log('Fetched restaurants data:', data);
        // Normalize expected shape: ensure array
        const list = Array.isArray(data) ? data : (data?.content || data?.restaurants || []);
        setRestaurants(list);
        setAllRestaurants(list);
        const nearby = filterNearbyRestaurants(list,5);
        setRestaurants(nearby);
      } catch (e) {
        console.error('Failed to load restaurants:', e);
        setRestaurants([]);
        setAllRestaurants([]);
      } finally {
        setLoading(false);
      }
    };
    loadRestaurants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize allRestaurants from restaurants updates
  useEffect(() => {
    setAllRestaurants(restaurants);
  }, [restaurants]);

  // Get user location
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    const savedLocation = localStorage.getItem('userLocationAddress');
    if (savedLocation) {
      setLocation(savedLocation);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=YOUR_MAPBOX_TOKEN`
          );
          const data = await response.json();
          const address = data.features[0]?.place_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          setLocation(address);
          localStorage.setItem('userLocationAddress', address);
          localStorage.setItem('userLocationLat', latitude);
          localStorage.setItem('userLocationLng', longitude);
        } catch (error) {
          setLocation(`${latitude.toFixed(3)}, ${longitude.toFixed(3)}`);
        }
      }, () => setLocation('Enable location for better experience'));
    }
  };

  // Make this a pure function that returns the filtered array
  //SHOW RESTAURANT 5KM RANGE
  const filterNearbyRestaurants=(restaurantsList, radiusKm=5)=>{
    if(!restaurantsList || !Array.isArray(restaurantsList)) return [];

    const userLat=parseFloat(localStorage.getItem('userLocationLat'));
    const userLng=parseFloat(localStorage.getItem('userLocationLng'));

    // If user location isn't available, return the original list
    if(Number.isNaN(userLat) || Number.isNaN(userLng)){
      return restaurantsList;
    }

    return restaurantsList.filter(r=>{
      if(!r || r.latitude == null || r.longitude == null) return false;

      const distance= haversineKm(
          userLat,
          userLng,
          parseFloat(r.latitude),
          parseFloat(r.longitude)
      );
      return distance<=radiusKm;
    });
  };

  const handleSearch = (query) => {
    if (!query || query.trim() === '') {
      setRestaurants(allRestaurants); // Reset to all restaurants if input is empty
      return;
    }

    const filtered = allRestaurants.filter(r =>
        (r?.name || '').toLowerCase().includes(query.toLowerCase())
    );
    setRestaurants(filtered); // Update restaurants state
  };


  return (
      <div className="min-h-screen bg-gray-50 ">
        <Header />

        {/* Location Bar */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 md:gap-4 px-4 sm:px-5 py-3 sm:py-4  bg-white border-gray-200 max-w-7xl mx-auto">
          <div className="flex items-start sm:items-center gap-2 sm:gap-3">
            <MapPinIcon className="w-5 h-5 text-primary flex-shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] sm:text-xs text-gray-500 font-medium">Deliver to</span>
              <span className="text-sm sm:text-base text-gray-800 font-semibold max-w-full sm:max-w-[420px] break-words">
              {location}
            </span>
            </div>
          </div>
          <SearchBar onSearch={handleSearch} />
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">

            <button
                onClick={() => setIsMapOpen(true)}
                className="px-3 sm:px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90"
            >
              Search by Map
            </button>

            <button
                onClick={() => navigate('/location')}
                className="px-4 sm:px-5 py-2 bg-transparent text-primary border border-primary rounded-lg cursor-pointer font-semibold text-sm hover:bg-primary hover:text-white transition-all duration-200"
            >
              Change
            </button>
          </div>
        </div>

        {/* Map Modal */}
        {isMapOpen && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4">
              <div className="bg-white rounded-lg shadow-xl w-full sm:w-[95vw] max-w-5xl h-[90vh] sm:h-[80vh] relative">
                <div className="flex items-center justify-between p-3 sm:p-4 border-b">
                  <h3 className="text-base sm:text-lg font-semibold">Explore Restaurants on Map</h3>
                  <button onClick={() => setIsMapOpen(false)} className="text-gray-500 hover:text-gray-700 text-lg" aria-label="Close">✕</button>
                </div>
                <div className="w-full h-[calc(90vh-52px)] sm:h-[calc(80vh-56px)]">
                  <RestaurantMap restaurants={restaurants} />
                </div>
              </div>
            </div>
        )}

        {/* Review Bar Section */}
        <ReviewBar />

        {/* Restaurants Section */}
        <div className="px-4 sm:px-5 py-1 sm:py-1 max-w-7xl mx-auto mt-1">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-5">
            Restaurants Near You
          </h2>

          {loading ? (
              <div className="text-center py-12 sm:py-16 text-gray-500 text-base">
                Loading restaurants...
              </div>
          ) : restaurants.length === 0 ? (
              <div className="text-center py-12 sm:py-16 text-gray-500 text-base">
                No restaurants found
              </div>
          ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 mb-2">
                {restaurants.map(restaurant => (
                    <RestaurantCard
                        key={restaurant.id }
                        restaurant={restaurant}
                        onClick={() => {
                          if (!restaurant.open) {
                            setClosedRestaurant(restaurant);
                            setIsClosedModalOpen(true);
                            return;
                          }
                          navigate(`/restaurant/${restaurant.id}`, { state: { restaurant } });
                        }}
                    />
                ))}
              </div>
          )}
        </div>

        <Footer />

        {/* Closed Restaurant Modal */}
        <ClosedRestaurantModal
            open={isClosedModalOpen}
            restaurant={closedRestaurant}
            onClose={() => {
              setIsClosedModalOpen(false);
              setClosedRestaurant(null);
            }}
        />
      </div>
  );
};

export default HomePage;
