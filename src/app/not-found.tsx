import React from "react";
import Link from "next/link";
import "../styles/globals.css";
import { Footer } from "./(frontend)/components/footer/Footer";
import { ScrollNavigation } from "./(frontend)/components/ScrollNavigation";
import { Button } from "./(frontend)/components/Button";
import Providers from "./(frontend)/providers";

export const metadata = {
  title: "404 - Page Not Found | Symmetric",
  description: "The page you're looking for doesn't exist.",
};

export default function NotFound() {
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
          <ScrollNavigation />
          <main>
            <div className="flex min-h-screen items-center justify-center bg-gray-50 py-20">
              <div className="mx-auto max-w-2xl px-5 text-center">
                <div className="mb-8">
                  <h1 className="mb-4 text-9xl font-bold text-gray-800">404</h1>
                  <h2 className="mb-4 text-4xl font-semibold text-gray-800">
                    Page Not Found
                  </h2>
                  <p className="mb-8 text-lg text-gray-600">
                    Sorry, we couldn't find the page you're looking for. The
                    page may have been moved, deleted, or the URL may be
                    incorrect.
                  </p>
                </div>
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                  <Link href="/">
                    <Button variant="primary" size="lg">
                      Go Back Home
                    </Button>
                  </Link>
                  <Link href="/training-courses">
                    <Button variant="filter" size="lg">
                      Browse Training Courses
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

