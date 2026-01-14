import { ChefHat } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div className="flex items-center gap-2 justify-center">
            <ChefHat className="w-6 h-6 text-orange-500" />
            <span className="text-xl font-bold">Yumy</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-300">
            <Link to="/about-us" className="hover:text-orange-500 transition">
              About Us
            </Link>
            <Link to="/support" className="hover:text-orange-500 transition">
              Support
            </Link>
            <Link to="/terms-of-service" className="hover:text-orange-500 transition">
              Terms of Service
            </Link>
            <Link to="/privacy-policy" className="hover:text-orange-500 transition">
              Privacy Policy
            </Link>
          </div>

          <div className="text-sm text-gray-400">
            © 2025 Yumy. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
