import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeftIcon, ClockIcon, MapPinIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { fetchAllRestaurants, fetchMenuByRestaurantEmail,fetchCategorybyRestaurantEmail,getRestaurantRating } from '../../Function/RestaurantFunctions';
import Header from '../../components/Header';
import {fetchAddressFromCoordinates} from "../../Function/AddressFunction";

const RestaurantPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const restaurantFromState = location.state?.restaurant;
  const [restaurant, setRestaurant] = useState(restaurantFromState || null);
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [categories, setCategories] = useState({});
  const [page, setPage] = useState(0);
  const [pageSize] = useState(20);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [address, setAddress] = useState('');
  // Add avg rating state similar to RestaurantCard
  const [avg, setAvg] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        let rest = restaurantFromState;

        if (!rest) {
          const all = await fetchAllRestaurants();
          console.log('Fetched all restaurants:', all);
          const list = Array.isArray(all) ? all : (all?.content || all?.restaurants || []);
          rest = list.find(r => r.id === id);
        }

        if (!rest) {
          setRestaurant(null);
          return;
        }

        setRestaurant(rest);

        // Fetch avg rating once restaurant is determined
        try {
          if (rest?.id) {
            const value = await getRestaurantRating(rest.id);
            setAvg(value);
          } else {
            setAvg(null);
          }
        } catch (e) {
          console.error('Failed to load rating', e);
          setAvg(0);
        }

        // Fetch first page of menu when restaurant is loaded
        const menuPage = await fetchMenuByRestaurantEmail(rest.id, { page: 0, size: pageSize });
        const addressStr = await fetchAddressFromCoordinates(rest.latitude, rest.longitude);
        setAddress(addressStr);
        console.log('Fetched address:', addressStr);
        const items = Array.isArray(menuPage)
          ? menuPage
          : Array.isArray(menuPage.content)
            ? menuPage.content
            : [];
        setMenuItems(items);
        setPage(menuPage.pageNumber ?? menuPage.number ?? 0);
        setHasNextPage(menuPage.hasNext ?? menuPage.hasNextPage ?? menuPage.number < (menuPage.totalPages ?? 1) - 1);
        setHasPreviousPage(menuPage.hasPrevious ?? menuPage.hasPreviousPage ?? (menuPage.pageNumber ?? menuPage.number ?? 0) > 0);

        const categoryList = await fetchCategorybyRestaurantEmail(rest.id);

        const categoryMap = {};
        categoryList.forEach(cat => {
          categoryMap[cat.id] = cat.name;
        });
        setCategories(categoryMap);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id, restaurantFromState, pageSize]);


  const loadPage = async (newPage) => {
    if (!restaurant) return;
    try {
      setLoading(true);
      const menuPage = await fetchMenuByRestaurantEmail(restaurant.id, { page: newPage, size: pageSize });
      const items = Array.isArray(menuPage)
        ? menuPage
        : Array.isArray(menuPage.content)
          ? menuPage.content
          : [];
      setMenuItems(items);
      setPage(menuPage.pageNumber ?? menuPage.number ?? newPage);
      setHasNextPage(menuPage.hasNext ?? menuPage.hasNextPage ?? (menuPage.number ?? newPage) < (menuPage.totalPages ?? 1) - 1);
      setHasPreviousPage(menuPage.hasPrevious ?? menuPage.hasPreviousPage ?? (menuPage.pageNumber ?? menuPage.number ?? newPage) > 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    setCart(prev => ({
      ...prev,
      [item.id]: (prev[item.id] || 0) + 1
    }));
  };

  const removeFromCart = (item) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[item.id] > 1) newCart[item.id]--;
      else delete newCart[item.id];
      return newCart;
    });
  };

  const getCartTotal = () => {
    return Object.entries(cart).reduce((total, [itemId, qty]) => {
      const item = menuItems.find(i => i.id === parseInt(itemId));
      return total + (item ? item.price * qty : 0);
    }, 0).toFixed(2);
  };

  const getCartItemCount = () => Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  // const categories = ['all', ...Object.keys(categoryMap).map(id => Number(id))];
  const categoryIds = [...new Set(menuItems.map(i => i.categoryId))];
  const categoryFilter = ['all', ...categoryIds];
  const filteredItems = activeCategory === 'all'
      ? menuItems
      : menuItems.filter(item => item.categoryId === Number(activeCategory));

  if (loading) return <div className="flex justify-center items-center min-h-screen text-lg text-gray-500">Loading...</div>;
  if (!restaurant) return <div className="flex justify-center items-center min-h-screen text-lg text-danger">Restaurant not found</div>;

  return (
      <div className={`min-h-screen bg-gray-50 ${getCartItemCount() > 0 ? 'pb-24' : 'pb-10'}`}>
        <Header />
        {/* Header with Restaurant Info Overlay */}
        <div className="relative h-72 overflow-hidden">
          {/* Back Button */}
          <button
              onClick={() => navigate('/')}
              className="absolute top-5 left-5 z-20 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:shadow-lg"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>

          {/* Cover Image */}
          <img src={restaurant.coverImageUrl} alt={restaurant.name} className="w-full h-full object-cover" />

          {/* Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

          {/* Restaurant Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
            <h1 className="text-3xl font-extrabold text-white mb-2">{restaurant.name}</h1>
            {restaurant.description && (
              <p className="text-sm text-white/90 leading-relaxed mb-3 line-clamp-2">
                {restaurant.description}
              </p>
            )}

            <div className="flex gap-4 mb-3 flex-wrap items-center">
              {/* Open/Closed Status */}
              <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      restaurant.open
                          ? 'bg-green-500/90 text-white'
                          : 'bg-red-500/90 text-white'
                  }`}
              >
                {restaurant.open ? 'Open' : 'Closed'}
              </span>

              {/* Rating */}
              <div className="flex items-center gap-1 text-white text-sm font-medium">
                <span className="text-yellow-400">★</span>
                <span>{avg}</span>
              </div>

              {/* Contact Number */}
              {restaurant.contactNumber && (
                  <div className="flex items-center gap-1.5 text-white text-sm font-medium">
                    <ClockIcon className="w-4 h-4" />
                    <span>{restaurant.contactNumber}</span>
                  </div>
              )}
            </div>

            {/* Address */}
            { (address||(restaurant.latitude && restaurant.longitude)) && (
                <div className="flex items-start gap-1.5 text-white/90 text-sm">
                  <MapPinIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    { address|| `${restaurant.latitude.toFixed(4)}, ${restaurant.longitude.toFixed(4)}`}
                  </span>
                </div>
            )}
          </div>
        </div>

        {/* Category Filter */}
        <div className="px-5 py-4 bg-white border-b border-gray-200 overflow-x-auto">
          <div className="flex gap-3 min-w-min">
            {categoryFilter.map(cat => (
                <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-5 py-2 rounded-lg text-sm font-semibold ${
                        activeCategory === cat
                            ? 'bg-primary text-white'
                            : 'bg-yellow-300 text-gray-800'
                    }`}
                >
                  {cat === 'all' ? 'All' : categories[cat] || 'Unknown'}
                </button>
            ))}

          </div>
        </div>

        {/* Menu Items */}
        <div className="px-5 py-5 max-w-7xl mx-auto">
          {/* Menu Header with See Reviews Button */}
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-2xl font-bold text-gray-800">Menu</h2>
            <button
              onClick={() => navigate(`/restaurant/${id}/reviews`, { state: { restaurant } })}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-full font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 animate-pulse hover:animate-none"
            >
              <span className="animate-spin-slow">⭐</span>
              See Reviews
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {filteredItems.map(item => (
                <div key={item.id}   className="flex bg-white rounded-xl overflow-hidden border border-gray-400 h-45 w-360 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer items-stretch">
                <img src={item.imageUrl} alt={item.name} className="w-36 h-full object-cover flex-shrink-0" />
                  <div className="flex-1 p-4 flex flex-col">
                    <h3 className="text-base font-bold text-gray-800 mb-1.5">{item.name}</h3>
                    <p className="text-xs text-gray-500 mb-3 flex-1">{item.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-primary">${item.price}</span>
                      {cart[item.id] ? (
                          <div className="flex items-center gap-3 bg-gray-100 rounded-lg px-1 py-1">
                            <button onClick={() => removeFromCart(item)} className="bg-primary text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-primary/90">
                              <MinusIcon className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-bold text-gray-800 min-w-5 text-center">{cart[item.id]}</span>
                            <button onClick={() => addToCart(item)} className="bg-primary text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-primary/90">
                              <PlusIcon className="w-4 h-4" />
                            </button>
                          </div>
                      ) : (
                          <button
                              onClick={() => addToCart(item)}
                              disabled={!item.available}
                              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                  item.available ? 'bg-primary text-white hover:bg-primary/90 cursor-pointer' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              }`}
                          >
                            {item.available ? 'Add' : 'Unavailable'}
                          </button>
                      )}
                    </div>
                  </div>
                </div>
            ))}
          </div>
          {/* Pagination Controls */}
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={() => hasPreviousPage && loadPage(page - 1)}
              disabled={!hasPreviousPage}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border ${
                hasPreviousPage
                  ? 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
                  : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
              }`}
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page + 1}
            </span>
            <button
              onClick={() => hasNextPage && loadPage(page + 1)}
              disabled={!hasNextPage}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border ${
                hasNextPage
                  ? 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
                  : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
              }`}
            >
              Next
            </button>
          </div>
        </div>

        {/* Cart Footer */}
        {getCartItemCount() > 0 && (
            <div className="fixed bottom-0 left-0 right-0 bg-white px-5 py-4 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] flex justify-between items-center z-50">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 font-medium">{getCartItemCount()} items</span>
                <span className="text-2xl font-bold text-primary">${getCartTotal()}</span>
              </div>
              <button 
                onClick={() => navigate('/checkout', { 
                  state: { 
                    cart, 
                    menuItems, 
                    restaurant 
                  } 
                })} 
                className="px-8 py-3.5 bg-primary text-white rounded-xl font-bold text-base hover:bg-primary/90"
              >
                Proceed to Checkout
              </button>
            </div>
        )}
      </div>
  );
};

export default RestaurantPage;
