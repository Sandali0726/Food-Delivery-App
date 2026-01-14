import { useCallback } from 'react';

export const useNotificationUtils = () => {
    // Vibration patterns
    const vibrationPatterns = {
        newOrder: [200, 100, 200, 100, 300],
        success: [100],
        error: [500],
        info: [150]
    };

    const triggerVibration = useCallback((pattern = 'info') => {
        if ('vibrate' in navigator) {
            navigator.vibrate(vibrationPatterns[pattern] || vibrationPatterns.info);
        }
    }, []);

    const requestNotificationPermission = useCallback(async () => {
        if ('Notification' in window) {
            if (Notification.permission === 'default') {
                const permission = await Notification.requestPermission();
                return permission === 'granted';
            }
            return Notification.permission === 'granted';
        }
        return false;
    }, []);

    const showBrowserNotification = useCallback((title, options = {}) => {
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification(title, {
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: 'order-notification',
                renotify: true,
                requireInteraction: true,
                ...options
            });

            // Auto close after 10 seconds if not interacted with
            setTimeout(() => {
                notification.close();
            }, 10000);

            return notification;
        }
        return null;
    }, []);

    const playNotificationSound = useCallback(async (soundFile = '/notification-sound.mp3', volume = 0.5) => {
        try {
            const audio = new Audio(soundFile);
            audio.volume = volume;
            await audio.play();
        } catch (error) {
            console.log('Audio playback failed:', error.message);
            // Fallback to system beep
            try {
                const context = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = context.createOscillator();
                const gainNode = context.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(context.destination);
                
                oscillator.frequency.value = 800;
                oscillator.type = 'sine';
                gainNode.gain.value = 0.3;
                
                oscillator.start();
                oscillator.stop(context.currentTime + 0.2);
            } catch (beepError) {
                console.log('System beep also failed:', beepError.message);
            }
        }
    }, []);

    const createFullNotification = useCallback(async ({
        title,
        message,
        type = 'info',
        soundFile,
        vibrate = true
    }) => {
        // Trigger vibration
        if (vibrate) {
            triggerVibration(type);
        }

        // Show browser notification
        showBrowserNotification(title, {
            body: message,
            tag: `${type}-notification`
        });

        // Play sound
        if (soundFile || type === 'newOrder') {
            await playNotificationSound(soundFile);
        }
    }, [triggerVibration, showBrowserNotification, playNotificationSound]);

    return {
        triggerVibration,
        requestNotificationPermission,
        showBrowserNotification,
        playNotificationSound,
        createFullNotification
    };
};