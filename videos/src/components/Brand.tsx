import React from 'react';
import { interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';

// Brand colors matching the hotel website
export const BRAND = {
  colors: {
    green: '#2D5A3D',
    darkGreen: '#1A3A28',
    lightGreen: '#4A7C5C',
    gold: '#C9A962',
    charcoal: '#2C3E50',
    mist: '#F5F5F5',
    white: '#FFFFFF',
  },
  fonts: {
    serif: 'Georgia, "Times New Roman", serif',
    sans: 'system-ui, -apple-system, sans-serif',
  },
};

// Hotel info
export const HOTEL = {
  name: 'Urbane Haauz',
  tagline: 'Where luxury meets the clouds',
  location: 'Pelling, West Sikkim',
  feature: 'Kanchenjunga Views',
  website: 'urbanehaauz.com',
};

// Logo component
export const Logo: React.FC<{
  delay?: number;
  size?: 'small' | 'medium' | 'large';
  color?: string;
}> = ({ delay = 0, size = 'medium', color = BRAND.colors.white }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sizeMap = {
    small: { title: 36, subtitle: 14 },
    medium: { title: 72, subtitle: 20 },
    large: { title: 120, subtitle: 32 },
  };

  const opacity = interpolate(
    frame - delay,
    [0, 30],
    [0, 1],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  const scale = spring({
    frame: frame - delay,
    fps,
    config: { damping: 100, mass: 0.5 },
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      <div
        style={{
          fontFamily: BRAND.fonts.serif,
          fontSize: sizeMap[size].title,
          color,
          fontWeight: 'normal',
          letterSpacing: '0.05em',
        }}
      >
        Urbane <span style={{ fontStyle: 'italic', fontWeight: 300 }}>Haauz</span>
      </div>
      <div
        style={{
          fontFamily: BRAND.fonts.sans,
          fontSize: sizeMap[size].subtitle,
          color: BRAND.colors.gold,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          marginTop: 10,
        }}
      >
        {HOTEL.location}
      </div>
    </div>
  );
};

// Call to action button
export const CTAButton: React.FC<{
  text: string;
  delay?: number;
}> = ({ text, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(
    frame - delay,
    [0, 20],
    [0, 1],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  const scale = spring({
    frame: frame - delay,
    fps,
    config: { damping: 100 },
  });

  return (
    <div
      style={{
        display: 'inline-block',
        backgroundColor: BRAND.colors.gold,
        color: BRAND.colors.darkGreen,
        padding: '20px 60px',
        fontSize: 24,
        fontFamily: BRAND.fonts.sans,
        fontWeight: 'bold',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      {text}
    </div>
  );
};

// Decorative line
export const GoldLine: React.FC<{
  delay?: number;
  width?: number;
}> = ({ delay = 0, width = 100 }) => {
  const frame = useCurrentFrame();

  const lineWidth = interpolate(
    frame - delay,
    [0, 30],
    [0, width],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  return (
    <div
      style={{
        width: lineWidth,
        height: 3,
        backgroundColor: BRAND.colors.gold,
        margin: '20px auto',
      }}
    />
  );
};
