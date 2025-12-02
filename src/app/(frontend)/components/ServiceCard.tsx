import React from "react";
import Image from "next/image";

interface Expert {
  name: string;
  specialty: string;
}

interface ServiceCardProps {
  description: string;
  imageUrl: string;
  imageAlt: string;
  experts: Expert[];
}

export function ServiceCard({
  description,
  imageUrl,
  imageAlt,
  experts,
}: ServiceCardProps) {
  return (
    <div className="space-y-6 text-sm">
      <div className="relative w-full overflow-hidden rounded-lg">
        <Image
          src={imageUrl}
          alt={imageAlt}
          width={1000}
          height={1000}
          className="object-cover"
        />
      </div>
      <div>
        <p className="mb-4 text-gray-600">{description}</p>
        <div className="space-y-2">
          {experts.map((expert, index) => (
            <p key={index}>
              <strong>{expert.name}</strong> – {expert.specialty}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
