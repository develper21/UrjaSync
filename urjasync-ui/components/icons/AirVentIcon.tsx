import React from 'react';

const AirVentIcon = ({ className = 'w-6 h-6' }) => (
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
    <path d="M6 12H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2" />
    <path d="M6 8h12" />
    <path d="M18.3 17.7a2.5 2.5 0 0 1-3.16 3.16" />
    <path d="M12 12v10" />
    <path d="M8.84 14.84a2.5 2.5 0 0 1 3.16 3.16" />
  </svg>
);

export default AirVentIcon;
