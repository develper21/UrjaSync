import React from 'react';

const LeafIcon = ({ className = 'w-6 h-6' }) => (
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
    <path d="M11 20A7 7 0 0 1 11 6V6C11 4 15 2 17 2s6 2 6 6v2.3" />
    <path d="M11 6V6C5 6 3 10 3 14c0 2 2 6 8 6Z" />
    <path d="M11 6V3" />
  </svg>
);

export default LeafIcon;
