import React from "react";

interface HeaderProps {
  title: string;
  description?: string;
}

const Header: React.FC<HeaderProps> = ({ title, description }) => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
      {description && (
        <p className="text-gray-500 dark:text-gray-400 mt-1">{description}</p>
      )}
    </div>
  );
};

export default Header;
