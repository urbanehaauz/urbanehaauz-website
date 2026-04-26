import React from 'react';
import { interpolate, useCurrentFrame, Img, staticFile } from 'remotion';

interface ImageBackgroundProps {
  src: string;
  zoomIn?: boolean;
  panDirection?: 'left' | 'right' | 'up' | 'down' | 'none';
  overlay?: boolean;
  overlayColor?: string;
  overlayOpacity?: number;
  children?: React.ReactNode;
}

export const ImageBackground: React.FC<ImageBackgroundProps> = ({
  src,
  zoomIn = true,
  panDirection = 'none',
  overlay = true,
  overlayColor = '#000000',
  overlayOpacity = 0.4,
  children,
}) => {
  const frame = useCurrentFrame();

  const scale = zoomIn
    ? interpolate(frame, [0, 300], [1, 1.15], { extrapolateRight: 'clamp' })
    : 1;

  let translateX = 0;
  let translateY = 0;

  if (panDirection === 'left') {
    translateX = interpolate(frame, [0, 300], [0, -50], { extrapolateRight: 'clamp' });
  } else if (panDirection === 'right') {
    translateX = interpolate(frame, [0, 300], [0, 50], { extrapolateRight: 'clamp' });
  } else if (panDirection === 'up') {
    translateY = interpolate(frame, [0, 300], [0, -50], { extrapolateRight: 'clamp' });
  } else if (panDirection === 'down') {
    translateY = interpolate(frame, [0, 300], [0, 50], { extrapolateRight: 'clamp' });
  }

  return (
    <div
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <Img
        src={src}
        style={{
          position: 'absolute',
          width: '120%',
          height: '120%',
          objectFit: 'cover',
          left: '-10%',
          top: '-10%',
          transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
        }}
      />
      {overlay && (
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundColor: overlayColor,
            opacity: overlayOpacity,
          }}
        />
      )}
      {children}
    </div>
  );
};

// Gradient overlay component
export const GradientOverlay: React.FC<{
  direction?: 'top' | 'bottom' | 'left' | 'right';
  colors?: string[];
  opacity?: number;
}> = ({
  direction = 'bottom',
  colors = ['transparent', 'rgba(0,0,0,0.8)'],
  opacity = 1,
}) => {
  const gradientMap = {
    top: 'to top',
    bottom: 'to bottom',
    left: 'to left',
    right: 'to right',
  };

  return (
    <div
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        background: `linear-gradient(${gradientMap[direction]}, ${colors.join(', ')})`,
        opacity,
      }}
    />
  );
};
