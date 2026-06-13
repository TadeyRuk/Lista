import React from 'react';

// The 8-ray Philippine sun — Lista's brand mark.
export default function SunMark({ size = 40, ray = "#F4B53C", core = "#20306E" }) {
  const angles = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      {angles.map((a) => (
        <polygon
          key={a}
          points="20,1.5 16.6,9 23.4,9"
          fill={ray}
          transform={`rotate(${a} 20 20)`}
        />
      ))}
      <circle cx="20" cy="20" r="6.6" fill={core} />
    </svg>
  );
}
