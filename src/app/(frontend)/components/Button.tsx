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
      "bg-secondary border-2 border-secondary text-gray-800 rounded-full font-bold hover:bg-transparent hover:text-secondary",
    secondary:
      "bg-white text-secondary p-4 border-2 border-secondary rounded-full font-bold hover:bg-secondary hover:text-white hover:border-white",
    filter:
      "bg-white border-2 border-gray-200 rounded-full font-medium hover:bg-secondary hover:text-white hover:border-secondary",
    "filter-active":
      "bg-secondary text-white border-2 border-secondary rounded-full font-medium hover:bg-transparent hover:text-secondary",
  };

  const sizeClasses = {
    lg: "text-lg px-8 py-4",
    md: "text-base px-5 py-2.5",
    sm: "text-sm px-4 py-1.5",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className} ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
    >
      {children}
    </button>
  );
}
