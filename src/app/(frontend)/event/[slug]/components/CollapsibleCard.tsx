"use client";

import React, { useState } from "react";

interface CollapsibleCardProps {
  title: string;
  description: string;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function CollapsibleCard({ title, description }: CollapsibleCardProps) {
  return (
    <div className="mb-4">
      {/* Header */}
      <button className="bg-secondary flex w-full items-center justify-between rounded-lg px-6 py-4 font-bold text-black shadow-md duration-200">
        <span>{title}</span>
        <div className="border-secondary rounded-full border-2 bg-white p-2">
          <svg
            className={`h-6 w-6 transition-transform duration-200`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {/* Content */}

      <div className="mt-2 rounded-lg border border-[#FBBB00] bg-white p-6 shadow-sm">
        <p className="leading-relaxed text-gray-800">{description}</p>
      </div>
    </div>
  );
}
