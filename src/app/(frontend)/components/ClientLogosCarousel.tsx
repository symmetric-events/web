"use client";

import React from "react";
import Image from "next/image";

interface ClientLogosCarouselProps {
  title?: string;
  className?: string;
  backgroundColor?: string;
}

const CLIENT_LOGOS = [
  "https://www.symmetric.events/wp-content/uploads/2022/02/astra-2-1.png",
  "https://www.symmetric.events/wp-content/uploads/2022/02/annvie-1.png",
  "https://www.symmetric.events/wp-content/uploads/2022/02/teva-1.png",
  "https://www.symmetric.events/wp-content/uploads/2022/02/boe-1.png",
  "https://www.symmetric.events/wp-content/uploads/2022/02/gsk-1.png",
  "https://www.symmetric.events/wp-content/uploads/2025/12/jj.png",
  "https://www.symmetric.events/wp-content/uploads/2022/02/merck-1.png",
  "https://www.symmetric.events/wp-content/uploads/2022/02/novartis.png",
  "https://www.symmetric.events/wp-content/uploads/2022/02/novo-1-1.png",
  "https://www.symmetric.events/wp-content/uploads/2022/02/pfizer-1.png",
  "https://www.symmetric.events/wp-content/uploads/2022/02/rocje-1.png",
  "https://www.symmetric.events/wp-content/uploads/2022/02/sanofi-1.png",
];

export function ClientLogosCarousel({
  title = "Clients that have benefited from our courses",
  className = "",
  backgroundColor = "",
}: ClientLogosCarouselProps) {
  // Duplicate logos for seamless infinite scroll
  const duplicatedLogos = [...CLIENT_LOGOS, ...CLIENT_LOGOS];

  return (
    <>
      <style jsx global>{`
        @keyframes scroll-logos {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll-logos {
          animation: scroll-logos 50s linear infinite;
        }
        .animate-scroll-logos:hover {
          animation-play-state: paused;
        }
      `}</style>
      <section className={`overflow-hidden py-14 ${backgroundColor} ${className}`}>
        <div className="mx-auto max-w-6xl px-5">
          {title && (
            <h2 className="mb-12 text-center text-2xl text-gray-800">
              {title}
            </h2>
          )}
          <div className="relative overflow-hidden">
            {/* Gradient overlays for fade effect */}
            <div className={`absolute left-0 top-0 z-10 h-full w-20 bg-gradient-to-r ${backgroundColor} to-transparent pointer-events-none`} />
            <div className={`absolute right-0 top-0 z-10 h-full w-20 bg-gradient-to-l ${backgroundColor} to-transparent pointer-events-none`} />
            
            {/* Carousel container */}
            <div className="flex animate-scroll-logos">
              {duplicatedLogos.map((src, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 px-8 flex items-center justify-center"
                  style={{ width: "200px" }}
                >
                  <Image
                    src={src}
                    alt="client logo"
                    width={160}
                    height={120}
                    className="w-auto h-auto max-h-20 object-contain transition-all duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
