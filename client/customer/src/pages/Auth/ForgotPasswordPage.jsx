import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { passwordAPI } from '../../services/api';
import profileBg from "../../assets/login.jpg";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email) {
      setError('Please enter your email');
      return;
    }

    try {
      setLoading(true);
      await passwordAPI.forgotPassword(email);
      setMessage('If the email exists, a reset code has been sent.');
      // Store email for next step
      localStorage.setItem('resetEmail', email);
      // Navigate to verify-code page
      localStorage.setItem('otpPurpose', 'RESET_PASSWORD');
      localStorage.setItem('otpEmail', email);
      navigate('/verify-code');

    } catch (err) {
      // Detailed diagnostics
      console.log('ForgotPassword error:', {
        message: err?.message,
        name: err?.name,
        toString: err?.toString?.(),
        status: err?.response?.status,
        data: err?.response?.data,
        url: err?.config?.url
      });
      const serverMessage = err?.response?.data?.message
        ?? err?.response?.data?.error
        ?? err?.response?.data?.detail
        ?? (typeof err?.response?.data === 'string' ? err.response.data : undefined);
      setError(serverMessage || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  return (
    // <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-100 px-4">
      <div
          className="min-h-screen flex justify-center items-center bg-cover bg-center px-4 py-8"
          style={{ backgroundImage: `url(${profileBg})` }}
      >
      <div className="bg-white bg-opacity-20 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-orange-100">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent mb-2 cursor-pointer"
              onClick={() => navigate('/')}>
            YUMY
          </h1>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Forgot Password</h2>
        <p className="text-center text-sm text-gray-600 mb-6">Enter your email to receive a reset code</p>
        {message && <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 font-medium">{message}</div>}
        {error && <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 font-medium">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-orange-200 rounded-xl px-4 py-3 bg-orange-50/30 text-base outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all"
              placeholder="you@example.com"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold py-3.5 rounded-xl hover:from-orange-600 hover:to-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {loading ? 'Sending...' : 'Send Reset Code'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
