import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MdLock, MdVerified, MdError, MdArrowBack, MdVisibility, MdVisibilityOff, MdTimer, MdCancel } from 'react-icons/md';
import { resetPassword } from '../../api/auth';

const ResetPassword = () => {
    const [formData, setFormData] = useState({
        otp: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [attemptsLeft, setAttemptsLeft] = useState(3);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
    const [showSuccessNotification, setShowSuccessNotification] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [] });
    
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || '';

    // Timer countdown
    useEffect(() => {
        if (timeLeft > 0 && !success) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0) {
            setError('OTP has expired. Please request a new one.');
        }
    }, [timeLeft, success]);

    // Redirect if no email provided
    useEffect(() => {
        if (!email) {
            navigate('/forgot-password');
        }
    }, [email, navigate]);

    // Password strength checker
    const checkPasswordStrength = (password) => {
        const checks = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        const passedChecks = Object.values(checks).filter(Boolean).length;
        
        return {
            score: passedChecks,
            checks: checks,
            feedback: Object.entries(checks).filter(([key, value]) => !value).map(([key]) => key)
        };
    };

    const getStrengthColor = (score) => {
        if (score < 2) return 'bg-red-500';
        if (score < 4) return 'bg-yellow-500';
        if (score < 5) return 'bg-blue-500';
        return 'bg-green-500';
    };

    const getStrengthText = (score) => {
        if (score < 2) return 'Weak';
        if (score < 4) return 'Fair';
        if (score < 5) return 'Good';
        return 'Excellent';
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'newPassword') {
            const strength = checkPasswordStrength(value);
            setPasswordStrength(strength);
        }
        
        setFormData({
            ...formData,
            [name]: value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Validation
        if (formData.otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP.');
            setIsLoading(false);
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match.');
            setIsLoading(false);
            return;
        }

        // Check password strength
        const strength = checkPasswordStrength(formData.newPassword);
        if (strength.score < 4) {
            setError('Password is too weak. Please ensure your password meets at least 4 out of 5 security requirements.');
            setIsLoading(false);
            return;
        }

        try {
            await resetPassword(email, formData.otp, formData.newPassword);
            
            setSuccess(true);
            setShowSuccessNotification(true);
            
            // Navigate to login after success
            setTimeout(() => {
                navigate('/login');
            }, 3000);
            
        } catch (error) {
            console.error('Reset password error:', error);
            
            const newAttemptsLeft = attemptsLeft - 1;
            setAttemptsLeft(newAttemptsLeft);
            
            if (error.response && error.response.data) {
                const errorData = error.response.data;
                // Handle both string and object error responses
                const errorMessage = typeof errorData === 'string' 
                    ? errorData 
                    : (errorData.message || 'Invalid OTP or expired. Please try again.');
                setError(errorMessage);
            } else {
                setError(error.message || 'Invalid OTP or expired. Please try again.');
            }
            
            if (newAttemptsLeft <= 0) {
                setError('Maximum attempts exceeded. Please request a new OTP.');
                setTimeout(() => {
                    navigate('/forgot-password');
                }, 2000);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = (field) => {
        if (field === 'password') {
            setShowPassword(!showPassword);
        } else {
            setShowConfirmPassword(!showConfirmPassword);
        }
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
                            <p className="font-semibold">Password Reset!</p>
                            <p className="text-sm opacity-90">Redirecting to login...</p>
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
                        to="/forgot-password"
                        className="inline-flex items-center text-orange-500 hover:text-orange-600 transition duration-200"
                    >
                        <MdArrowBack className="h-5 w-5 mr-2" />
                        Back to Forgot Password
                    </Link>
                </div>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl mb-6 shadow-lg">
                        <MdLock className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-4xl font-bold text-gray-800 mb-2">
                        Reset Password
                    </h2>
                    <p className="text-gray-600">
                        Enter the OTP sent to <span className="font-semibold text-orange-500">{email}</span>
                    </p>
                </div>

                {/* Timer and Attempts */}
                <div className="flex justify-between mb-6">
                    <div className="flex items-center bg-blue-50 px-3 py-2 rounded-lg">
                        <MdTimer className="h-4 w-4 text-blue-500 mr-2" />
                        <span className="text-sm font-medium text-blue-700">
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                    <div className="flex items-center bg-yellow-50 px-3 py-2 rounded-lg">
                        <span className="text-sm font-medium text-yellow-700">
                            {attemptsLeft} attempts left
                        </span>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
                    {success ? (
                        <div className="text-center py-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                                <MdVerified className="h-8 w-8 text-green-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3">
                                Password Reset Successful!
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Your password has been updated successfully.
                            </p>
                            <p className="text-sm text-gray-500">
                                Redirecting to login page...
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
                                {/* OTP Field */}
                                <div className="space-y-2">
                                    <label htmlFor="otp" className="text-gray-700 text-sm font-medium">
                                        6-Digit OTP
                                    </label>
                                    <input
                                        id="otp"
                                        name="otp"
                                        type="text"
                                        maxLength="6"
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-center text-lg font-mono placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-300"
                                        placeholder="000000"
                                        value={formData.otp}
                                        onChange={handleChange}
                                    />
                                </div>

                                {/* New Password Field */}
                                <div className="space-y-2">
                                    <label htmlFor="newPassword" className="text-gray-700 text-sm font-medium">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <MdLock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="newPassword"
                                            name="newPassword"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-300"
                                            placeholder="Enter new password"
                                            value={formData.newPassword}
                                            onChange={handleChange}
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition duration-200"
                                            onClick={() => togglePasswordVisibility('password')}
                                        >
                                            {showPassword ? (
                                                <MdVisibilityOff className="h-5 w-5" />
                                            ) : (
                                                <MdVisibility className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                    
                                    {/* Password Strength Indicator */}
                                    {formData.newPassword && (
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-gray-600">Password Strength:</span>
                                                <span className={`text-xs font-medium ${
                                                    passwordStrength.score < 2 ? 'text-red-600' :
                                                    passwordStrength.score < 4 ? 'text-yellow-600' :
                                                    passwordStrength.score < 5 ? 'text-blue-600' :
                                                    'text-green-600'
                                                }`}>
                                                    {getStrengthText(passwordStrength.score)}
                                                </span>
                                            </div>
                                            
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength.score)}`}
                                                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                                                ></div>
                                            </div>
                                            
                                            {passwordStrength.score < 4 && (
                                                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                                                    <p className="text-xs text-red-700 font-medium flex items-center">
                                                        <MdCancel className="h-4 w-4 mr-1" />
                                                        Password too weak! Please meet at least 4 requirements.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Confirm Password Field */}
                                <div className="space-y-2">
                                    <label htmlFor="confirmPassword" className="text-gray-700 text-sm font-medium">
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <MdLock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            required
                                            className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-300"
                                            placeholder="Confirm new password"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition duration-200"
                                            onClick={() => togglePasswordVisibility('confirm')}
                                        >
                                            {showConfirmPassword ? (
                                                <MdVisibilityOff className="h-5 w-5" />
                                            ) : (
                                                <MdVisibility className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={
                                        isLoading || 
                                        timeLeft === 0 || 
                                        attemptsLeft === 0 ||
                                        formData.otp.length !== 6 ||
                                        !formData.newPassword ||
                                        !formData.confirmPassword ||
                                        passwordStrength.score < 4
                                    }
                                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl text-base font-bold text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Resetting Password...
                                        </>
                                    ) : (
                                        'Reset Password'
                                    )}
                                </button>
                            </form>
                        </>
                    )}
                </div>
                
                {/* Links */}
                <div className="text-center mt-8 space-y-2">
                    <p className="text-gray-600 text-sm">
                        Didn't receive the OTP?{' '}
                        <Link
                            to="/forgot-password"
                            className="font-medium text-orange-500 hover:text-orange-600 transition duration-200"
                        >
                            Resend OTP
                        </Link>
                    </p>
                    <p className="text-gray-600 text-sm">
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

export default ResetPassword;