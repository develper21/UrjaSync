import React from 'react';

const WasherIcon = ({ className = 'w-6 h-6' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <circle cx="12" cy="12" r="5" />
    <line x1="12" x2="12" y1="1" y2="3" />
    <line x1="17" x2="15.5" y1="5" y2="6.5" />
  </svg>
);

export default WasherIcon;
