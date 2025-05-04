
import React from 'react';

interface ProfileHeaderProps {
  title: string;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ title }) => {
  return (
    <div className="mb-8 text-center">
      <h1 className="text-3xl md:text-4xl font-serif mb-2">{title}</h1>
      <div className="w-24 h-0.5 bg-gold mx-auto"></div>
    </div>
  );
};

export default ProfileHeader;
