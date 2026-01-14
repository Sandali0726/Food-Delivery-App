// filepath: /home/sandali-jayawardhana/Desktop/yumy/client/customer/src/components/ToastProvider.jsx
import React, { createContext, useCallback, useContext, useState } from 'react';
import Toast from './Toast';

const ToastContext = createContext({
  showToast: (_message, _options) => {},
  hideToast: () => {}
});

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, options = {}) => {
    const { type = 'info', duration = 4000 } = options;
    // generate a unique id so identical messages still retrigger
    const id = Date.now() + Math.random();
    setToast({ id, message, type, duration });
  }, []);

  const hideToast = useCallback(() => setToast(null), []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {toast?.message && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={hideToast}
        />
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

export default ToastContext;

