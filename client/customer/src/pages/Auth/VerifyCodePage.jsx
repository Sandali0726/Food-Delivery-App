import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {customerAPI, passwordAPI} from '../../services/api';
import profileBg from "../../assets/login.jpg";

const VerifyCodePage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const storedEmail = localStorage.getItem('otpEmail');
    if (!storedEmail) {
      navigate('/login');
      return;
    }
    setEmail(storedEmail);
  }, [navigate]);

  const handleResend= async () => {
    setError('');
    setMessage('');
    try {
      setLoading(true);
      const purpose = localStorage.getItem('otpPurpose');
      if(purpose=== 'VERIFY_EMAIL'){
        // Pass string email, not object
        await customerAPI.sendOtp(email);
        setMessage('Verification code resent to your email.');
      }
      else if (purpose === 'RESET_PASSWORD'){
        await passwordAPI.forgotPassword(email);
        setMessage('Reset code resent to your email.');
      }
    }
    catch (err) {
      setError(err.response?.data || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if ( !code) {
      setError('Verification code is required');
      return;
    }

    try {
      setLoading(true);
      const purpose = localStorage.getItem('otpPurpose');
      if(purpose=== 'VERIFY_EMAIL'){
        // Use existing verifyCode endpoint for email verification
        await customerAPI.verifyemail(email, code, 'VERIFY_EMAIL');
        // Mark user as authenticated for ProtectedRoute and clear OTP temp data
        localStorage.setItem('userEmail', email);
        localStorage.removeItem('otpPurpose');
        localStorage.removeItem('otpEmail');
        navigate('/complete-profile');
      }
      else if (purpose === 'RESET_PASSWORD'){
        await passwordAPI.verifyCode(email, code, 'RESET_PASSWORD');
        setMessage('Code verified. You can now reset your password.');
        navigate('/reset-password');

      }

    } catch (err) {
      setError(err.response?.data || 'Invalid or expired code');
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
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-orange-500 to-orange-300 bg-clip-text text-transparent mb-2 cursor-pointer"
              onClick={() => navigate('/')}>
            YUMY
          </h1>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Verification Code</h2>
        <p className="text-center text-sm text-gray-600 mb-6">Enter the code sent to your email.</p>
        {message && <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 font-medium">{message}</div>}
        {error && <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 font-medium">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Verification Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full border-2 border-orange-200 rounded-xl px-4 py-3 text-center text-2xl font-bold tracking-widest focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition-all"
              placeholder="••••••"
              maxLength="6"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold py-3.5 rounded-xl hover:from-orange-600 hover:to-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Didn't receive a code?{' '}
              <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading}
                  className="font-semibold text-orange-600 hover:text-orange-700 hover:underline disabled:opacity-50 transition-colors"
              >
                Resend Code
              </button>
            </p>
          </div>

        </form>
      </div>
    </div>
  );
};

export default VerifyCodePage;
