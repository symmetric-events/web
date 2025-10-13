import React from 'react';
import { NewsletterSection } from '../NewsletterSection';
import { FooterInfo } from './FooterInfo';

export const Footer: React.FC = () => {
  return (
    <footer className="gt-footer gt-style-2">
      <div className="">
        <div className="gt-footer-content">
          <NewsletterSection />
          <FooterInfo />
        </div>
      </div>
    </footer>
  );
};
