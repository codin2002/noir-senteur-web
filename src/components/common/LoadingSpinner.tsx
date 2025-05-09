
import React from 'react';

interface LoadingSpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ className = "", size = "md" }) => {
  // Determine the size class based on the size prop
  let sizeClass = "w-10 h-10";
  
  if (size === "sm") {
    sizeClass = "w-4 h-4";
  } else if (size === "lg") {
    sizeClass = "w-16 h-16";
  }
  
  // Determine padding based on absence of className or presence of size
  const paddingClass = className === "" && size === "md" ? "py-12" : "";
  
  return (
    <div className={`flex justify-center items-center ${paddingClass} ${className}`}>
      <div className={`${sizeClass} border-4 border-t-gold border-b-gold border-r-transparent border-l-transparent rounded-full animate-spin`}></div>
    </div>
  );
};

export default LoadingSpinner;
