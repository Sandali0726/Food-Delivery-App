import { useState, useEffect } from 'react';
import { ChefHat, Menu, Package, Truck, Settings, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutSuccess } from '../features/authSlice';
import { logoutRestaurant } from '../api/authApi';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutRestaurant();
      dispatch(logoutSuccess());
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
      // Still logout locally even if API fails
      dispatch(logoutSuccess());
      navigate('/login');
    }
  };

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navItems = [
    { path: '/menu', label: 'Menu', Icon: Menu },
    { path: '/orders', label: 'Orders', Icon: Package },
    { path: '/deliver-now', label: 'Deliver Now', Icon: Truck },
    { path: '/settings', label: 'Settings', Icon: Settings },
  ];

  const renderButtonClasses = (path) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
      isActive(path)
        ? 'bg-orange-600 text-white'
        : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
    }`;

  return (
    <nav className="bg-white shadow-md px-4 sm:px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div
          className="flex items-center justify-between gap-4 cursor-pointer"
          onClick={() => navigate('/dashboard')}
        >
          <div className="flex items-center gap-2">
            <ChefHat className="w-8 h-8 text-orange-600" />
            <span className="text-2xl font-bold text-gray-800">Yumy</span>
          </div>
          <button
            type="button"
            className="lg:hidden inline-flex items-center justify-center rounded-lg border border-gray-200 p-2 text-gray-700 hover:border-orange-200 hover:text-orange-600 transition"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-2">
          {navItems.map(({ path, label, Icon }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={renderButtonClasses(path)}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </button>
          ))}

          <button
            onClick={handleLogout}
            className="ml-4 px-4 py-2 text-gray-700 hover:text-red-600 font-medium transition"
          >
            Logout
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden mt-3 border border-gray-200 rounded-2xl shadow-sm bg-white p-4 flex flex-col gap-2">
          {navItems.map(({ path, label, Icon }) => (
            <button
              key={`mobile-${path}`}
              onClick={() => navigate(path)}
              className={`${renderButtonClasses(path)} w-full justify-start`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </button>
          ))}

          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-left font-medium text-gray-700 hover:text-red-600 transition"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
