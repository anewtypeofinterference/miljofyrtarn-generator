'use client';

import React from 'react';

export default function ColorSwatch({ color, isSelected, onClick }) {
  // Decide whether to show a pattern image instead
  const usePattern = color === 'transparent';

  return (
    <div
      onClick={onClick}
      style={{
        width: '24px',
        height: '24px',

        backgroundColor: usePattern ? 'transparent' : color,
        backgroundImage: usePattern ? "url('/pattern.png')" : 'none',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',

        border: isSelected
          ? '2px solid #000'
          : color === '#FFFFFF'
          ? '1px solid #D3D3D3'
          : 'none',

        cursor: 'pointer',
        borderRadius: '20px',
      }}
      title={color}
    />
  );
}
