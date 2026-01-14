import React from 'react';

const OrDivider = () => {
  return (
    <div className="flex items-center gap-4 my-6">
      <div className="flex-1 h-px bg-gray-300"></div>
      <span className="text-sm font-medium text-gray-500">OR</span>
      <div className="flex-1 h-px bg-gray-300"></div>
    </div>
  );
};

export default OrDivider;

