import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "filter" | "filter-active";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  disabled?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  onClick,
  type = "button",
  className = "",
  disabled = false,
}: ButtonProps) {
  const baseClasses = "transition-all duration-300 cursor-pointer";

  const variantClasses = {
    primary:
      "bg-secondary border-2 border-secondary text-primary px-6 py-3 rounded-full font-bold hover:bg-transparent hover:text-secondary",
    secondary:
      "bg-white text-green-500 p-4 border-0 rounded font-bold hover:bg-gray-50",
    filter:
      "bg-white border-2 border-gray-200 px-5 py-2.5 rounded-full font-medium hover:bg-blue-600 hover:text-white hover:border-blue-600",
    "filter-active":
      "bg-blue-600 text-white border-2 border-blue-600 px-5 py-2.5 rounded-full font-medium hover:bg-blue-700 hover:border-blue-700",
  };

  const sizeClasses = {
    sm: "text-sm px-3 py-1.5",
    md: "text-base px-5 py-2.5",
    lg: "text-lg px-8 py-4",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
}
