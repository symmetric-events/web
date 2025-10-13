import Link from "next/link";
import React from "react";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function NavLink({ href, children, className = "" }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={`text-primary hover:text-secondary py-2 font-semibold transition-colors duration-300 whitespace-nowrap ${className}`}
    >
      {children}
    </Link>
  );
}
