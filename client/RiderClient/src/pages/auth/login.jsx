import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdDeliveryDining, MdVerified } from 'react-icons/md';
import { FaMotorcycle } from 'react-icons/fa';
import { login } from '../../api/auth';
import { loginSuccess } from '../../features/auth/authSlice';
import { getRiderProfile, getRiderStatus } from '../../api/profile';
import HeroImageSlider from '../../features/animation/heroImageSlider';
import logo from '../../assets/logo.png';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSuccessNotification, setShowSuccessNotification] = useState(false);
    
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector((state) => state.auth);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        try {
            const response = await login(formData);
            
            // Fetch actual rider profile and status from backend
            const [profileRes, statusRes] = await Promise.all([
                getRiderProfile(formData.email),
                getRiderStatus(formData.email)
            ]);
            
            const riderData = profileRes.data;
            const status = statusRes.data;
            
            // Set the actual status from backend (convert to lowercase for consistency)
            riderData.status = status.toLowerCase();
            
            // Dispatch login success action with real data
            dispatch(loginSuccess(riderData));
            
            // Show success notification
            setShowSuccessNotification(true);
            
            // Wait for animation then navigate to dashboard
            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);
            
        } catch (error) {
        console.error('Login error:', error);

        // Axios error check
        if (error.response && error.response.data) {
            const errorData = error.response.data;

            // Backend sent a message
            if (errorData.message) {
                setError(errorData.message);
            }
            // Backend sent field-level validation errors
            else if (typeof errorData === 'object') {
                const fieldErrors = Object.values(errorData).join(', ');
                setError(fieldErrors);
            }
            // Fallback
            else {
                setError("Login failed. Please check your credentials.");
            }
        }
        // Network error / server down
        else if (error.request) {
            setError("Server is not responding. Please try again later.");
        }
        // Unknown error
        else {
            setError("Something went wrong. Please try again.");
        }
        }finally {
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="min-h-screen flex bg-white">
            {/* Left Side - Hero Image Section (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-3/5 bg-gradient-to-br from-orange-50 to-yellow-50 relative">
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-yellow-400/20 z-10"></div>
                
                {/* Hero Image */}
                <div className="absolute inset-0 z-0">
                    {/* <img 
                        src="https://i.ibb.co/ZzChnCDX/image-1.png" 
                        alt="Yumy delivery driver handing food to customer"
                        className="w-full h-full object-cover"
                    /> */}
                    <HeroImageSlider/>                
                </div>
                
                {/* Content Overlay */}
                <div className="relative z-20 flex flex-col justify-between p-12 w-full h-full">
                    {/* Top Section */}
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-lg [-webkit-text-stroke:0.5px_black]">
                            Drive with <span className="text-yellow-300 [-webkit-text-stroke:0.5px_black]">Purpose</span>
                        </h1>
                    </div>
                    
                    {/* Bottom Section */}
                    <div className="text-center">
                        <div>
                            <p className="text-white text-lg mb-6 drop-shadow font-bold">
                                Join thousands of drivers earning with flexible schedules
                            </p>
                            <div className="grid grid-cols-2 gap-4 text-white/90">
                                <div className="bg-white/0 rounded-xl p-4">
                                    <div className="text-3xl font-bold text-yellow-300">5000+</div>
                                    <div className="text-sm">Active Drivers</div>
                                </div>
                                <div className="bg-white/0 rounded-xl p-4 ">
                                    <div className="text-3xl font-bold text-yellow-300">4.8★</div>
                                    <div className="text-sm">Average Rating</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-3/5 flex items-center justify-center p-4 lg:p-8 relative lg:bg-white overflow-hidden">
                {/* Mobile Background - Hero Image with Blur */}
                <div className="lg:hidden absolute inset-0 z-0">
                    <div className="absolute inset-0 opacity-90">
                        <HeroImageSlider />
                    </div>
                    <div className="absolute inset-0 backdrop-blur-sm bg-white/30"></div>
                </div>

                {/* Decorative Background Elements (Desktop Only) */}
                <div className="hidden lg:block absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-100 rounded-full opacity-30 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-100 rounded-full opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-100 rounded-full opacity-30 animate-blob animation-delay-4000"></div>
                </div>

                {/* Success Notification */}
                {showSuccessNotification && (
                    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
                        <div className="bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3">
                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                                <MdVerified className="h-5 w-5 text-green-500" />
                            </div>
                            <div>
                                <p className="font-semibold">Login Successful!</p>
                                <p className="text-sm opacity-90">Welcome back, redirecting...</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="relative z-30 w-full max-w-md">
                    {/* Header */}
                    <div className="text-center mb-8">
                        {/* Desktop Logo */}
                        <div className="hidden lg:flex lg:justify-center">
                            <Link 
                                to="/" 
                                className="inline-block cursor-pointer transition-all duration-300 hover:scale-110 hover:rotate-3 group animate-bounce-slow"
                            >
                                <img 
                                    src={logo} 
                                    alt="Yumy Logo" 
                                    className="h-28 w-28 object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-lg" 
                                />
                            </Link>
                        </div>
                        {/* Mobile Logo */}
                        <Link 
                            to="/"
                            className="inline-block lg:hidden cursor-pointer transition-all duration-300 hover:scale-110 hover:rotate-6 group animate-pulse-slow"
                        >
                            <img 
                                src={logo} 
                                alt="Yumy Logo" 
                                className="h-28 w-28 object-contain transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12 drop-shadow-lg" 
                            />
                        </Link>
                        {/* Desktop Header */}
                        <div className="hidden lg:block mb-6">
                            <h2 className="text-4xl font-bold text-gray-900 mb-2">
                                Welcome to <span className="text-orange-500 ">Yumy</span><span className="text-yellow-300 [-webkit-text-stroke:0.5px_black]">Driver</span>
                            </h2>
                            <p className="text-gray-500 text-sm mt-2">Driver Portal - Access your dashboard</p>
                        </div>
                        {/* Mobile Header */}
                        <div className="lg:hidden">
                            <h2 className="text-4xl font-bold text-gray-800 mb-2">
                                Welcome to Yumy
                            </h2>
                            <p className="text-gray-600 text-lg font-medium">
                                Driver Portal - Sign in to start delivering
                            </p>
                        </div>
                    </div>

                {/* Login Card */}
                <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-red-700 text-sm font-medium">{error}</p>
                        </div>
                    )}
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Email Field */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-gray-700 text-sm font-medium">
                                Email address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <MdEmail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-300"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-gray-700 text-sm font-medium">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <MdLock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-300"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition duration-200"
                                    onClick={togglePasswordVisibility}
                                >
                                    {showPassword ? (
                                        <MdVisibilityOff className="h-5 w-5" />
                                    ) : (
                                        <MdVisibility className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Form Options */}
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 bg-gray-50 text-orange-500 focus:ring-orange-500"
                                />
                                <label htmlFor="remember-me" className="text-gray-600">
                                    Remember me
                                </label>
                            </div>
                            <Link
                                to="/forgot-password"
                                className="text-orange-500 hover:text-orange-600 transition duration-200 font-medium"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl text-base font-bold text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing in...
                                </>
                            ) : (
                                'Sign in'
                            )}
                        </button>
                    </form>
                </div>
                
                {/* Sign Up Link */}
                <div className="text-center mt-8">
                    <p className="text-gray-600">
                        Don't have an account?{' '}
                        <Link
                            to="/register"
                            className="font-medium text-orange-500 hover:text-orange-600 transition duration-200 underline decoration-2 underline-offset-4"
                        >
                            Create account
                        </Link>
                    </p>
                </div>
                </div>
            </div>
        </div>
    );
};

export default Login;