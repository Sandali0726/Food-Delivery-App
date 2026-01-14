import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircleIcon, ShoppingBagIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { UserDetails } from '../Function/UserFunction';
const Header = () => {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('userEmail');
  const [profileImage, setProfileImage] = useState(null);
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (userEmail) {
        try {
          const userProfile = await UserDetails(userEmail);
          //console.log('Fetched user profile:', userProfile);
          setProfileImage(userProfile.img_url);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };
    fetchUserProfile();
  }, [userEmail]);
  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('token');
    navigate('/login');
  };
  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-primary via-orange-500 to-red-600 shadow-lg backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo/Brand */}
          <div 
            className="flex items-center cursor-pointer group" 
            onClick={() => navigate('/')}
          >
            <div className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow-lg group-hover:scale-105 transition-transform">
              🍽️ <span className="ml-2">Yumy</span>
            </div>
          </div>
          {/* Right Side - User Menu */}
          <div className="flex items-center gap-2 sm:gap-4">
            {userEmail ? (
              <>
                {/* Orders Button */}
                <button
                  onClick={() => navigate('/orders')}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-semibold transition-all hover:scale-105 backdrop-blur-sm shadow-md"
                  title="My Orders"
                >
                  <ShoppingBagIcon className="w-5 h-5" />
                  <span>Orders</span>
                </button>
                {/* Mobile Orders Icon */}
                <button
                  onClick={() => navigate('/orders')}
                  className="sm:hidden p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all hover:scale-105 backdrop-blur-sm shadow-md"
                  title="My Orders"
                  aria-label="View orders"
                >
                  <ShoppingBagIcon className="w-6 h-6" />
                </button>
                {/* User Profile Button */}
                <button
                  onClick={() => navigate('/profile')}
                  className="p-1 bg-white/20 hover:bg-white/30 rounded-full transition-all hover:scale-105 backdrop-blur-sm shadow-md"
                  title="Profile"
                  aria-label="User profile"
                >
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="User Profile"
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover"
                    />
                  ) : (
                    <UserCircleIcon className="w-8 h-8 sm:w-9 sm:h-9 text-white" />
                  )}
                </button>
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-all hover:scale-105 shadow-md"
                  title="Logout"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 sm:px-6 py-2 bg-white text-primary hover:bg-white/90 rounded-lg font-bold transition-all hover:scale-105 shadow-md text-sm sm:text-base"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="px-4 sm:px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-bold transition-all hover:scale-105 backdrop-blur-sm shadow-md text-sm sm:text-base border-2 border-white/50"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
export default Header;
