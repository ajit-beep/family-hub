// frontend/src/components/ui/Button.jsx
import React from 'react';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // 'primary', 'secondary', 'danger', 'outline', 'ghost'
  size = 'md', // 'sm', 'md', 'lg'
  className = '',
  disabled = false,
  ...props
}) => {
  const baseStyles = 'font-semibold rounded-button focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 ease-in-out';

  const variantStyles = {
    primary: 'bg-brand-primary text-white hover:bg-brand-primary-dark focus:ring-brand-primary',
    secondary: 'bg-brand-secondary text-white hover:bg-brand-secondary-dark focus:ring-brand-secondary',
    danger: 'bg-danger text-white hover:bg-danger-dark focus:ring-danger',
    outline_primary: 'border border-brand-primary text-brand-primary hover:bg-brand-primary/10 focus:ring-brand-primary',
    outline_neutral: 'border border-neutral-300 text-neutral-700 hover:bg-neutral-100 focus:ring-brand-primary',
    ghost: 'text-brand-primary hover:bg-brand-primary/10 focus:ring-brand-primary',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const disabledStyles = 'opacity-50 cursor-not-allowed';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseStyles}
        ${variantStyles[variant] || variantStyles.primary}
        ${sizeStyles[size] || sizeStyles.md}
        ${disabled ? disabledStyles : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;