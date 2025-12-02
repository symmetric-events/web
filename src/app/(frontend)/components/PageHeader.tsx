import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  children,
  className = "",
}: PageHeaderProps) {
  return (
    <section className={`bg-primary pb-12 pt-20 md:pt-24 ${className}`}>
      <div className="mx-auto max-w-7xl px-5">
        <div className="text-center">
          <h1 className="mb-6 text-3xl font-bold text-gray-800">{title}</h1>
          {description && (
            <p className="mx-auto max-w-3xl text-gray-600">
              {description}
            </p>
          )}
          {children && <div className="mt-8">{children}</div>}
        </div>
      </div>
    </section>
  );
}

