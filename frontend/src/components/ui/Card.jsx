// frontend/src/components/ui/Card.jsx
import React from 'react';

const Card = ({ children, className = '', el: Element = 'div', ...props }) => {
  return (
    <Element
      className={`bg-white shadow-lg p-6 sm:p-8 ${className} rounded-[var(--border-radius-box)]`}
      {...props}
    >
      {children}
    </Element>
  );
};

export const CardHeader = ({ children, className = '', el: Element = 'div' }) => {
  return (
    <Element className={`mb-4 pb-4 ${className} border-b border-[var(--color-neutral-200)]`}>
      {typeof children === 'string' ? <h3 className="text-xl font-semibold text-[var(--color-neutral-800)]">{children}</h3> : children}
    </Element>
  );
};

export const CardContent = ({ children, className = '', el: Element = 'div' }) => {
  return <Element className={className}>{children}</Element>;
};

export const CardFooter = ({ children, className = '', el: Element = 'div' }) => {
  return <Element className={`mt-6 pt-4 ${className} border-t border-[var(--color-neutral-200)]`}>{children}</Element>;
};

export default Card;