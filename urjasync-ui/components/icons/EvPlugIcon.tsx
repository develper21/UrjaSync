import React from 'react';

const EvPlugIcon = ({ className = 'w-6 h-6' }) => (
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
    <path d="M6 7h12v7a6 6 0 0 1-6 6 6 6 0 0 1-6-6Z" />
    <path d="M8 7V3" />
    <path d="M16 7V3" />
    <path d="M10 11l4 4" />
    <path d="M14 11l-4 4" />
  </svg>
);

export default EvPlugIcon;
