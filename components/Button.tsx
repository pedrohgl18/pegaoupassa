import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'google';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "h-14 px-6 rounded-full font-bold text-base transition-all duration-200 flex items-center justify-center gap-2 active:scale-95";
  
  const variants = {
    // Green to Blue gradient for primary actions
    primary: "bg-gradient-to-r from-brasil-green to-brasil-blue text-white shadow-lg shadow-brasil-green/30 border-none",
    // White background
    secondary: "bg-white text-brasil-blue shadow-lg",
    // Outline white
    outline: "bg-transparent border-2 border-white text-white",
    // Ghost
    ghost: "bg-white/10 text-white backdrop-blur-sm hover:bg-white/20",
    // Google specific
    google: "bg-white text-[#1f1f1f] shadow-md hover:bg-gray-50",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;