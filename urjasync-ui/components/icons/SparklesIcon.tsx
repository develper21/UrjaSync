import React from 'react';

const SparklesIcon = ({ className = 'w-6 h-6' }) => (
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
    <path d="M12 3v.01" />
    <path d="M16.5 4.2a.5.5 0 0 0 .35.85 11.2 11.2 0 0 1-8.7 8.7.5.5 0 0 0-.85-.35 11.2 11.2 0 0 1 8.7-8.7z" />
    <path d="M18.8 9a.5.5 0 0 0 .85-.35 11.2 11.2 0 0 0-8.7-8.7.5.5 0 0 0-.35.85 11.2 11.2 0 0 0 8.7 8.7z" />
    <path d="M12 21v-.01" />
    <path d="M7.5 19.8a.5.5 0 0 0-.35-.85 11.2 11.2 0 0 1 8.7-8.7.5.5 0 0 0 .85.35 11.2 11.2 0 0 1-8.7 8.7z" />
    <path d="M5.2 15a.5.5 0 0 0-.85.35 11.2 11.2 0 0 0 8.7 8.7.5.5 0 0 0 .35-.85 11.2 11.2 0 0 0-8.7-8.7z" />
    <path d="M3 12h.01" />
    <path d="M21 12h-.01" />
  </svg>
);

export default SparklesIcon;
