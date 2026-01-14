import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { customerAPI, authAPI } from '../../services/api';
import { AuthLayout, PasswordInput, GoogleSignInButton, OrDivider, ErrorAlert } from '../../components/tailwind';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSignIn = () => {
    authAPI.redirectToGoogleLogin();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      const response = await customerAPI.login({ auth_email: formData.email, password: formData.password });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      localStorage.setItem('userEmail', formData.email);

      // Check if profile is complete
      const profileResponse = await customerAPI.getProfile(formData.email);
      if (!profileResponse.data.first_name) {
        navigate('/complete-profile');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Login failed:', error);
      const msg = error.response?.data?.message || 'Invalid email or password';
      setError(msg);
      if (msg.toLowerCase().includes('verify')) {
        // Help user complete verification if backend says to verify email first
        localStorage.setItem('otpPurpose', 'VERIFY_EMAIL');
        localStorage.setItem('otpEmail', formData.email);
        try {
          await customerAPI.sendOtp(formData.email);
        } catch {
          // ignore secondary OTP send errors
        }
        navigate('/verify-code');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Login to Your Account" subtitle="Welcome back!">
      <GoogleSignInButton onClick={handleGoogleSignIn} />

      <OrDivider />

      {error && <ErrorAlert message={error} />}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Input */}
        <div>
          <label className="block text-mb font-semibold text-gray-900 mb-2">
            Email Address
          </label>
          <div className="relative">
            <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full pl-12 pr-4 py-3 border-2 border-orange-200 rounded-xl bg-orange-50/30 text-base outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all"
            />
          </div>
        </div>

        {/* Password Input */}
        <PasswordInput
          label="Password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
          

        {/* Forgot Password Link */}
        <div className="text-right">
          <Link
            to="/forgot-password"
            className="text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold text-base rounded-xl hover:from-orange-600 hover:to-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      {/* Sign Up Link */}
      <p className="text-center mt-6 text-sm text-gray-600">
        Don't have an account?{' '}
        <Link
          to="/signup"
          className="font-semibold text-orange-600 hover:text-orange-700 transition-colors"
        >
          Sign Up
        </Link>
      </p>
    </AuthLayout>
  );
};

export default LoginPage;
