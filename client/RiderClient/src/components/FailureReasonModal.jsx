import React, { useState } from 'react';
import { MdClose, MdError, MdSend } from 'react-icons/md';

const FailureReasonModal = ({ isOpen, onClose, onSubmit, orderId }) => {
    const [selectedReason, setSelectedReason] = useState('');
    const [customReason, setCustomReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const predefinedReasons = [
        'Customer not available',
        'Wrong address provided',
        'Customer cancelled order',
        'Restaurant closed',
        'Food not ready',
        'Vehicle breakdown',
        'Weather conditions',
        'Security concerns',
        'Customer requested cancellation',
        'Other (specify below)'
    ];

    const handleSubmit = async () => {
        const reason = selectedReason === 'Other (specify below)' ? customReason : selectedReason;
        
        if (!reason.trim()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // TODO: Implement actual failure reason submission with backend
            await onSubmit(reason);
            
            // Reset form
            setSelectedReason('');
            setCustomReason('');
        } catch (error) {
            console.error('Failed to submit failure reason:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setSelectedReason('');
            setCustomReason('');
            onClose();
        }
    };

    const isValid = selectedReason && (selectedReason !== 'Other (specify below)' || customReason.trim());

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-3xl p-8 w-full max-w-md mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                            <MdError className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">Report Issue</h2>
                            <p className="text-sm text-gray-600">Order #{orderId}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition duration-200 disabled:opacity-50"
                    >
                        <MdClose className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Description */}
                <div className="mb-6">
                    <p className="text-gray-600 text-center">
                        Please select the reason why this delivery could not be completed.
                    </p>
                </div>

                {/* Reason Selection */}
                <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Select a reason:</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {predefinedReasons.map((reason, index) => (
                            <label
                                key={index}
                                className={`flex items-center p-3 border-2 rounded-xl cursor-pointer transition duration-200 hover:bg-gray-50 ${
                                    selectedReason === reason
                                        ? 'border-red-500 bg-red-50'
                                        : 'border-gray-200'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="reason"
                                    value={reason}
                                    checked={selectedReason === reason}
                                    onChange={(e) => setSelectedReason(e.target.value)}
                                    className="sr-only"
                                />
                                <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                                    selectedReason === reason
                                        ? 'border-red-500 bg-red-500'
                                        : 'border-gray-300'
                                }`}>
                                    {selectedReason === reason && (
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                    )}
                                </div>
                                <span className="text-gray-700 text-sm">{reason}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Custom Reason Input */}
                {selectedReason === 'Other (specify below)' && (
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Please specify the reason:
                        </label>
                        <textarea
                            value={customReason}
                            onChange={(e) => setCustomReason(e.target.value)}
                            placeholder="Enter the reason for delivery failure..."
                            className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none resize-none"
                            rows={4}
                            maxLength={500}
                        />
                        <div className="text-right mt-1">
                            <span className="text-xs text-gray-500">
                                {customReason.length}/500 characters
                            </span>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="space-y-3">
                    <button
                        onClick={handleSubmit}
                        disabled={!isValid || isSubmitting}
                        className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>Submitting...</span>
                            </>
                        ) : (
                            <>
                                <MdSend className="h-5 w-5" />
                                <span>Report Issue</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition duration-200 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                </div>

                {/* Help Text */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-500">
                        This information will help improve our delivery service
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FailureReasonModal;