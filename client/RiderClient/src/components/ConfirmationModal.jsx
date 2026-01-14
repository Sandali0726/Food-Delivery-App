import React from 'react';
import { MdCheckCircle, MdClose, MdWarning } from 'react-icons/md';

const ConfirmationModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    confirmText = "Confirm", 
    cancelText = "Cancel",
    type = "warning" // "warning", "success", "info"
}) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case "success":
                return <MdCheckCircle className="h-12 w-12 text-green-500" />;
            case "info":
                return <MdCheckCircle className="h-12 w-12 text-blue-500" />;
            default:
                return <MdWarning className="h-12 w-12 text-orange-500" />;
        }
    };

    const getConfirmButtonColor = () => {
        switch (type) {
            case "success":
                return "bg-green-500 hover:bg-green-600";
            case "info":
                return "bg-blue-500 hover:bg-blue-600";
            default:
                return "bg-orange-500 hover:bg-orange-600";
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                        {getIcon()}
                        <h3 className="text-xl font-semibold text-gray-800">
                            {title}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition duration-200"
                    >
                        <MdClose className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-gray-600 text-center leading-relaxed">
                        {message}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex space-x-3 p-6 pt-0">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition duration-200 font-semibold"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 py-3 px-4 text-white rounded-xl transition duration-200 font-semibold ${getConfirmButtonColor()}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;