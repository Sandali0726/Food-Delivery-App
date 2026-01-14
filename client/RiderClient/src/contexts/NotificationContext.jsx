import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [navigationCallbacks, setNavigationCallbacksState] = useState({
        onNavigateToOrders: null,
        onRefreshOrders: null
    });

    const addNotification = useCallback((notification) => {
        const id = Date.now() + Math.random();
        const newNotification = {
            id,
            ...notification,
            timestamp: new Date()
        };
        
        setNotifications(prev => [...prev, newNotification]);
        
        // Auto-remove after duration if specified
        if (notification.duration) {
            setTimeout(() => {
                removeNotification(id);
            }, notification.duration);
        }
        
        return id;
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, []);

    const clearAllNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    // Specific notification types
    const showOrderNotification = useCallback((order) => {
        return addNotification({
            type: 'order',
            order,
            persistent: true, // Don't auto-dismiss
        });
    }, [addNotification]);

    const showSuccessNotification = useCallback((message, duration = 5000) => {
        return addNotification({
            type: 'success',
            message,
            duration
        });
    }, [addNotification]);

    const showErrorNotification = useCallback((message, duration = 5000) => {
        return addNotification({
            type: 'error',
            message,
            duration
        });
    }, [addNotification]);

    const showInfoNotification = useCallback((message, duration = 5000) => {
        return addNotification({
            type: 'info',
            message,
            duration
        });
    }, [addNotification]);

    const setNavigationCallbacks = useCallback((callbacks) => {
        setNavigationCallbacksState(prev => ({ ...prev, ...callbacks }));
    }, []);

    const value = {
        notifications,
        addNotification,
        removeNotification,
        clearAllNotifications,
        showOrderNotification,
        showSuccessNotification,
        showErrorNotification,
        showInfoNotification,
        setNavigationCallbacks,
        navigationCallbacks
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};