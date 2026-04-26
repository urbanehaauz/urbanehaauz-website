import React from 'react';
import { interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';

interface AnimatedTextProps {
  text: string;
  delay?: number;
  fontSize?: number;
  color?: string;
  fontFamily?: string;
  fontWeight?: string;
  style?: React.CSSProperties;
}

export const FadeInText: React.FC<AnimatedTextProps> = ({
  text,
  delay = 0,
  fontSize = 48,
  color = '#ffffff',
  fontFamily = 'Georgia, serif',
  fontWeight = 'normal',
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(
    frame - delay,
    [0, 20],
    [0, 1],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  const translateY = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200, mass: 0.5 },
  });

  const y = interpolate(translateY, [0, 1], [30, 0]);

  return (
    <div
      style={{
        fontSize,
        color,
        fontFamily,
        fontWeight,
        opacity,
        transform: `translateY(${y}px)`,
        textAlign: 'center',
        ...style,
      }}
    >
      {text}
    </div>
  );
};

export const TypewriterText: React.FC<AnimatedTextProps> = ({
  text,
  delay = 0,
  fontSize = 48,
  color = '#ffffff',
  fontFamily = 'Georgia, serif',
  style = {},
}) => {
  const frame = useCurrentFrame();

  const charsToShow = Math.floor(
    interpolate(
      frame - delay,
      [0, text.length * 2],
      [0, text.length],
      { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
    )
  );

  return (
    <div
      style={{
        fontSize,
        color,
        fontFamily,
        textAlign: 'center',
        ...style,
      }}
    >
      {text.substring(0, charsToShow)}
      <span style={{ opacity: frame % 30 > 15 ? 1 : 0 }}>|</span>
    </div>
  );
};

export const ScaleInText: React.FC<AnimatedTextProps> = ({
  text,
  delay = 0,
  fontSize = 48,
  color = '#ffffff',
  fontFamily = 'Georgia, serif',
  fontWeight = 'bold',
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame: frame - delay,
    fps,
    config: { damping: 100, mass: 0.5, stiffness: 200 },
  });

  const opacity = interpolate(
    frame - delay,
    [0, 10],
    [0, 1],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  return (
    <div
      style={{
        fontSize,
        color,
        fontFamily,
        fontWeight,
        opacity,
        transform: `scale(${scale})`,
        textAlign: 'center',
        ...style,
      }}
    >
      {text}
    </div>
  );
};
