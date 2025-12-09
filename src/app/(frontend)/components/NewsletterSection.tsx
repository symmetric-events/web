import React from 'react';
import { CheckmarkItem } from './footer/CheckmarkItem';
import { NewsletterForm } from './footer/NewsletterForm';

export const NewsletterSection: React.FC = () => {
  const newsletterBenefits = [
    {
      strongText: "TOP 3 Pharma & Biotech Worldwide News",
      text: "Once a Month"
    },
    {
      strongText: "Interviews With Industry Professionals",
      text: "Once Every Three Months"
    },
    {
      strongText: "Regular Event Calendar & Special Offers",
      text: "Once Every Six Months"
    }
  ];

  return (
    <div className="newsletter-row bg-[#FBBB00] p-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* Left Column - Newsletter Info */}
          <div>
            <h2 className="mb-4 text-3xl font-bold text-gray-900">
              Join Symmetric Newsletter
            </h2>
            <p className="mb-6 text-lg text-gray-800">
              Sign up today so you don't miss any special offers, new
              events and pharma breaking news.
            </p>
            <div className="space-y-3 ">
              {newsletterBenefits.map((benefit, index) => (
                <CheckmarkItem
                  key={index}
                  strongText={benefit.strongText}
                  text={benefit.text}
                />
              ))}
            </div>
          </div>

          {/* Right Column - Newsletter Form */}
          <div>
            <NewsletterForm />
          </div>
        </div>
      </div>
    </div>
  );
};
