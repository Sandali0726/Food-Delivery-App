import React, { useState, useRef, useEffect } from 'react';
import { MdClose, MdSecurity, MdCheck } from 'react-icons/md';
import { validateDeliveryOtp } from '../api/delivery';

const OTPModal = ({ isOpen, onClose, onSubmit, orderId }) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const inputRefs = useRef([]);

    useEffect(() => {
        if (isOpen) {
            console.log('🔐 OTP Modal opened for order:', orderId);
            setOtp(['', '', '', '', '', '']);
            setError('');
            setIsSuccess(false);
            setIsValidating(false);
            // Focus first input when modal opens
            setTimeout(() => {
                inputRefs.current[0]?.focus();
            }, 100);
        }
    }, [isOpen, orderId]);

    const handleInputChange = (index, value) => {
        // Only allow digits
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = [...otp];
        for (let i = 0; i < pastedData.length && i < 6; i++) {
            newOtp[i] = pastedData[i];
        }
        setOtp(newOtp);

        // Focus next empty input or last input
        const nextIndex = Math.min(pastedData.length, 5);
        inputRefs.current[nextIndex]?.focus();
    };

    const handleSubmit = async () => {
        const otpValue = otp.join('');
        if (otpValue.length !== 6) {
            setError('Please enter a complete 6-digit OTP');
            return;
        }

        setIsValidating(true);
        setIsSubmitting(true);
        setError('');

        try {
            // Validate OTP with backend
            const validationResult = await validateDeliveryOtp(orderId, otpValue);
            console.log('OTP validation successful:', validationResult);
            
            // Show success state briefly
            setIsSuccess(true);
            setIsValidating(false);
            
            // Wait a moment to show success, then proceed
            setTimeout(async () => {
                try {
                    // If validation successful, proceed with order completion
                    await onSubmit(otpValue);
                } catch (submitError) {
                    console.error('Order completion error:', submitError);
                    setIsSuccess(false);
                    setError('Failed to complete delivery. Please try again.');
                    setIsSubmitting(false);
                }
            }, 1000);
            
        } catch (error) {
            console.error('OTP validation error:', error);
            setIsValidating(false);
            setIsSubmitting(false);
            
            // Handle different types of errors
            if (error.response?.status === 400) {
                setError('Invalid OTP. Please check the code and try again.');
            } else if (error.response?.status === 404) {
                setError('Order not found. Please contact support.');
            } else if (error.response?.data) {
                setError(typeof error.response.data === 'string' ? error.response.data : 'Invalid OTP. Please try again.');
            } else {
                setError('Unable to validate OTP. Please check your connection and try again.');
            }
        }
    };

    const isComplete = otp.every(digit => digit !== '');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md">
            <div className="bg-white rounded-3xl p-8 w-full max-w-md mx-4 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                            <MdSecurity className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">Verify Delivery</h2>
                            <p className="text-sm text-gray-600">Order #{orderId}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition duration-200"
                    >
                        <MdClose className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Description */}
                <div className="mb-6">
                    <p className="text-gray-600 text-center">
                        Please enter the 6-digit OTP provided by the customer to confirm delivery.
                    </p>
                </div>

                {/* OTP Input */}
                <div className="mb-6">
                    <div className="flex justify-center space-x-3 mb-4">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                value={digit}
                                onChange={(e) => handleInputChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={handlePaste}
                                className="w-12 h-14 text-center text-xl font-semibold border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none transition duration-200"
                                maxLength={1}
                                inputMode="numeric"
                            />
                        ))}
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center">
                            {typeof error === 'string' ? error : error?.message || 'An error occurred'}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <button
                        onClick={handleSubmit}
                        disabled={!isComplete || isSubmitting}
                        className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-semibold transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                            isSuccess ? 'bg-green-500 text-white' : 'bg-orange-500 text-white hover:bg-orange-600'
                        }`}
                    >
                        {isValidating ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>Validating OTP...</span>
                            </>
                        ) : isSuccess ? (
                            <>
                                <MdCheck className="h-5 w-5" />
                                <span>OTP Verified! Completing...</span>
                            </>
                        ) : isSubmitting ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>Completing Delivery...</span>
                            </>
                        ) : (
                            <>
                                <MdCheck className="h-5 w-5" />
                                <span>Confirm Delivery</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition duration-200 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                </div>

                {/* Help Text */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-500">
                        Ask the customer for their delivery confirmation code
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OTPModal;