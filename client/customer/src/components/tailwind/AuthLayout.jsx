import React from 'react';
import {useNavigate} from "react-router-dom";
import profileBg from '../../assets/login.jpg';

const AuthLayout = ({ children, title, subtitle }) => {
    const navigate = useNavigate();
  return (
    <div
      className="min-h-screen flex justify-center items-center bg-cover bg-center px-4 py-8"
      style={{ backgroundImage: `url(${profileBg})` }}
    >
      <div className="bg-white bg-opacity-20 p-8 md:p-10 rounded-2xl w-full max-w-md shadow-2xl border border-orange-100">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent mb-2 cursor-pointer"
              onClick={() => navigate('/')}
          >
            YUMY
          </h1>
          {subtitle && (
            <p className="text-sm text-gray-500">
              {subtitle}
            </p>
          )}
        </div>

        {/* Title */}
        {title && (
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
            {title}
          </h2>
        )}

        {/* Content */}
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
