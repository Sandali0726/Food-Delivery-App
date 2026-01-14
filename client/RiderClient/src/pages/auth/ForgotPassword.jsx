import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdEmail, MdDeliveryDining, MdVerified, MdError, MdArrowBack } from 'react-icons/md';
import { forgetPassword } from '../../api/auth';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showSuccessNotification, setShowSuccessNotification] = useState(false);
    
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        try {
            await forgetPassword(email);
            
            // Show success state
            setSuccess(true);
            setShowSuccessNotification(true);
            
            // Navigate to reset password page after a delay
            setTimeout(() => {
                navigate('/reset-password', { state: { email } });
            }, 2000);
            
        } catch (error) {
            console.error('Forgot password error:', error);
            
            if (error.response && error.response.data) {
                const errorData = error.response.data;
                // Handle both string and object error responses
                const errorMessage = typeof errorData === 'string' 
                    ? errorData 
                    : (errorData.message || 'Failed to send OTP. Please try again.');
                setError(errorMessage);
            } else {
                setError(error.message || 'Failed to send OTP. Please check your email and try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        setEmail(e.target.value);
        setError('');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white p-4 relative overflow-hidden">
            {/* Success Notification */}
            {showSuccessNotification && (
                <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
                    <div className="bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                            <MdVerified className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                            <p className="font-semibold">OTP Sent!</p>
                            <p className="text-sm opacity-90">Check your email inbox</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Decorative Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-100 rounded-full opacity-30 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-100 rounded-full opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-100 rounded-full opacity-30 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Back Button */}
                <div className="mb-6">
                    <Link
                        to="/login"
                        className="inline-flex items-center text-orange-500 hover:text-orange-600 transition duration-200"
                    >
                        <MdArrowBack className="h-5 w-5 mr-2" />
                        Back to Login
                    </Link>
                </div>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl mb-6 shadow-lg">
                        <MdDeliveryDining className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-4xl font-bold text-gray-800 mb-2">
                        Forgot Password?
                    </h2>
                    <p className="text-gray-600 text-lg">
                        No worries! Enter your email and we'll send you an OTP to reset your password.
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
                    {success ? (
                        <div className="text-center py-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                                <MdVerified className="h-8 w-8 text-green-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3">
                                OTP Sent Successfully!
                            </h3>
                            <p className="text-gray-600 mb-4">
                                We've sent a 6-digit OTP to <span className="font-semibold text-orange-500">{email}</span>
                            </p>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                                <p className="text-yellow-800 text-sm">
                                    <span className="font-semibold">⏰ Note:</span> OTP expires in 5 minutes. 
                                    You have 3 attempts to enter the correct OTP.
                                </p>
                            </div>
                            <p className="text-sm text-gray-500">
                                Redirecting to password reset page...
                            </p>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center">
                                    <MdError className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
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
                                            placeholder="Enter your email address"
                                            value={email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Enter the email address associated with your driver account.
                                    </p>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading || !email.trim()}
                                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl text-base font-bold text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Sending OTP...
                                        </>
                                    ) : (
                                        'Send OTP'
                                    )}
                                </button>
                            </form>

                            {/* Info Box */}
                            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <h4 className="text-blue-800 font-semibold mb-2">How it works:</h4>
                                <ul className="text-blue-700 text-sm space-y-1">
                                    <li>• We'll send a 6-digit OTP to your email</li>
                                    <li>• OTP is valid for 5 minutes</li>
                                    <li>• You get 3 attempts to enter the correct OTP</li>
                                    <li>• Create a new secure password once verified</li>
                                </ul>
                            </div>
                        </>
                    )}
                </div>
                
                {/* Sign In Link */}
                <div className="text-center mt-8">
                    <p className="text-gray-600">
                        Remember your password?{' '}
                        <Link
                            to="/login"
                            className="font-medium text-orange-500 hover:text-orange-600 transition duration-200 underline decoration-2 underline-offset-4"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;