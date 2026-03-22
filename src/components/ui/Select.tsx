import React from 'react';

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  options: { label: string; value: string }[];
};

export function Select({ label, error, options, className = '', ...props }: SelectProps) {
  return (
    <label className="grid gap-2 text-sm">
      {label && <span className="text-[color:var(--ink)]">{label}</span>}
      <select
        className={`rounded-2xl border bg-white px-4 py-3 ${
          error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-black/10'
        } ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </label>
  );
}
