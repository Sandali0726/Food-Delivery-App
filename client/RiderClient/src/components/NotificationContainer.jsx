import React, { useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import OrderNotification from './OrderNotification';
import {    MdCheckCircle,
            MdError,
            MdInfo,
            MdClose
        } from 'react-icons/md';

const NotificationContainer = () => {
    const { notifications, removeNotification } = useNotification();

    useEffect(() => {
        // Request notification permission when component mounts
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    const renderNotification = (notification) => {
        const { id, type } = notification;

        // Order notifications (keep in top-right corner)
        if (type === 'order') {
            return <OrderNotification key={id} notification={notification} />;
        }

        // Centered popup for success/error/info
        const config = {
            success: {
                icon: MdCheckCircle,
                gradientColors: 'from-green-500 to-green-600',
                bgColor: 'bg-white',
                iconBgColor: 'bg-white bg-opacity-20',
                textColor: 'text-white',
                messageColor: 'text-gray-800'
            },
            error: {
                icon: MdError,
                gradientColors: 'from-red-500 to-red-600',
                bgColor: 'bg-white',
                iconBgColor: 'bg-white bg-opacity-20',
                textColor: 'text-white',
                messageColor: 'text-gray-800'
            },
            info: {
                icon: MdInfo,
                gradientColors: 'from-green-500 to-green-600',
                bgColor: 'bg-white',
                iconBgColor: 'bg-white bg-opacity-20',
                textColor: 'text-white',
                messageColor: 'text-gray-800'
            }
        };

        const { icon: Icon, gradientColors, bgColor, iconBgColor, textColor, messageColor } = config[type] || config.info;

        return (
            <div key={id} className="fixed inset-0 backdrop-blur-md  bg-opacity-30 z-50 flex items-center justify-center p-4 animate-fadeIn">
                <div className={`${bgColor} rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 animate-scaleIn`}>
                    {/* Colored Header */}
                    <div className={`bg-gradient-to-r ${gradientColors} rounded-t-2xl p-6 ${textColor}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className={`w-12 h-12 ${iconBgColor} rounded-full flex items-center justify-center backdrop-blur-sm`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                                <h3 className="font-bold text-xl">
                                    {type === 'success' ? 'Success!' : type === 'error' ? 'Error' : 'Information'}
                                </h3>
                            </div>
                            <button 
                                onClick={() => removeNotification(id)}
                                className="hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
                            >
                                <MdClose className="h-6 w-6" />
                            </button>
                        </div>
                    </div>
                    
                    {/* Message Content */}
                    <div className="p-6">
                        <p className={`text-base ${messageColor} leading-relaxed`}>
                            {notification.message}
                        </p>
                    </div>
                    
                    {/* Optional action button */}
                    <div className="px-6 pb-6">
                        <button
                            onClick={() => removeNotification(id)}
                            className={`w-full py-3 px-4 rounded-xl text-white font-semibold bg-gradient-to-r ${gradientColors} hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl`}
                        >
                            OK
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (notifications.length === 0) {
        return null;
    }

    // Separate order notifications from other types
    const orderNotifications = notifications.filter(n => n.type === 'order');
    const otherNotifications = notifications.filter(n => n.type !== 'order');

    return (
        <>
            {/* Order notifications in top-right corner */}
            {orderNotifications.length > 0 && (
                <div className="fixed top-4 right-4 z-50 w-96 max-w-full space-y-2">
                    <style>{`
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
                        
                        .notification-enter {
                            animation: slideInRight 0.3s ease-out;
                        }
                    `}</style>
                    
                    {orderNotifications.map(notification => (
                        <div key={notification.id} className="notification-enter">
                            {renderNotification(notification)}
                        </div>
                    ))}
                </div>
            )}

            {/* Success/Error/Info notifications centered */}
            {otherNotifications.map(notification => (
                <React.Fragment key={notification.id}>
                    {renderNotification(notification)}
                </React.Fragment>
            ))}

            {/* Global animations for centered popups */}
            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                
                @keyframes scaleIn {
                    from {
                        transform: scale(0.9);
                        opacity: 0;
                    }
                    to {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
                
                .animate-scaleIn {
                    animation: scaleIn 0.3s ease-out;
                }
            `}</style>
        </>
    );
};

export default NotificationContainer;