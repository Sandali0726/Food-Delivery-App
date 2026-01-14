import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, Truck, Store, Users, ArrowRight } from 'lucide-react';
import LandingImage from '../assets/Landing.jpg';

// Landing Page Component
const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero Section with Background Image */}
      <div 
        className="relative min-h-screen bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${LandingImage})` }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-orange-900/60"></div>
        
        {/* Navigation */}
        <nav className="relative z-10 w-full px-4 sm:px-6 py-4 flex flex-wrap items-center gap-4 bg-black/20 backdrop-blur-md shadow-lg border-b border-white/10">
          <div className="flex items-center gap-2 flex-1 min-w-[160px]">
            <ChefHat className="w-8 h-8 text-orange-500" />
            <span className="text-2xl font-bold text-white">Yumy</span>
          </div>
          <div className="flex gap-3 flex-1 justify-end flex-wrap">
            <button 
              onClick={() => navigate('/login')}
              className="px-6 py-2 text-white font-medium hover:text-orange-400 transition w-full sm:w-auto text-center"
            >
              Login
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition shadow-lg hover:shadow-orange-500/50 w-full sm:w-auto"
            >
              Get Started
            </button>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 h-[calc(100vh-73px)] flex items-center justify-center px-4 sm:px-6">
          <div className="text-center max-w-3xl">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-2xl animate-turbulence">
              Deliver Delicious Meals
              <span className="block text-orange-400 mt-2">Faster & Easier</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto drop-shadow-lg">
              Join our platform and connect your restaurant with thousands of hungry customers. Streamline your delivery operations today.
            </p>
            <button 
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto px-10 py-4 bg-orange-600 text-white rounded-lg font-semibold text-lg hover:bg-orange-700 transition shadow-2xl hover:shadow-orange-500/50 inline-flex items-center justify-center gap-2 hover:scale-105 transform"
            >
              Register Your Restaurant
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gradient-to-br from-orange-50 via-white to-red-50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2">
              <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Store className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Easy Setup</h3>
              <p className="text-gray-600">Register your restaurant in minutes and start receiving orders instantly.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Truck className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Fast Delivery</h3>
              <p className="text-gray-600">Our network of delivery partners ensures quick and reliable service.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2">
              <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-7 h-7 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Grow Your Business</h3>
              <p className="text-gray-600">Reach more customers and increase your revenue with our platform.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <ChefHat className="w-6 h-6 text-orange-500" />
            <span className="text-xl font-bold">Yumy</span>
          </div>
          <p className="text-gray-400 mb-4">Delivering happiness, one meal at a time</p>
          <p className="text-gray-500 text-sm">© 2025 Yumy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;