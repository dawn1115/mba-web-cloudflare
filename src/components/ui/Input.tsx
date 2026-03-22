import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <label className="grid gap-2 text-sm">
      {label && <span className="text-[color:var(--ink)]">{label}</span>}
      <input
        className={`rounded-2xl border bg-white px-4 py-3 ${
          error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-black/10'
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </label>
  );
}
