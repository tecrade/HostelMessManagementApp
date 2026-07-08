import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
        onClick={onCancel}
      ></div>

      {/* Dialog Box */}
      <div className="bg-white border border-gray-100 relative w-full max-w-sm rounded-2xl shadow-2xl p-6 z-10 animate-slide-in">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-danger/10 flex items-center justify-center text-danger flex-shrink-0">
            <AlertCircle className="h-5 w-5" />
          </div>
          
          <div className="space-y-1">
            <h3 className="font-heading font-bold text-base text-text-dark">{title}</h3>
            <p className="text-xs text-text-gray leading-relaxed">{message}</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-200 text-xs font-semibold text-text-gray bg-white hover:bg-gray-50 rounded-xl transition-all duration-200 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-danger hover:bg-danger/90 text-xs font-semibold text-white rounded-xl shadow-md shadow-danger/10 hover:shadow-danger/20 transition-all duration-200 cursor-pointer"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
