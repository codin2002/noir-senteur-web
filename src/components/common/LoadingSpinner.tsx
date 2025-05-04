
import React from 'react';

interface LoadingSpinnerProps {
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ className = "py-12" }) => {
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className="w-10 h-10 border-4 border-t-gold border-b-gold border-r-transparent border-l-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default LoadingSpinner;
