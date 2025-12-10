import React from "react";
import Image from "next/image";

interface BenefitItemProps {
  imageUrl: string;
  imageAlt: string;
  title: string;
  description: string;
  isFirst?: boolean;
  isLast?: boolean;
}

export function BenefitItem({
  imageUrl,
  imageAlt,
  title,
  description,
  isFirst = false,
  isLast = false,
}: BenefitItemProps) {
  return (
    <>
      <div
        className={`flex gap-4 ${isFirst ? "pb-8" : isLast ? "pt-8" : "pt-8 pb-8"}`}
      >
        <div className="h-[72px] w-[72px] self-center">
          <Image
            src={imageUrl}
            alt={imageAlt}
            width={72}
            height={72}
            className="h-full w-full object-contain"
          />
        </div>
        <div className="flex-1">
          <h3 className="mb-2 text-lg text-gray-900">{title}</h3>
          <p className="leading-relaxed text-gray-700">{description}</p>
        </div>
      </div>
      {!isLast && <div className="border-t border-gray-200"></div>}
    </>
  );
}
