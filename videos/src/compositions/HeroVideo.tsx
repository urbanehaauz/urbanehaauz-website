import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
  Img,
} from 'remotion';
import { BRAND, Logo, GoldLine, CTAButton, HOTEL } from '../components/Brand';
import { FadeInText, ScaleInText } from '../components/AnimatedText';
import { GradientOverlay } from '../components/ImageBackground';

// Image URLs - Using Unsplash for high-quality mountain/hotel imagery
const IMAGES = {
  kanchenjunga: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1920&q=80',
  sunrise: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
  clouds: 'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?w=1920&q=80',
};

const AnimatedBackground: React.FC<{ src: string; delay?: number }> = ({ src, delay = 0 }) => {
  const frame = useCurrentFrame();

  const scale = interpolate(frame - delay, [0, 300], [1, 1.2], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });

  const opacity = interpolate(frame - delay, [0, 30], [0, 1], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });

  return (
    <AbsoluteFill style={{ opacity }}>
      <Img
        src={src}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale})`,
        }}
      />
      <GradientOverlay colors={['transparent', 'rgba(0,0,0,0.7)']} />
    </AbsoluteFill>
  );
};

export const HeroVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Fade out at the end
  const endOpacity = interpolate(
    frame,
    [durationInFrames - 30, durationInFrames],
    [1, 0],
    { extrapolateLeft: 'clamp' }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BRAND.colors.darkGreen,
        opacity: endOpacity,
      }}
    >
      {/* Scene 1: Opening with Kanchenjunga (0-150 frames / 0-5 seconds) */}
      <Sequence from={0} durationInFrames={150}>
        <AnimatedBackground src={IMAGES.kanchenjunga} />
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            padding: 60,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <FadeInText
              text="THE HIMALAYAS AWAIT"
              delay={30}
              fontSize={28}
              color={BRAND.colors.white}
              fontFamily={BRAND.fonts.sans}
              style={{ letterSpacing: '0.4em', opacity: 0.9 }}
            />
            <GoldLine delay={50} width={120} />
            <div style={{ marginTop: 40 }}>
              <Logo delay={70} size="large" />
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 2: Tagline (150-270 frames / 5-9 seconds) */}
      <Sequence from={150} durationInFrames={120}>
        <AnimatedBackground src={IMAGES.sunrise} />
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            padding: 60,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <ScaleInText
              text={`"${HOTEL.tagline}"`}
              delay={20}
              fontSize={56}
              color={BRAND.colors.white}
              fontFamily={BRAND.fonts.serif}
              fontWeight="normal"
              style={{ fontStyle: 'italic', maxWidth: 800 }}
            />
            <GoldLine delay={50} width={80} />
            <FadeInText
              text="Experience the magic of Kanchenjunga"
              delay={70}
              fontSize={28}
              color={BRAND.colors.gold}
              fontFamily={BRAND.fonts.sans}
            />
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 3: Features (270-390 frames / 9-13 seconds) */}
      <Sequence from={270} durationInFrames={120}>
        <AnimatedBackground src={IMAGES.clouds} />
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            padding: 60,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <FadeInText
              text="PANORAMIC VIEWS"
              delay={10}
              fontSize={42}
              color={BRAND.colors.gold}
              fontFamily={BRAND.fonts.sans}
              style={{ letterSpacing: '0.2em', marginBottom: 20 }}
            />
            <FadeInText
              text="MODERN COMFORTS"
              delay={30}
              fontSize={42}
              color={BRAND.colors.white}
              fontFamily={BRAND.fonts.sans}
              style={{ letterSpacing: '0.2em', marginBottom: 20 }}
            />
            <FadeInText
              text="AUTHENTIC CUISINE"
              delay={50}
              fontSize={42}
              color={BRAND.colors.gold}
              fontFamily={BRAND.fonts.sans}
              style={{ letterSpacing: '0.2em' }}
            />
            <GoldLine delay={70} width={150} />
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 4: CTA (390-450 frames / 13-15 seconds) */}
      <Sequence from={390} durationInFrames={60}>
        <AbsoluteFill
          style={{
            backgroundColor: BRAND.colors.darkGreen,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 60,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <Logo delay={0} size="medium" />
            <div style={{ marginTop: 60 }}>
              <CTAButton text="Book Your Stay" delay={15} />
            </div>
            <FadeInText
              text={HOTEL.website}
              delay={30}
              fontSize={24}
              color={BRAND.colors.gold}
              fontFamily={BRAND.fonts.sans}
              style={{ marginTop: 40, letterSpacing: '0.1em' }}
            />
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
