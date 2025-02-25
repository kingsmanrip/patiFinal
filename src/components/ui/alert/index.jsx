import React from 'react';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

const Alert = ({ 
  children, 
  variant = 'default', 
  className = '',
  onClose,
  ...props 
}) => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800 border-gray-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
  };

  const variantIcons = {
    default: null,
    error: <AlertTriangle className="h-4 w-4" />,
    success: <CheckCircle className="h-4 w-4" />,
    warning: <AlertTriangle className="h-4 w-4" />,
    info: <Info className="h-4 w-4" />,
  };

  return (
    <div
      className={`relative w-full rounded-lg border p-4 ${variantClasses[variant]} ${className}`}
      role="alert"
      {...props}
    >
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 rounded-md p-1 hover:bg-gray-200"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      {variantIcons[variant] && (
        <div className="flex items-start gap-4">
          <div className="mt-0.5">{variantIcons[variant]}</div>
          <div>{children}</div>
        </div>
      )}
      {!variantIcons[variant] && children}
    </div>
  );
};

const AlertTitle = ({ className, children, ...props }) => {
  return (
    <h5
      className={`mb-1 font-medium leading-none tracking-tight ${className || ''}`}
      {...props}
    >
      {children}
    </h5>
  );
};

const AlertDescription = ({ className, children, ...props }) => {
  return (
    <div
      className={`text-sm ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
};

export { Alert, AlertTitle, AlertDescription };
