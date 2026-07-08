import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const styles = {
    success: {
      bg: 'bg-white border-success/20 shadow-success/5',
      icon: <CheckCircle2 className="h-5 w-5 text-success" />,
      text: 'text-text-dark',
      progress: 'bg-success'
    },
    warning: {
      bg: 'bg-white border-warning/20 shadow-warning/5',
      icon: <AlertTriangle className="h-5 w-5 text-warning" />,
      text: 'text-text-dark',
      progress: 'bg-warning'
    },
    danger: {
      bg: 'bg-white border-danger/20 shadow-danger/5',
      icon: <XCircle className="h-5 w-5 text-danger" />,
      text: 'text-text-dark',
      progress: 'bg-danger'
    }
  };

  const style = styles[type] || styles.success;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:bottom-6 sm:right-6 sm:max-w-sm z-50 animate-fade-in">
      <div className={`flex items-center gap-3 p-4 rounded-2xl border ${style.bg} shadow-2xl relative overflow-hidden`}>
        {/* Progress timer bar */}
        <div 
          className={`absolute bottom-0 left-0 h-1 ${style.progress} transition-all duration-3000 ease-linear`}
          style={{ width: '100%', animation: `shrink ${duration}ms linear forwards` }}
        />
        
        {/* Icon */}
        <div className="flex-shrink-0">
          {style.icon}
        </div>

        {/* Message */}
        <div className="flex-grow">
          <p className={`text-sm font-semibold ${style.text}`}>{message}</p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="text-text-gray hover:text-text-dark p-1 rounded-lg hover:bg-gray-100 transition-colors duration-150 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
