"use client";

import Link from "next/link";
import { NavLink } from "./NavLink";
import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

// Navigation items defined in a single source
const NAVIGATION_ITEMS = [
  { href: "/training-courses", label: "TRAINING COURSES" },
  { href: "/in-house-training", label: "IN-HOUSE TRAINING" },
  { href: "/consulting", label: "CONSULTING" },
  { href: "/clients", label: "CLIENTS" },
  { href: "/trainers", label: "TRAINERS" },
  { href: "/blog", label: "BLOG" },
  { href: "/about", label: "ABOUT US" },
  { href: "/contact", label: "CONTACT" },
];

// Reusable NavigationMenu component
interface NavigationMenuProps {
  isMobile?: boolean;
  className?: string;
}

const NavigationMenu: React.FC<NavigationMenuProps> = ({ isMobile = false, className = "" }) => {
  if (isMobile) {
    return (
      <nav className={`mobile-navigation ${className}`}>
        <ul className="flex flex-col space-y-3">
          {NAVIGATION_ITEMS.map((item) => (
            <li key={item.href} className="text-center">
              <NavLink href={item.href} className="block py-2 ">
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    );
  }

  return (
    <nav className={`navigation ${className}`}>
      <ul className="flex list-none gap-6 xl:gap-8">
        {NAVIGATION_ITEMS.map((item) => (
          <li key={item.href}>
            <NavLink href={item.href}>{item.label}</NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export const ScrollNavigation: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);
  return (
    <>
      {isHomePage ? (
        <>
          {/* Transparent Navigation (Homepage Only - When Not Scrolled) */}
          {!isScrolled && (
            <header className="absolute top-0 right-0 left-0 z-50 bg-gradient-to-b from-black/40 to-transparent py-4">
              <div className="mx-auto max-w-7xl px-5">
                <div className="flex items-center justify-between lg:justify-around">
                  <div className="logo">
                    <Link href="/" className="no-underline">
                      <Image
                        src="/api/media/file/Symmetric.png"
                        alt="Symmetric"
                        width={200}
                        height={0}
                        className="w-32 sm:w-40 md:w-48 lg:w-52 xl:w-56"
                      />
                    </Link>
                  </div>
                  
                  {/* Desktop Navigation */}
                  <div className="hidden lg:block">
                    <NavigationMenu />
                  </div>

                  {/* Mobile Menu Button */}
                  <button
                    className="lg:hidden text-white p-2"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle mobile menu"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {isMobileMenuOpen ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 12h16M4 18h16"
                        />
                      )}
                    </svg>
                  </button>
                </div>
              </div>
            </header>
          )}

          {/* Fixed Black Navigation (Homepage - When Scrolled) */}
          {isScrolled && (
            <StaticNavigation 
              isMobileMenuOpen={isMobileMenuOpen} 
              setIsMobileMenuOpen={setIsMobileMenuOpen} 
            />
          )}
        </>
      ) : (
        /* Fixed Black Navigation (All Other Pages) */
        <StaticNavigation 
          isMobileMenuOpen={isMobileMenuOpen} 
          setIsMobileMenuOpen={setIsMobileMenuOpen} 
        />
      )}

      {/* Mobile Menu - Shared between both navigation types */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed top-20 left-4 right-4 sm:left-auto md:text-lg sm:right-4 sm:w-72 z-40 bg-black/95 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
          <NavigationMenu isMobile={true} />
        </div>
      )}
      
    </>
  );
};

interface StaticNavigationProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

const StaticNavigation: React.FC<StaticNavigationProps> = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  return (
    <header className="fixed top-0 right-0 left-0 z-50 bg-black">
      <div className="mx-auto max-w-7xl px-5">
        <div className="flex items-center justify-between lg:justify-around py-4">
          <div className="logo">
            <Link href="/" className="no-underline">
              <Image
                src="/api/media/file/Symmetric.png"
                alt="Symmetric"
                width={200}
                height={0}
                className="w-32 sm:w-40 md:w-48 lg:w-52 xl:w-56"
              />
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <NavigationMenu />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-white p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};
