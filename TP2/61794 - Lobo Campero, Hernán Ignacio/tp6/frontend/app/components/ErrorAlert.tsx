'use client';

import { AlertCircle, X } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
  onClose?: () => void;
  type?: 'error' | 'warning' | 'info';
}

export default function ErrorAlert({ message, onClose, type = 'error' }: ErrorAlertProps) {
  const bgColor = type === 'error' ? 'bg-red-50' : type === 'warning' ? 'bg-yellow-50' : 'bg-blue-50';
  const borderColor = type === 'error' ? 'border-red-200' : type === 'warning' ? 'border-yellow-200' : 'border-blue-200';
  const textColor = type === 'error' ? 'text-red-800' : type === 'warning' ? 'text-yellow-800' : 'text-blue-800';
  const iconColor = type === 'error' ? 'text-red-500' : type === 'warning' ? 'text-yellow-500' : 'text-blue-500';

  return (
    <div className={`${bgColor} border ${borderColor} ${textColor} px-4 py-3 rounded-lg mb-6 flex items-start justify-between`}>
      <div className="flex items-start gap-3">
        <AlertCircle className={`${iconColor} mt-0.5 flex-shrink-0`} size={20} />
        <p className="text-sm">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={`${textColor} hover:opacity-70 flex-shrink-0`}
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}
