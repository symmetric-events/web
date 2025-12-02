import React from "react";
import "../../styles/globals.css";
import { Footer } from "./components/footer/Footer";
import { PrefetchTrainingCourses } from "./components/PrefetchTrainingCourses";
import { ScrollNavigation } from "./components/ScrollNavigation";
import Providers from "./providers";

export const metadata = {
  description:
    "Your Partner for Pharma and Biotech Training. We train clients from over 500 companies annually. Enter our global educational platform for pharmaceutical professionals.",
  title: "Symmetric - Pharmaceutical & Biotech Online Training Courses",
};

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props;

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="bg-white font-sans leading-relaxed text-gray-800"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        <Providers>
          <PrefetchTrainingCourses />
          <ScrollNavigation />
          <main>
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
