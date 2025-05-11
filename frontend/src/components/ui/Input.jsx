// frontend/src/components/ui/Input.jsx
import React from 'react';

const Input = React.forwardRef(({
  type = 'text',
  id,
  name,
  value,
  onChange,
  placeholder,
  className = '',
  disabled = false,
  error = false, // Boolean to indicate error state
  label, // Optional label prop
  ...props
}, ref) => {
  const baseStyles = 'block w-full shadow-sm text-base'; // Removed rounded-input, will add via class
  const borderStyles = error
    ? 'border-[var(--color-danger)] text-[var(--color-danger)] placeholder-[var(--color-danger-light)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger)]'
    : 'border-[var(--color-neutral-300)] focus:border-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]';
  const focusRingStyles = 'focus:ring-opacity-50 focus:ring-2'; // Adjusted focus ring
  const disabledStyles = 'bg-[var(--color-neutral-200)] cursor-not-allowed opacity-70';
  const borderRadiusStyle = 'rounded-[var(--border-radius-input)]';

  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-[var(--color-neutral-700)] mb-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          ${baseStyles}
          ${borderStyles}
          ${focusRingStyles}
          ${borderRadiusStyle}
          p-2.5 /* Consistent padding */
          ${disabled ? disabledStyles : ''}
          ${className}
        `}
        {...props}
      />
      {error && typeof error === 'string' && ( // Allow string error messages
        <p className="mt-1 text-xs text-[var(--color-danger)]">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;