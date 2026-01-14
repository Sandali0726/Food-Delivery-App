import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const OAuth2CallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    const newUser = searchParams.get('newUser');
    const error = searchParams.get('error');

    if (error) {
      console.error('OAuth2 error:', error);
      navigate('/login?error=' + error);
      return;
    }

    if (token && email) {
      localStorage.setItem('token', token);
      localStorage.setItem('userEmail', email);

      if (newUser === 'true') {
        navigate('/complete-profile'); // First-time Google signup
      } else {
        navigate('/'); // Existing user
      }
    } else {
      navigate('/login?error=missing_parameters');
    }
  }, [navigate, searchParams]);

  return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Completing sign in...</p>
        </div>
      </div>
  );
};

export default OAuth2CallbackPage;
