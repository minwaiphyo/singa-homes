import React from 'react';
import { AboutCardProps } from '@/types/components';

const AboutCard: React.FC<AboutCardProps> = ({ title, description }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-gray-900 mb-3">
        {title}
      </h3>
      <p className="text-gray-600 leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default AboutCard;