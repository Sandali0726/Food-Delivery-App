import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ToastProvider } from './components/ToastProvider';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
      <div className="min-h-screen flex flex-col">
        <div className="flex-1">
          <ToastProvider>
            <App />
          </ToastProvider>
        </div>
      </div>
  </React.StrictMode>
);
