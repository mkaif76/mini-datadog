import React from 'react';

// This is our new, reusable Logo component.
// It combines a custom SVG with the project name.
function Logo() {
  return (
    <div className="flex items-center gap-2">
      {/* This SVG is a custom design inspired by monitoring dashboards.
          It uses "stroke-current" which makes the SVG inherit the color
          of its parent text, making it theme-aware automatically.
      */}
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 3H21V21H3V3Z" className="stroke-current text-gray-400 dark:text-gray-600" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7 15L10 12L12 14L17 9" className="stroke-current text-accent-purple" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span className="text-xl font-bold text-gray-800 dark:text-white">Mini-Datadog</span>
    </div>
  );
}

export default Logo;