import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import {customerAPI} from '../../services/api';
import { AuthLayout, PasswordInput, GoogleSignInButton, OrDivider, ErrorAlert } from '../../components/tailwind';

const SignUpPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (formData.password.length > 15) {
      setError('Password must be lesser than 15 characters');
      return;
    }

    setLoading(true);
    try {
      // 1) Create account
      await customerAPI.register({
        email: formData.email,
        password: formData.password
      });

      // 2) Persist OTP context and try to send verification code
      localStorage.setItem('otpPurpose', 'VERIFY_EMAIL');
      localStorage.setItem('otpEmail', formData.email);

      try {
        await customerAPI.sendOtp(formData.email);
      } catch (otpErr) {
        // Don't block sign-up flow if OTP sending fails
        console.warn('Failed to send verification code:', otpErr);
      }

      // 3) Go to verify page regardless; user can resend code there
      navigate('/verify-code');
    } catch (err) {
      // Show specific backend message if available (e.g., "Email already exists")
      console.error('Registration failed:', err);
      const message = err?.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
    } finally {

      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  return (
    <AuthLayout title="Create Account" subtitle="Delicious food delivered to your door">
      <GoogleSignInButton onClick={handleGoogleSignIn} />

      <OrDivider />

      <ErrorAlert message={error} />

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
              className="w-full pl-12 pr-4 py-3 border-2 border-orange-200 rounded-xl bg-orange-50/30 text-base outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all"
            />
          </div>
        </div>

        {/* Password Input */}
        <PasswordInput
          label="Password"
          placeholder="Create a password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
        />

        {/* Confirm Password Input */}
        <PasswordInput
          label="Confirm Password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold text-base rounded-xl hover:from-orange-600 hover:to-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mt-6"
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>

      {/* Login Link */}
      <p className="text-center mt-6 text-sm text-gray-600">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-semibold text-orange-600 hover:text-orange-700 transition-colors"
        >
          Login
        </Link>
      </p>
    </AuthLayout>
  );
};

export default SignUpPage;
