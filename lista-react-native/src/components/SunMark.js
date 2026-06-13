import React from 'react';
import Svg, { Polygon, Circle } from 'react-native-svg';
import { colors } from '../theme';

// The 8-ray Philippine sun — Lista's brand mark.
export default function SunMark({ size = 40, ray = colors.gold, core = colors.navy }) {
  const angles = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40">
      {angles.map((a) => (
        <Polygon
          key={a}
          points="20,1.5 16.6,9 23.4,9"
          fill={ray}
          rotation={a}
          origin="20, 20"
        />
      ))}
      <Circle cx="20" cy="20" r="6.6" fill={core} />
    </Svg>
  );
}
