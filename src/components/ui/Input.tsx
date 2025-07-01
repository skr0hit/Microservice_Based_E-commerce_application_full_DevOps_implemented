import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface InputProps {
  label?: string;
  placeholder?: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  icon?: LucideIcon;
  error?: string;
  className?: string;
  required?: boolean;
}

export function Input({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  icon: Icon,
  error,
  className = '',
  required = false
}: InputProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon size={18} className="text-gray-400" />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`
            block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 
            placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 
            focus:outline-none transition-colors duration-200
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : ''}
          `}
          required={required}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}