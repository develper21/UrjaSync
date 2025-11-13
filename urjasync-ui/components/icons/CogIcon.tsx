import React from 'react';

const CogIcon = ({ className = 'w-6 h-6' }) => (
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
    <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
    <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
    <path d="M12 2v2" />
    <path d="M12 22v-2" />
    <path d="m17 20.66-1-1.73" />
    <path d="m11 4.73-1 1.73" />
    <path d="m7 20.66 1-1.73" />
    <path d="m13 4.73 1 1.73" />
    <path d="M4.73 17H2.99" />
    <path d="M21 7h-1.73" />
    <path d="M4.73 7H2.99" />
    <path d="M21 17h-1.73" />
  </svg>
);

export default CogIcon;
