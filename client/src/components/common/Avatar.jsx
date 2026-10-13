import { getInitials } from '../../utils/formatters';

const colors = [
  'bg-teal-500',
  'bg-blue-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-rose-500',
  'bg-indigo-500',
];

const getColor = (name = '') => {
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
};

const Avatar = ({ name, photo, size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-base',
    xl: 'h-20 w-20 text-xl',
  };

  if (photo) {
    return (
      <img
        src={photo}
        alt={name || 'User avatar'}
        className={`rounded-full object-cover ${sizes[size]} ${className}`}
      />
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center font-semibold text-white ${getColor(name)} ${sizes[size]} ${className}`}
      aria-label={`${name} avatar`}
    >
      {getInitials(name)}
    </div>
  );
};

export default Avatar;
