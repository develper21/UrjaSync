import React from 'react';

const BatteryIcon = ({ className = 'w-6 h-6' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 28 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="1" y="3" width="22" height="10" rx="2" ry="2" />
    <line x1="25" y1="6" x2="27" y2="6" />
    <line x1="25" y1="10" x2="27" y2="10" />
    <path d="M6 11V5l4 3 4-3v6" />
  </svg>
);

export default BatteryIcon;
