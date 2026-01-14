import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { register } from '../../api/auth';
import { sendEmailOtp, verifyEmailOtp, resendEmailOtp } from '../../api/emailVerification';
import { loginSuccess } from '../../features/auth/authSlice';
import { 
    MdEmail, 
    MdLock, 
    MdVisibility, 
    MdVisibilityOff, 
    MdPerson,
    MdPhone,
    MdLocationOn,
    MdImage,
    MdCardMembership,
    MdDirectionsCar,
    MdDeliveryDining,
    MdMyLocation,
    MdSearch,
    MdCancel,
    MdVerified
} from 'react-icons/md';

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirm_password: '',
        first_name: '',
        last_name: '',
        phone_number: '',
        address: '',
        img_url: '',
        licence: '',
        vehicle_no: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [addressSearchValue, setAddressSearchValue] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [showManualInput, setShowManualInput] = useState(false);
    const [error, setError] = useState(''); // Deprecated - using toast system now
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [showSuccessNotification, setShowSuccessNotification] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [] });
    const [showPasswordRecommendations, setShowPasswordRecommendations] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpError, setOtpError] = useState('');
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isResendingOtp, setIsResendingOtp] = useState(false);
    const [otpCooldown, setOtpCooldown] = useState(0);
    const [toasts, setToasts] = useState([]);
    
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Toast notification functions
    const showToast = (message, type = 'error', duration = 5000) => {
        const id = Date.now() + Math.random();
        const newToast = { id, message, type, duration };
        setToasts(prev => [...prev, newToast]);
        
        // Auto remove toast after duration
        setTimeout(() => {
            removeToast(id);
        }, duration);
    };
    
    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };
    
    const showError = (message) => showToast(message, 'error');
    const showSuccess = (message) => showToast(message, 'success');
    const showWarning = (message) => showToast(message, 'warning');
    const showInfo = (message) => showToast(message, 'info');

    const checkPasswordStrength = (password) => {
        const checks = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };
        
        const passedChecks = Object.values(checks).filter(Boolean).length;
        const feedback = [];
        
        if (!checks.length) feedback.push("At least 8 characters");
        if (!checks.uppercase) feedback.push("One uppercase letter");
        if (!checks.lowercase) feedback.push("One lowercase letter");
        if (!checks.number) feedback.push("One number");
        if (!checks.special) feedback.push("One special character");
        
        return {
            score: passedChecks,
            feedback,
            checks
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
        return 'Strong';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Validate phone number length (max 10 digits)
        if (name === 'phone_number') {
            const numericValue = value.replace(/\D/g, ''); // Remove non-digits
            if (numericValue.length > 10) {
                return; // Don't update if more than 10 digits
            }
            setFormData({
                ...formData,
                [name]: numericValue
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
        
        // Check password strength when password field changes
        if (name === 'password') {
            const strength = checkPasswordStrength(value);
            setPasswordStrength(strength);
            setShowPasswordRecommendations(value.length > 0);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            // Create preview URL
            const previewUrl = URL.createObjectURL(file);
            setFilePreview(previewUrl);
        }
    };

    const removeFile = () => {
        setSelectedFile(null);
        if (filePreview) {
            URL.revokeObjectURL(filePreview);
            setFilePreview(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        // Validate that file is selected
        if (!selectedFile) {
            showError('Please select a profile image.');
            setIsLoading(false);
            return;
        }
        
        // Validate password confirmation
        if (formData.password !== formData.confirm_password) {
            showError('Passwords do not match. Please check and try again.');
            setIsLoading(false);
            return;
        }
        
        // Validate password strength
        const strength = checkPasswordStrength(formData.password);
        if (strength.score < 4) {
            showError('Password is too weak. Please ensure your password meets at least 4 out of 5 security requirements.');
            setIsLoading(false);
            return;
        }
        
        // Validate phone number
        if (formData.phone_number.length !== 10) {
            showError('Phone number must be exactly 10 digits.');
            setIsLoading(false);
            return;
        }
        
        try {
            // Create multipart form data
            const multipartFormData = new FormData();
            
            // Add JSON data as string (matching your controller format)
            const jsonData = {
                email: formData.email,
                password: formData.password,
                first_name: formData.first_name,
                last_name: formData.last_name,
                phone_number: formData.phone_number,
                address: formData.address,
                licence: formData.licence,
                vehicle_no: formData.vehicle_no
            };
            
            multipartFormData.append('data', JSON.stringify(jsonData));
            multipartFormData.append('file', selectedFile);
            
            const response = await register(multipartFormData);
            
            // Show success notification
            setShowSuccessNotification(true);
            
            // Wait for animation then navigate to login
            setTimeout(() => {
                navigate('/login');
            }, 2000);
            
        } catch (error) {
            console.error('Registration error:', error);
            
            // Handle validation errors from backend
            if (error.response && error.response.data) {
                const errorData = error.response.data;
                
                // Check if it's a validation error object with field-specific errors
                if (typeof errorData === 'object' && !errorData.message) {
                    // Extract field validation errors
                    const fieldErrors = Object.entries(errorData)
                        .map(([field, message]) => `${field}: ${message}`)
                        .join(', ');
                    showError(fieldErrors);
                } else {
                    // Handle general error message
                    showError(errorData.message || 'Registration failed. Please try again.');
                }
            } else {
                showError('Registration failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const nextStep = async () => {
        if (currentStep === 1) {
            // Validate step 1 fields before sending OTP
            const step1Fields = ['first_name', 'last_name', 'email', 'phone_number', 'password'];
            const missingFields = step1Fields.filter(field => !formData[field].trim());
            
            if (missingFields.length > 0) {
                showError(`Please fill  all fields`);
                return;
            }
            
            // Validate phone number has exactly 10 digits
            if (formData.phone_number.length !== 10) {
                showError('Phone number must be exactly 10 digits');
                return;
            }
            
            // Check password strength
            const strength = checkPasswordStrength(formData.password);
            if (strength.score < 4) {
                showError('Password is too weak. Please ensure your password meets at least 4 out of 5 security requirements.');
                return;
            }
            
            // If email is not verified, send OTP
            if (!isEmailVerified) {
                await sendOtpToEmail();
                return;
            }
        }
        
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };
    
    // Email verification functions
    const sendOtpToEmail = async () => {
        setIsSendingOtp(true);
        
        try {
            await sendEmailOtp(formData.email);
            setShowOtpModal(true);
            showInfo('Verification code sent to your email!');
        } catch (error) {
            console.error('Error sending OTP:', error);
            showError(error.response?.data?.message || 'Failed to send verification email. Please try again.');
        } finally {
            setIsSendingOtp(false);
        }
    };
    
    const verifyOtp = async () => {
        if (!otp.trim()) {
            setOtpError('Please enter the OTP');
            return;
        }
        
        setIsVerifyingOtp(true);
        setOtpError('');
        
        try {
            await verifyEmailOtp(formData.email, otp);
            setIsEmailVerified(true);
            setShowOtpModal(false);
            setOtp('');
            setCurrentStep(2); // Move to next step after verification
        } catch (error) {
            console.error('Error verifying OTP:', error);
            setOtpError(error.response?.data?.message || 'Invalid OTP. Please try again.');
        } finally {
            setIsVerifyingOtp(false);
        }
    };
    
    const resendOtp = async () => {
        setIsResendingOtp(true);
        setOtpError('');
        
        try {
            await resendEmailOtp(formData.email);
            setOtpCooldown(60); // 60 second cooldown
            
            // Start countdown
            const interval = setInterval(() => {
                setOtpCooldown(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            
        } catch (error) {
            console.error('Error resending OTP:', error);
            setOtpError(error.response?.data?.message || 'Failed to resend OTP. Please try again.');
        } finally {
            setIsResendingOtp(false);
        }
    };
    
    const closeOtpModal = () => {
        setShowOtpModal(false);
        setOtp('');
        setOtpError('');
    };

    const getCurrentLocation = () => {
        setIsLoadingLocation(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const address = await reverseGeocode(position.coords.latitude, position.coords.longitude);
                        setFormData({
                            ...formData,
                            address: address
                        });
                        setAddressSearchValue(address);
                    } catch (error) {
                        console.error('Error getting address:', error);
                    }
                    setIsLoadingLocation(false);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    alert('Unable to get your current location. Please enter your address manually.');
                    setIsLoadingLocation(false);
                }
            );
        } else {
            alert('Geolocation is not supported by this browser. Please enter your address manually.');
            setIsLoadingLocation(false);
        }
    };

    const searchAddresses = async (query) => {
        if (query.length < 3) {
            setSearchResults([]);
            return;
        }
        
        setIsSearching(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
            );
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error('Error searching addresses:', error);
            setSearchResults([]);
        }
        setIsSearching(false);
    };

    const selectAddress = (result) => {
        const selectedAddr = result.display_name;
        setFormData({
            ...formData,
            address: selectedAddr
        });
        setAddressSearchValue(selectedAddr);
        setSearchResults([]);
        setShowManualInput(false);
    };

    const reverseGeocode = async (lat, lng) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();
            return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        } catch (error) {
            console.error('Error reverse geocoding:', error);
            return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        }
    };

    const handleAddressSearch = (e) => {
        const value = e.target.value;
        setAddressSearchValue(value);
        if (value.length > 0) {
            searchAddresses(value);
        } else {
            setSearchResults([]);
        }
    };

    // Debounce address search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (addressSearchValue && addressSearchValue.length > 2) {
                searchAddresses(addressSearchValue);
            }
        }, 300);
        
        return () => clearTimeout(timer);
    }, [addressSearchValue]);

    // Cleanup file preview URL on component unmount
    useEffect(() => {
        return () => {
            if (filePreview) {
                URL.revokeObjectURL(filePreview);
            }
        };
    }, [filePreview]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-white p-4 relative overflow-hidden">
            <style jsx>{`
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes slideOutRight {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
                
                .animate-slide-in-right {
                    animation: slideInRight 0.5s ease-out forwards;
                }
                
                .animate-slide-out-right {
                    animation: slideOutRight 0.3s ease-in forwards;
                }
                
                .toast-enter {
                    transform: translateX(100%);
                    opacity: 0;
                }
                
                .toast-enter-active {
                    transform: translateX(0);
                    opacity: 1;
                    transition: all 0.5s ease-out;
                }
                
                .toast-exit {
                    transform: translateX(0);
                    opacity: 1;
                }
                
                .toast-exit-active {
                    transform: translateX(100%);
                    opacity: 0;
                    transition: all 0.3s ease-in;
                }
            `}</style>
            {/* Success Notification */}
            {showSuccessNotification && (
                <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
                    <div className="bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                            <MdVerified className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                            <p className="font-semibold">Registration Successful!</p>
                            <p className="text-sm opacity-90">Redirecting to login page...</p>
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

            <div className="relative z-10 w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl mb-6 shadow-lg">
                        <MdDeliveryDining className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-4xl font-bold text-gray-800 mb-2">
                        Join Yumy Drivers
                    </h2>
                    <p className="text-gray-600 text-lg font-medium">
                        Create your driver account and start earning
                    </p>
                </div>

                {/* Progress Indicator */}
                <div className="flex justify-center mb-8">
                    <div className="flex items-center space-x-4">
                        {[1, 2, 3].map((step) => {
                            let stepStatus = currentStep >= step;
                            // Special case for step 1 - only complete if email is verified
                            if (step === 1) {
                                stepStatus = isEmailVerified;
                            }
                            
                            return (
                                <div key={step} className="flex items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium relative ${
                                        stepStatus
                                            ? 'bg-orange-500 text-white' 
                                            : currentStep === step
                                            ? 'bg-orange-100 text-orange-500 border-2 border-orange-500'
                                            : 'bg-gray-200 text-gray-500'
                                    }`}>
                                        {step === 1 && isEmailVerified ? (
                                            <MdVerified className="h-4 w-4" />
                                        ) : (
                                            step
                                        )}
                                    </div>
                                    {step < 3 && (
                                        <div className={`w-12 h-1 mx-2 ${
                                            (step === 1 && isEmailVerified) || (step === 2 && currentStep > 2) 
                                                ? 'bg-orange-500' 
                                                : 'bg-gray-200'
                                        }`}></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Toast Notifications */}
                <div className="fixed top-4 right-4 z-50 space-y-2">
                    {toasts.map((toast) => (
                        <div
                            key={toast.id}
                            className={`transform transition-all duration-500 ease-in-out animate-slide-in-right max-w-md w-full shadow-2xl rounded-xl overflow-hidden ${
                                toast.type === 'error' ? 'bg-gradient-to-r from-red-500 via-red-600 to-red-700 border-l-4 border-red-800' :
                                toast.type === 'success' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                                toast.type === 'warning' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                                'bg-gradient-to-r from-blue-500 to-blue-600'
                            } ${toast.type === 'error' ? 'shadow-red-500/25' : ''}`}
                        >
                            <div className="p-4 flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                    {toast.type === 'error' && (
                                        <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center relative">
                                            <div className="relative z-10 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                                                <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        </div>
                                    )}
                                    {toast.type === 'success' && (
                                        <div className="w-8 h-8 flex items-center justify-center">
                                            <span className="text-2xl animate-bounce">✅</span>
                                        </div>
                                    )}
                                    {toast.type === 'warning' && (
                                        <div className="w-8 h-8 flex items-center justify-center">
                                            <span className="text-2xl animate-pulse">⚠️</span>
                                        </div>
                                    )}
                                    {toast.type === 'info' && (
                                        <div className="w-8 h-8 flex items-center justify-center">
                                            <span className="text-2xl">ℹ️</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    {toast.type === 'error' && (
                                        <div>
                                            <div className="flex items-center space-x-2 mb-1">
                                                <span className="text-white font-bold text-sm tracking-wide uppercase">Error</span>
                                            </div>
                                            <p className="text-white text-sm leading-relaxed font-medium">
                                                {toast.message}
                                            </p>
                                        </div>
                                    )}
                                    {toast.type !== 'error' && (
                                        <p className="text-white font-medium text-sm leading-relaxed">
                                            {toast.message}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => removeToast(toast.id)}
                                    className={`flex-shrink-0 transition-colors duration-200 rounded-full p-1 ${
                                        toast.type === 'error' 
                                            ? 'text-white hover:text-red-200 hover:bg-white hover:bg-opacity-20 hover:scale-110 transform' 
                                            : 'text-white hover:text-gray-200 hover:bg-white hover:bg-opacity-10'
                                    }`}
                                    title="Dismiss"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Registration Card */}
                <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        
                        {/* Step 1: Personal Information */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h3>
                                
                                {/* First Name & Last Name */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="first_name" className="text-gray-700 text-sm font-medium">
                                            First Name
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <MdPerson className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                id="first_name"
                                                name="first_name"
                                                type="text"
                                                required
                                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-300"
                                                placeholder="Enter first name"
                                                value={formData.first_name}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="last_name" className="text-gray-700 text-sm font-medium">
                                            Last Name
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <MdPerson className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                id="last_name"
                                                name="last_name"
                                                type="text"
                                                required
                                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-300"
                                                placeholder="Enter last name"
                                                value={formData.last_name}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-gray-700 text-sm font-medium">
                                        Email Address
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
                                    
                                    {/* Email Verification Status */}
                                    {isEmailVerified && (
                                        <div className="flex items-center space-x-2 mt-2">
                                            <MdVerified className="h-5 w-5 text-green-500" />
                                            <span className="text-sm text-green-600 font-medium">Email verified successfully!</span>
                                        </div>
                                    )}
                                </div>

                                {/* Phone Number */}
                                <div className="space-y-2">
                                    <label htmlFor="phone_number" className="text-gray-700 text-sm font-medium">
                                        Phone Number
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <MdPhone className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="phone_number"
                                            name="phone_number"
                                            type="tel"
                                            required
                                            maxLength="10"
                                            pattern="[0-9]{10}"
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-300"
                                            placeholder="Enter phone number"
                                            value={formData.phone_number}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    {/* <p className="text-xs text-gray-500 mt-1">
                                        Enter exactly 10 digits (e.g., 0771234567)
                                    </p> */}
                                </div>

                                {/* Password */}
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
                                            placeholder="Create a password"
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
                                    
                                    {/* Password Strength Indicator */}
                                    {showPasswordRecommendations && (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-600">Password Strength:</span>
                                                <span className={`text-sm font-semibold ${
                                                    passwordStrength.score < 2 ? 'text-red-600' :
                                                    passwordStrength.score < 4 ? 'text-yellow-600' :
                                                    passwordStrength.score < 5 ? 'text-blue-600' : 'text-green-600'
                                                }`}>
                                                    {getStrengthText(passwordStrength.score)}
                                                </span>
                                            </div>
                                            
                                            {/* Strength Progress Bar */}
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength.score)}`}
                                                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                                                ></div>
                                            </div>
                                            
                                            {/* Password Requirements */}
                                            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                                <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
                                                <div className="grid grid-cols-1 gap-1">
                                                    <div className={`flex items-center text-xs ${
                                                        passwordStrength.checks?.length ? 'text-green-600' : 'text-gray-500'
                                                    }`}>
                                                        <span className={`mr-2 w-4 h-4 rounded-full flex items-center justify-center ${
                                                            passwordStrength.checks?.length ? 'bg-green-500' : 'bg-gray-300'
                                                        }`}>
                                                            {passwordStrength.checks?.length ? '✓' : '○'}
                                                        </span>
                                                        At least 8 characters
                                                    </div>
                                                    <div className={`flex items-center text-xs ${
                                                        passwordStrength.checks?.uppercase ? 'text-green-600' : 'text-gray-500'
                                                    }`}>
                                                        <span className={`mr-2 w-4 h-4 rounded-full flex items-center justify-center ${
                                                            passwordStrength.checks?.uppercase ? 'bg-green-500' : 'bg-gray-300'
                                                        }`}>
                                                            {passwordStrength.checks?.uppercase ? '✓' : '○'}
                                                        </span>
                                                        One uppercase letter (A-Z)
                                                    </div>
                                                    <div className={`flex items-center text-xs ${
                                                        passwordStrength.checks?.lowercase ? 'text-green-600' : 'text-gray-500'
                                                    }`}>
                                                        <span className={`mr-2 w-4 h-4 rounded-full flex items-center justify-center ${
                                                            passwordStrength.checks?.lowercase ? 'bg-green-500' : 'bg-gray-300'
                                                        }`}>
                                                            {passwordStrength.checks?.lowercase ? '✓' : '○'}
                                                        </span>
                                                        One lowercase letter (a-z)
                                                    </div>
                                                    <div className={`flex items-center text-xs ${
                                                        passwordStrength.checks?.number ? 'text-green-600' : 'text-gray-500'
                                                    }`}>
                                                        <span className={`mr-2 w-4 h-4 rounded-full flex items-center justify-center ${
                                                            passwordStrength.checks?.number ? 'bg-green-500' : 'bg-gray-300'
                                                        }`}>
                                                            {passwordStrength.checks?.number ? '✓' : '○'}
                                                        </span>
                                                        One number (0-9)
                                                    </div>
                                                    <div className={`flex items-center text-xs ${
                                                        passwordStrength.checks?.special ? 'text-green-600' : 'text-gray-500'
                                                    }`}>
                                                        <span className={`mr-2 w-4 h-4 rounded-full flex items-center justify-center ${
                                                            passwordStrength.checks?.special ? 'bg-green-500' : 'bg-gray-300'
                                                        }`}>
                                                            {passwordStrength.checks?.special ? '✓' : '○'}
                                                        </span>
                                                        One special character (!@#$%^&*)
                                                    </div>
                                                </div>
                                                
                                                {passwordStrength.score === 5 && (
                                                    <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                                                        <p className="text-xs text-green-700 font-medium flex items-center">
                                                            <MdVerified className="h-4 w-4 mr-1" />
                                                            Excellent! Your password is strong and secure.
                                                        </p>
                                                    </div>
                                                )}
                                                
                                                {passwordStrength.score < 4 && formData.password.length > 0 && (
                                                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                                                        <p className="text-xs text-red-700 font-medium flex items-center">
                                                            <MdCancel className="h-4 w-4 mr-1" />
                                                            Password too weak! Please meet at least 4 requirements to continue.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-2">
                                    <label htmlFor="confirm_password" className="text-gray-700 text-sm font-medium">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <MdLock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="confirm_password"
                                            name="confirm_password"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-300"
                                            placeholder="Confirm your password"
                                            value={formData.confirm_password}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    
                                    {/* Password Match Indicator */}
                                    {formData.confirm_password && (
                                        <div className={`flex items-center space-x-2 mt-2`}>
                                            {formData.password === formData.confirm_password ? (
                                                <>
                                                    <MdVerified className="h-4 w-4 text-green-500" />
                                                    <span className="text-sm text-green-600 font-medium">Passwords match</span>
                                                </>
                                            ) : (
                                                <>
                                                    <MdCancel className="h-4 w-4 text-red-500" />
                                                    <span className="text-sm text-red-600 font-medium">Passwords do not match</span>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Location & Profile */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4">Location & Profile</h3>
                                
                                {/* Address */}
                                <div className="space-y-4">
                                    <label className="text-gray-700 text-sm font-medium">
                                        Your Address
                                    </label>
                                    
                                    {/* Toggle between search and manual input */}
                                    <div className="flex gap-2 mb-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowManualInput(false)}
                                            className={`px-3 py-1 text-xs font-medium rounded-lg transition duration-200 ${
                                                !showManualInput 
                                                    ? 'bg-orange-500 text-white' 
                                                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                            }`}
                                        >
                                            Search Address
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowManualInput(true)}
                                            className={`px-3 py-1 text-xs font-medium rounded-lg transition duration-200 ${
                                                showManualInput 
                                                    ? 'bg-orange-500 text-white' 
                                                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                            }`}
                                        >
                                            Enter Manually
                                        </button>
                                    </div>

                                    {/* Address Search Input */}
                                    {!showManualInput ? (
                                        <>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <MdSearch className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="Search for your address..."
                                                    value={addressSearchValue}
                                                    onChange={handleAddressSearch}
                                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-300"
                                                />
                                                {isSearching && (
                                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                                                        <svg className="animate-spin h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Search Results */}
                                            {searchResults.length > 0 && (
                                                <div className="bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                                                    {searchResults.map((result, index) => (
                                                        <button
                                                            key={index}
                                                            type="button"
                                                            onClick={() => selectAddress(result)}
                                                            className="w-full text-left px-4 py-3 hover:bg-orange-50 border-b border-gray-100 last:border-b-0 transition duration-200"
                                                        >
                                                            <div className="flex items-start">
                                                                <MdLocationOn className="h-5 w-5 text-orange-500 mt-0.5 mr-3 flex-shrink-0" />
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-800">{result.display_name}</p>
                                                                    {result.type && (
                                                                        <p className="text-xs text-gray-500 capitalize">{result.type}</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        /* Manual Address Input */
                                        <div className="relative">
                                            <div className="absolute top-3 left-4 pointer-events-none">
                                                <MdLocationOn className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <textarea
                                                name="address"
                                                placeholder="Enter your full address..."
                                                value={formData.address}
                                                onChange={handleChange}
                                                rows={3}
                                                required
                                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-300 resize-none"
                                            />
                                        </div>
                                    )}
                                    
                                    {/* Selected Address Display */}
                                    {formData.address && (
                                        <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                                            <div className="flex items-start">
                                                <MdLocationOn className="h-5 w-5 text-orange-500 mt-0.5 mr-3 flex-shrink-0" />
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-800">Your Address:</p>
                                                    <p className="text-sm text-gray-700 mt-1">{formData.address}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Current Location Button */}
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={getCurrentLocation}
                                            disabled={isLoadingLocation}
                                            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition duration-200 disabled:opacity-50"
                                        >
                                            {isLoadingLocation ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Getting Address...
                                                </>
                                            ) : (
                                                <>
                                                    <MdMyLocation className="h-4 w-4 mr-2" />
                                                    Use Current Location
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    
                                    <p className="text-xs text-gray-500">
                                        Search for your address, enter it manually, or use your current location
                                    </p>
                                </div>

                                {/* Profile Image Upload */}
                                <div className="space-y-4">
                                    <label className="text-gray-700 text-sm font-medium">
                                        Profile Image
                                    </label>
                                    
                                    {!selectedFile ? (
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                required
                                            />
                                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-orange-400 transition duration-300">
                                                <MdImage className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                                <p className="text-gray-600 font-medium mb-2">Click to upload profile image</p>
                                                <p className="text-gray-500 text-sm">PNG, JPG, JPEG up to 5MB</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-200">
                                                    <img
                                                        src={filePreview}
                                                        alt="Profile preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-800">{selectedFile.name}</p>
                                                    <p className="text-gray-500 text-sm">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={removeFile}
                                                    className="text-red-500 hover:text-red-700 transition duration-200"
                                                >
                                                    <MdCancel className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <p className="text-xs text-gray-500">
                                        Upload a clear photo of yourself for your driver profile
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Vehicle & License */}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4">Vehicle & License Information</h3>
                                
                                {/* License */}
                                <div className="space-y-2">
                                    <label htmlFor="licence" className="text-gray-700 text-sm font-medium">
                                        Driver's License Number
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <MdCardMembership className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="licence"
                                            name="licence"
                                            type="text"
                                            required
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-300"
                                            placeholder="Enter license number"
                                            value={formData.licence}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                {/* Vehicle Number */}
                                <div className="space-y-2">
                                    <label htmlFor="vehicle_no" className="text-gray-700 text-sm font-medium">
                                        Vehicle Registration Number
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <MdDirectionsCar className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="vehicle_no"
                                            name="vehicle_no"
                                            type="text"
                                            required
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-300"
                                            placeholder="Enter vehicle number"
                                            value={formData.vehicle_no}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                {/* Terms and Conditions */}
                                <div className="flex items-start space-x-3 p-4 bg-orange-50 rounded-xl">
                                    <input
                                        type="checkbox"
                                        id="terms"
                                        required
                                        className="h-4 w-4 rounded border-gray-300 bg-white text-orange-500 focus:ring-orange-500 mt-1"
                                    />
                                    <label htmlFor="terms" className="text-sm text-gray-700">
                                        I agree to the{' '}
                                        <Link to="/terms" className="text-orange-500 hover:text-orange-600 font-medium">
                                            Terms of Service
                                        </Link>{' '}
                                        and{' '}
                                        <Link to="/privacy" className="text-orange-500 hover:text-orange-600 font-medium">
                                            Privacy Policy
                                        </Link>
                                        . I confirm that all provided information is accurate and I have a valid driver's license.
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between pt-4">
                            {currentStep > 1 && (
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition duration-300"
                                >
                                    Previous
                                </button>
                            )}
                            
                            <div className="ml-auto">
                                {currentStep < 3 ? (
                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        disabled={isSendingOtp}
                                        className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {currentStep === 1 && !isEmailVerified ? (
                                            isSendingOtp ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Sending OTP...
                                                </>
                                            ) : (
                                                'Verify Email'
                                            )
                                        ) : (
                                            'Next'
                                        )}
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={isLoading || (formData.password && passwordStrength.score < 4)}
                                        className="px-8 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg font-bold"
                                    >
                                        {isLoading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Creating Account...
                                            </>
                                        ) : (
                                            'Create Driver Account'
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
                
                {/* OTP Verification Modal */}
                {showOtpModal && (

                    
                    <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50 p-4">
                        
                        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-6">
                                    <MdEmail className="h-8 w-8 text-orange-500" />
                                </div>
                                
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                    Verify Your Email
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    We've sent a 6-digit verification code to <br />
                                    <span className="font-semibold text-gray-800">{formData.email}</span>
                                </p>
                                
                                <div className="space-y-4">
                                    <div>
                                        <input
                                            type="text"
                                            placeholder="Enter 6-digit OTP"
                                            value={otp}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                                setOtp(value);
                                                if (otpError) setOtpError('');
                                            }}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-center text-lg font-semibold tracking-wider focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-300"
                                            maxLength={6}
                                        />
                                    </div>
                                    
                                    {otpError && (
                                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                                            <p className="text-red-700 text-sm font-medium">{otpError}</p>
                                        </div>
                                    )}
                                    
                                    <div className="space-y-3">
                                        <button
                                            onClick={verifyOtp}
                                            disabled={isVerifyingOtp || otp.length !== 6}
                                            className="w-full px-4 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                        >
                                            {isVerifyingOtp ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Verifying...
                                                </>
                                            ) : (
                                                'Verify Email'
                                            )}
                                        </button>
                                        
                                        <div className="flex justify-between items-center">
                                            <button
                                                onClick={resendOtp}
                                                disabled={isResendingOtp || otpCooldown > 0}
                                                className="text-orange-500 hover:text-orange-600 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isResendingOtp ? (
                                                    'Sending...'
                                                ) : otpCooldown > 0 ? (
                                                    `Resend in ${otpCooldown}s`
                                                ) : (
                                                    'Resend OTP'
                                                )}
                                            </button>
                                            
                                            <button
                                                onClick={closeOtpModal}
                                                className="text-gray-500 hover:text-gray-700 font-medium text-sm"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                    <p className="text-blue-700 text-xs">
                                        <strong>Tip:</strong> Check your spam/junk folder if you don't receive the email within a few minutes.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* OTP Verification Modal */}
                {/* {showOtpModal && (
                    <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-6">
                                    <MdEmail className="h-8 w-8 text-orange-500" />
                                </div>
                                
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                    Verify Your Email
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    We've sent a 6-digit verification code to <br />
                                    <span className="font-semibold text-gray-800">{formData.email}</span>
                                </p>
                                
                                <div className="space-y-4">
                                    <div>
                                        <input
                                            type="text"
                                            placeholder="Enter 6-digit OTP"
                                            value={otp}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                                setOtp(value);
                                                if (otpError) setOtpError('');
                                            }}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-center text-lg font-semibold tracking-wider focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-300"
                                            maxLength={6}
                                        />
                                    </div>
                                    
                                    {otpError && (
                                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                                            <p className="text-red-700 text-sm font-medium">{otpError}</p>
                                        </div>
                                    )}
                                    
                                    <div className="space-y-3">
                                        <button
                                            onClick={verifyOtp}
                                            disabled={isVerifyingOtp || otp.length !== 6}
                                            className="w-full px-4 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                        >
                                            {isVerifyingOtp ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Verifying...
                                                </>
                                            ) : (
                                                'Verify Email'
                                            )}
                                        </button>
                                        
                                        <div className="flex justify-between items-center">
                                            <button
                                                onClick={resendOtp}
                                                disabled={isResendingOtp || otpCooldown > 0}
                                                className="text-orange-500 hover:text-orange-600 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isResendingOtp ? (
                                                    'Sending...'
                                                ) : otpCooldown > 0 ? (
                                                    `Resend in ${otpCooldown}s`
                                                ) : (
                                                    'Resend OTP'
                                                )}
                                            </button>
                                            
                                            <button
                                                onClick={closeOtpModal}
                                                className="text-gray-500 hover:text-gray-700 font-medium text-sm"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                    <p className="text-blue-700 text-xs">
                                        <strong>Tip:</strong> Check your spam/junk folder if you don't receive the email within a few minutes.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )} */}
                
                {/* Sign In Link */}
                <div className="text-center mt-8">
                    <p className="text-gray-600">
                        Already have an account?{' '}
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

export default Register;