import React from "react";
import Image from "next/image";
import Link from "next/link";

interface TrainerCardProps {
  slug: string | number;
  name: string;
  position?: string | null;
  excerpt?: string | null;
  imageUrl?: string;
  imageAlt?: string;
}

export function TrainerCardSmall({
  slug,
  name,
  imageUrl,
  imageAlt,
}: TrainerCardProps) {
  return (
    <Link href={`/trainer/${slug}`} className="block">
      <div className="cursor-pointer rounded-lg bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        {/* Circular Image Section */}
        <div className="mb-4 flex justify-center">
          <div className="relative h-42 w-42 overflow-hidden rounded-full border-4 border-gray-100">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={imageAlt || name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-200">
                <div className="text-3xl font-bold text-gray-400">
                  {name.charAt(0).toUpperCase()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="text-left">
          <h3 className="text-center text-lg font-bold text-gray-800">
            {name}
          </h3>
        </div>
      </div>
    </Link>
  );
}
