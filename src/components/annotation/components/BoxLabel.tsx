import React from 'react';

interface LabelProps {
  label: string;
}

export const BoxLabel: React.FC<LabelProps> = ({ label }) => {
  if (!label) return null;
  return <div className="box-label">{label}</div>;
};