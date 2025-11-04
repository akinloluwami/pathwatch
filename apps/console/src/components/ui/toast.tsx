import { useState, useCallback, ReactNode } from 'react';
import Brackets from './brackets';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

type ToastFunction = (message: string) => void;

interface ToastAPI {
  success: ToastFunction;
  error: ToastFunction;
  warning: ToastFunction;
  info: ToastFunction;
}

let addToastFn: ((type: ToastType, message: string) => void) | null = null;

export const toast: ToastAPI = {
  success: (message: string) => addToastFn?.('success', message),
  error: (message: string) => addToastFn?.('error', message),
  warning: (message: string) => addToastFn?.('warning', message),
  info: (message: string) => addToastFn?.('info', message),
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, message }]);

      setTimeout(() => {
        removeToast(id);
      }, 5000);
    },
    [removeToast]
  );

  addToastFn = addToast;

  return (
    <>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
}

function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: ToastItem[];
  removeToast: (id: string) => void;
}) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItemComponent key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItemComponent({ toast, onClose }: { toast: ToastItem; onClose: () => void }) {
  const config = {
    success: {
      icon: <CheckCircle size={14} />,
      color: 'text-green-500',
      borderColor: 'border-green-500',
    },
    error: {
      icon: <AlertCircle size={14} />,
      color: 'text-red-500',
      borderColor: 'border-red-500',
    },
    warning: {
      icon: <AlertTriangle size={14} />,
      color: 'text-yellow-500',
      borderColor: 'border-yellow-500',
    },
    info: {
      icon: <Info size={14} />,
      color: 'text-blue-500',
      borderColor: 'border-blue-500',
    },
  };

  const { icon, color, borderColor } = config[toast.type];

  return (
    <div
      className={`relative pointer-events-auto bg-black border ${borderColor} p-2.5 min-w-[240px] max-w-sm animate-slide-in-right`}
    >
      <Brackets />
      <div className="flex items-start gap-2.5">
        <div className={`${color} flex-shrink-0 mt-0.5`}>{icon}</div>
        <p className="flex-1 text-xs text-white font-mono tracking-wide leading-relaxed">
          {toast.message}
        </p>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-white transition-colors flex-shrink-0"
          aria-label="Close"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
