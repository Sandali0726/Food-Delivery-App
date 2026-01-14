import React from 'react';
import { FcGoogle } from 'react-icons/fc';

const GoogleSignInButton = ({ onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white border-2 border-orange-200 rounded-xl text-base font-semibold text-gray-700 hover:border-orange-400 hover:bg-orange-50 transition-all duration-200 shadow-sm hover:shadow-md"
    >
      <FcGoogle size={24} />
      <span>Continue with Google</span>
    </button>
  );
};

export default GoogleSignInButton;

