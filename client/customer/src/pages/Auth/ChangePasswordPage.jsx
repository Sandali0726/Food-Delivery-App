import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { passwordAPI } from '../../services/api';
import { PasswordInput } from '../../components/tailwind';
import profileBg from "../../assets/login.jpg";

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [oldPassword, setoldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const MAX_ATTEMPTS = 3;

  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    if (!storedEmail) {
      navigate('/login');
      return;
    }
    setEmail(storedEmail);
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Check if max attempts reached
    if (attempts >= MAX_ATTEMPTS) {
      setError('Maximum attempts reached. Please try again later or use forgot password.');
      return;
    }

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (newPassword.length > 15) {
      setError('Password must be at most 15 characters');
      return;
    }

    if (oldPassword === newPassword) {
      setError('New password must be different from current password');
      return;
    }

    try {
      setLoading(true);
      //console.log('Changing password for:', email);
      //console.log('Old Password:', oldPassword);
      //console.log('New Password:', newPassword);
      await passwordAPI.changePassword(email, oldPassword, newPassword);
      setMessage('Password changed successfully! ');
      setAttempts(0); // Reset attempts on success
      setTimeout(() => navigate('/profile'), 2000);
    } catch (err) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      const remainingAttempts = MAX_ATTEMPTS - newAttempts;
      let errorMessage = err.response?.data?.message || 'Failed to change password';

if (typeof errorMessage === 'object') {
  errorMessage = errorMessage?.message || 'Failed to change password';
}

if (typeof errorMessage !== 'string') {
  errorMessage = 'Failed to change password';
}

      const isIncorrectPassword = err.response?.status === 401 || 
                                  (typeof errorMessage === 'string' && errorMessage.toLowerCase().includes('incorrect'));
      
      if (isIncorrectPassword) {
        if (remainingAttempts > 0) {
          setError(`Current password is incorrect. ${remainingAttempts} attempt(s) remaining.`);
        } else {
          setError('Maximum attempts reached. Please use forgot password to reset.');
        }
      } else {
        setError(typeof errorMessage === 'string' ? errorMessage : 'Failed to change password');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
      <div
          className="min-h-screen flex justify-center items-center bg-cover bg-center px-4 py-8"
          style={{ backgroundImage: `url(${profileBg})` }}
      >
      <div className="bg-white bg-opacity-20 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-orange-100">
        <div className="text-center mb-6">
          <h1 
            className="text-4xl font-extrabold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent mb-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            YUMY
          </h1>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Change Password</h2>
        <p className="text-center text-sm text-gray-600 mb-6">Update your account password</p>
        
        {message && (
          <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 font-medium">
            {message}
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 font-medium">
            {error}
          </div>
        )}

        {attempts >= MAX_ATTEMPTS ? (
          <div className="text-center space-y-4">
            <p className="text-gray-700">You've reached the maximum number of attempts.</p>
            <button
              onClick={handleForgotPassword}
              className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold py-3.5 rounded-xl hover:from-orange-600 hover:to-yellow-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Reset Password via Email
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="w-full bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-300 transition-all duration-200"
            >
              Back to Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <PasswordInput
                label="Current Password"
                placeholder="Enter your current password"
                value={oldPassword}
                onChange={(e) => setoldPassword(e.target.value)}
                required={true}
              />
            </div>

            <div>
              <PasswordInput
                label="New Password"
                placeholder="Enter your new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required={true}
              />
              <p className="text-xs text-gray-500 mt-1">Must be 8-15 characters</p>
            </div>

            <div>
              <PasswordInput
                label="Confirm New Password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required={true}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold py-3.5 rounded-xl hover:from-orange-600 hover:to-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? 'Changing Password...' : 'Change Password'}
            </button>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Forgot your password?{' '}
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="font-semibold text-orange-600 hover:text-orange-700 hover:underline transition-colors"
                >
                  Reset via Email
                </button>
              </p>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                ← Back to Profile
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChangePasswordPage;
