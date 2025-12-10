import React from "react";
import { BenefitItem } from "./BenefitItem";

export interface Benefit {
  imageUrl: string;
  imageAlt: string;
  title: string;
  description: string;
}

interface BenefitsListProps {
  benefits: Benefit[];
}

export function BenefitsList({ benefits }: BenefitsListProps) {
  return (
    <div>
      {benefits.map((benefit, index) => (
        <BenefitItem
          key={index}
          imageUrl={benefit.imageUrl}
          imageAlt={benefit.imageAlt}
          title={benefit.title}
          description={benefit.description}
          isFirst={index === 0}
          isLast={index === benefits.length - 1}
        />
      ))}
    </div>
  );
}
