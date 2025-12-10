import React from "react";
import Image from "next/image";

interface Expert {
  name: string;
  specialty: string;
}

interface ServiceCardProps {
  title?: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  experts: Expert[];
}

export function ServiceCard({
  title,
  description,
  imageUrl,
  imageAlt,
  experts,
}: ServiceCardProps) {
  return (
    <div className="flex h-full cursor-grab flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all select-none hover:shadow-md active:cursor-grabbing">
      <div className="relative aspect-[1024/322] w-full overflow-hidden">
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="mb-3 line-clamp-3 text-sm leading-relaxed text-gray-600">
          {description}
        </p>
        <div className="mt-auto space-y-1 border-t border-gray-100 pt-3">
          <p className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
            Experts
          </p>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
            {experts.slice(0, 6).map((expert, index) => (
              <p key={index} className="text-xs text-gray-700">
                <strong className="font-semibold">{expert.name}</strong>
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
