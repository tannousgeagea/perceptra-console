


export const ProjectThumbnail = ({ 
  thumbnail, 
  projectName, 
  projectType = 'object-detection' 
}: { 
  thumbnail?: string; 
  projectName: string;
  projectType?: string;
}) => {
  // Project type specific icons
  const typeIcons = {
    'object-detection': '🎯',
    'classification': '📊',
    'segmentation': '✂️',
    'tracking': '📹',
  };

  if (thumbnail) {
    return (
      <img 
        src={thumbnail} 
        alt={projectName}
        className="w-full h-full object-cover"
        onError={(e) => {
          // Fallback if image fails to load
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }

  const initials = projectName
    .split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const bgColors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-green-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-indigo-500',
  ];

  const colorIndex = projectName.charCodeAt(0) % bgColors.length;

  return (
    <div className={`w-full h-full ${bgColors[colorIndex]} flex flex-col items-center justify-center text-white`}>
      <div className="text-5xl mb-2">
        {typeIcons[projectType as keyof typeof typeIcons] || '📁'}
      </div>
      <div className="text-2xl font-bold">
        {initials}
      </div>
    </div>
  );
};