import React from 'react';

// Small shield-check glyph used for "verified on-chain" trust cues.
export function ShieldIcon({ size = 14, color = "#1F9D6B" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path
        d="M12 2l7 3v6c0 4.5-3 8.2-7 9-4-0.8-7-4.5-7-9V5l7-3z"
        fill={color}
        opacity={0.16}
      />
      <path
        d="M12 2l7 3v6c0 4.5-3 8.2-7 9-4-0.8-7-4.5-7-9V5l7-3z"
        fill="none"
        stroke={color}
        strokeWidth={1.6}
      />
      <path
        d="M8.7 12l2.1 2.1 4-4.3"
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Inline "verified on-chain" badge.
export function VerifiedBadge({ label = 'verified on-chain', color = '#1F9D6B' }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-heading)', fontSize: '11px', fontWeight: 600 }}>
      <ShieldIcon size={12} color={color} />
      <span style={{ color }}>{label}</span>
    </span>
  );
}
