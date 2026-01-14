import { useState } from 'react';
import { ChefHat } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { registerRestaurant } from '../api/authApi';
import AuthDto from '../models/AuthDto';
import LoginImage from '../assets/Login.webp';

const SignupPage = () => {
  const navigate = useNavigate();
  
  // Use AuthDto for type-safe backend communication
  const [authDto, setAuthDto] = useState(new AuthDto());
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAuthDto(prev => {
      const updated = new AuthDto(prev);
      updated[name] = value;
      return updated;
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async () => {
    // Validate using AuthDto's built-in validation
    const validation = authDto.validate();
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      setSubmitting(true);
      setErrors({});
      
      // Send AuthDto to backend
      await registerRestaurant(authDto);
      
      // Redirect to OTP verification page with email
      navigate('/verify-otp', { state: { email: authDto.email } });
    } catch (err) {
      const msg = err?.response?.data?.message || 'Registration failed. Please try again.';
      setErrors({ submit: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${LoginImage})` }}
    >
      {/* Blur overlay for image only, no color wash */}
      <div className="absolute inset-0 z-0" style={{backdropFilter: 'blur(8px)'}}></div>
      {/* Vignette overlay for vintage effect */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-radial from-transparent via-black/10 to-black/60"></div>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative z-20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <ChefHat className="w-10 h-10 text-orange-600" />
            <span className="text-3xl font-bold text-gray-800">Yumy</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Register Your Restaurant</h2>
          <p className="text-gray-600 mt-2">Start delivering in minutes</p>
        </div>

        <div className="space-y-4">
          {errors.submit && (
            <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">
              {errors.submit}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={authDto.email}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition`}
              placeholder="your@email.com"
              disabled={submitting}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={authDto.password}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition`}
              placeholder="••••••••"
              disabled={submitting}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`w-full py-3 text-white rounded-lg font-semibold transition shadow-lg ${submitting ? 'bg-orange-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'}`}
          >
            {submitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </div>

        <p className="text-center mt-6 text-gray-600">
          Already have an account?{' '}
          <button 
            onClick={() => navigate('/login')}
            className="text-orange-600 font-semibold hover:text-orange-700"
          >
            Login
          </button>
        </p>

        <button 
          onClick={() => navigate('/')}
          className="w-full mt-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
};

export default SignupPage;