import React from 'react';

interface CheckmarkItemProps {
  text: string;
  strongText: string;
  checkmarkSrc?: string;
}

export const CheckmarkItem: React.FC<CheckmarkItemProps> = ({ 
  text, 
  strongText, 
  checkmarkSrc = "https://www.symmetric.events/wp-content/uploads/2023/10/Check-Custom-Pic-For-Web-03-300x300.png" 
}) => {
  return (
    <p className="flex items-center text-gray-800">
      <img
        src={checkmarkSrc}
        alt=""
        width="25"
        height="25"
        className="mr-3"
      />
      <span>
        <strong>{strongText}</strong> {text}
      </span>
    </p>
  );
};
