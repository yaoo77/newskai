
import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, ExclamationCircleIcon } from './icons';

type ToastType = 'success' | 'error';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

let toastId = 0;
const toastListeners: Array<(toast: ToastMessage) => void> = [];

export const toast = (message: string, type: ToastType = 'success') => {
  const newToast: ToastMessage = { id: toastId++, message, type };
  toastListeners.forEach(listener => listener(newToast));
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const addToast = (newToast: ToastMessage) => {
      setToasts(currentToasts => [...currentToasts, newToast]);
      setTimeout(() => {
        setToasts(currentToasts => currentToasts.filter(t => t.id !== newToast.id));
      }, 3000);
    };

    toastListeners.push(addToast);

    return () => {
      const index = toastListeners.indexOf(addToast);
      if (index > -1) {
        toastListeners.splice(index, 1);
      }
    };
  }, []);

  return (
    <div className="fixed top-5 right-5 z-[100] space-y-3">
      {toasts.map(({ id, message, type }) => (
        <div
          key={id}
          className={`flex items-center w-full max-w-xs p-4 text-slate-500 bg-white rounded-lg shadow-lg dark:text-slate-400 dark:bg-slate-800 transition-all transform animate-fade-in-down ${
            type === 'success' ? 'border-l-4 border-emerald-500' : 'border-l-4 border-red-500'
          }`}
          role="alert"
        >
          <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8">
            {type === 'success' ? (
              <CheckCircleIcon className="w-6 h-6 text-emerald-500" />
            ) : (
              <ExclamationCircleIcon className="w-6 h-6 text-red-500" />
            )}
          </div>
          <div className="ml-3 text-sm font-normal">{message}</div>
        </div>
      ))}
    </div>
  );
};
