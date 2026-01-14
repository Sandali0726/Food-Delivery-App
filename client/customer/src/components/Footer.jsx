import React from 'react';

const Footer = () => {
  return (
    <footer className="mt-6 w-full bg-gradient-to-r from-primary to-orange-500 ">
      <div className="max-w-7xl mx-auto px-5 py-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-black">
        <div>
          <h4 className="text-gray-900 font-semibold mb-2">Yumi</h4>
          <p>Discover and order from your favorite restaurants near you.</p>
        </div>
        <div>
          <h4 className="text-gray-900 font-semibold mb-2">Links</h4>
          <ul className="space-y-1">
            <li><a className="hover:text-red-700" href="/">Home</a></li>
            <li><a className="hover:text-red-700" href="/orders">Orders</a></li>
            <li><a className="hover:text-red-700" href="/profile">Profile</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-gray-900 font-semibold mb-2">Contact</h4>
          <ul className="space-y-1">
            <li>Email: jayawardhanasandali2@gmail.com</li>
            <li>Phone: +1 (555) 123-4567</li>
          </ul>
        </div>
      </div>
      <div >
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between text-xs text-black">
          <span>© {new Date().getFullYear()} Yumi. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <a className="hover:text-primary" href="#">Privacy</a>
            <a className="hover:text-primary" href="#">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

