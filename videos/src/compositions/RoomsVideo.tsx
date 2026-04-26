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

// Room data matching the hotel's actual offerings
const ROOMS = [
  {
    name: 'Backpacker Dorm',
    price: '₹800',
    tagline: 'Perfect for solo adventurers',
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1920&q=80',
    features: ['Free WiFi', 'Personal Lockers', 'Mountain Views'],
  },
  {
    name: 'Kanchenjunga View',
    price: '₹3,500',
    tagline: 'Wake up to the world\'s third highest peak',
    image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1920&q=80',
    features: ['King Bed', 'Room Heater', 'Tea/Coffee Maker'],
  },
  {
    name: 'Cloud Mist Deluxe',
    price: '₹5,000',
    tagline: 'Luxury with a view',
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1920&q=80',
    features: ['Private Balcony', 'Breakfast Included', 'Smart TV'],
  },
  {
    name: 'Royal Summit Suite',
    price: '₹7,500',
    tagline: 'The pinnacle of Himalayan luxury',
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1920&q=80',
    features: ['Living Room', 'Bathtub', '180° Panoramic Views'],
  },
];

const RoomCard: React.FC<{
  room: typeof ROOMS[0];
  delay?: number;
}> = ({ room, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = interpolate(frame - delay, [0, 200], [1, 1.15], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });

  const contentOpacity = interpolate(frame - delay, [0, 30], [0, 1], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });

  const slideUp = spring({
    frame: frame - delay - 10,
    fps,
    config: { damping: 100 },
  });

  const translateY = interpolate(slideUp, [0, 1], [100, 0]);

  return (
    <AbsoluteFill>
      <Img
        src={room.image}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale})`,
        }}
      />
      <GradientOverlay colors={['transparent', 'rgba(0,0,0,0.85)']} />

      <AbsoluteFill
        style={{
          justifyContent: 'flex-end',
          padding: 60,
          paddingBottom: 120,
          opacity: contentOpacity,
          transform: `translateY(${translateY}px)`,
        }}
      >
        <div
          style={{
            backgroundColor: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(10px)',
            padding: 40,
            borderLeft: `4px solid ${BRAND.colors.gold}`,
          }}
        >
          <div
            style={{
              fontSize: 18,
              color: BRAND.colors.gold,
              fontFamily: BRAND.fonts.sans,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            Starting from {room.price}/night
          </div>
          <div
            style={{
              fontSize: 48,
              color: BRAND.colors.white,
              fontFamily: BRAND.fonts.serif,
              fontWeight: 'bold',
              marginBottom: 15,
            }}
          >
            {room.name}
          </div>
          <div
            style={{
              fontSize: 24,
              color: BRAND.colors.white,
              fontFamily: BRAND.fonts.serif,
              fontStyle: 'italic',
              opacity: 0.9,
              marginBottom: 25,
            }}
          >
            {room.tagline}
          </div>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {room.features.map((feature, i) => (
              <div
                key={i}
                style={{
                  fontSize: 16,
                  color: BRAND.colors.white,
                  fontFamily: BRAND.fonts.sans,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  padding: '10px 20px',
                  borderRadius: 4,
                }}
              >
                {feature}
              </div>
            ))}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const RoomsVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

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
      {/* Intro (0-90 frames / 0-3 seconds) */}
      <Sequence from={0} durationInFrames={90}>
        <AbsoluteFill
          style={{
            backgroundColor: BRAND.colors.darkGreen,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <FadeInText
              text="ACCOMMODATION"
              delay={10}
              fontSize={24}
              color={BRAND.colors.gold}
              fontFamily={BRAND.fonts.sans}
              style={{ letterSpacing: '0.4em' }}
            />
            <GoldLine delay={30} width={80} />
            <ScaleInText
              text="Curated Spaces"
              delay={40}
              fontSize={72}
              color={BRAND.colors.white}
              fontFamily={BRAND.fonts.serif}
            />
            <FadeInText
              text="From solo travelers to families"
              delay={60}
              fontSize={28}
              color={BRAND.colors.white}
              fontFamily={BRAND.fonts.serif}
              style={{ fontStyle: 'italic', marginTop: 20, opacity: 0.8 }}
            />
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Room 1 - Backpacker Dorm (90-180) */}
      <Sequence from={90} durationInFrames={90}>
        <RoomCard room={ROOMS[0]} />
      </Sequence>

      {/* Room 2 - Standard (180-270) */}
      <Sequence from={180} durationInFrames={90}>
        <RoomCard room={ROOMS[1]} />
      </Sequence>

      {/* Room 3 - Deluxe (270-360) */}
      <Sequence from={270} durationInFrames={90}>
        <RoomCard room={ROOMS[2]} />
      </Sequence>

      {/* Room 4 - Suite (360-450) */}
      <Sequence from={360} durationInFrames={90}>
        <RoomCard room={ROOMS[3]} />
      </Sequence>

      {/* CTA (450-600) */}
      <Sequence from={450} durationInFrames={150}>
        <AbsoluteFill
          style={{
            backgroundColor: BRAND.colors.darkGreen,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <Logo delay={0} size="medium" />
            <FadeInText
              text="Best Rate Guarantee"
              delay={30}
              fontSize={28}
              color={BRAND.colors.white}
              fontFamily={BRAND.fonts.serif}
              style={{ fontStyle: 'italic', marginTop: 40 }}
            />
            <div style={{ marginTop: 50 }}>
              <CTAButton text="Book Direct & Save" delay={50} />
            </div>
            <FadeInText
              text={HOTEL.website}
              delay={70}
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
