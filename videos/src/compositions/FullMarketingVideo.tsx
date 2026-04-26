import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
  Img,
  Audio,
} from 'remotion';
import { BRAND, Logo, GoldLine, CTAButton, HOTEL } from '../components/Brand';
import { FadeInText, ScaleInText } from '../components/AnimatedText';
import { GradientOverlay } from '../components/ImageBackground';

// High-quality landscape images for 16:9 format
const IMAGES = {
  kanchenjunga: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1920&q=80',
  sunrise: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
  clouds: 'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?w=1920&q=80',
  room1: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1920&q=80',
  room2: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1920&q=80',
  monastery: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=1920&q=80',
  bridge: 'https://images.unsplash.com/photo-1515859005217-8a1f08870f59?w=1920&q=80',
  lake: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1920&q=80',
};

const AnimatedScene: React.FC<{
  src: string;
  delay?: number;
  children?: React.ReactNode;
  panDirection?: 'left' | 'right' | 'none';
}> = ({ src, delay = 0, children, panDirection = 'none' }) => {
  const frame = useCurrentFrame();

  const scale = interpolate(frame - delay, [0, 300], [1, 1.15], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });

  const opacity = interpolate(frame - delay, [0, 30], [0, 1], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });

  let translateX = 0;
  if (panDirection === 'left') {
    translateX = interpolate(frame - delay, [0, 300], [0, -50], { extrapolateRight: 'clamp' });
  } else if (panDirection === 'right') {
    translateX = interpolate(frame - delay, [0, 300], [50, 0], { extrapolateRight: 'clamp' });
  }

  return (
    <AbsoluteFill style={{ opacity }}>
      <Img
        src={src}
        style={{
          width: '110%',
          height: '110%',
          objectFit: 'cover',
          marginLeft: '-5%',
          marginTop: '-5%',
          transform: `scale(${scale}) translateX(${translateX}px)`,
        }}
      />
      <GradientOverlay colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.6)']} />
      {children}
    </AbsoluteFill>
  );
};

const ContentBox: React.FC<{
  children: React.ReactNode;
  position?: 'left' | 'center' | 'right';
}> = ({ children, position = 'center' }) => {
  const alignMap = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
  };

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: alignMap[position] as any,
        padding: 80,
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(8px)',
          padding: 60,
          maxWidth: position === 'center' ? 900 : 600,
          textAlign: position === 'center' ? 'center' : 'left',
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};

export const FullMarketingVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  const endOpacity = interpolate(
    frame,
    [durationInFrames - 45, durationInFrames],
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
      {/* Scene 1: Grand Opening (0-180 frames / 0-6 seconds) */}
      <Sequence from={0} durationInFrames={180}>
        <AnimatedScene src={IMAGES.kanchenjunga} panDirection="left">
          <AbsoluteFill
            style={{
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <FadeInText
                text="THE HIMALAYAS AWAIT"
                delay={30}
                fontSize={24}
                color={BRAND.colors.white}
                fontFamily={BRAND.fonts.sans}
                style={{ letterSpacing: '0.5em' }}
              />
              <GoldLine delay={50} width={150} />
              <div style={{ marginTop: 30 }}>
                <Logo delay={70} size="large" />
              </div>
              <FadeInText
                text={`"${HOTEL.tagline}"`}
                delay={100}
                fontSize={36}
                color={BRAND.colors.white}
                fontFamily={BRAND.fonts.serif}
                style={{ fontStyle: 'italic', marginTop: 40 }}
              />
            </div>
          </AbsoluteFill>
        </AnimatedScene>
      </Sequence>

      {/* Scene 2: Location & Views (180-330 frames / 6-11 seconds) */}
      <Sequence from={180} durationInFrames={150}>
        <AnimatedScene src={IMAGES.sunrise} panDirection="right">
          <ContentBox position="left">
            <FadeInText
              text="WEST SIKKIM"
              delay={10}
              fontSize={20}
              color={BRAND.colors.gold}
              fontFamily={BRAND.fonts.sans}
              style={{ letterSpacing: '0.4em', textAlign: 'left' }}
            />
            <ScaleInText
              text="Experience the magic of Kanchenjunga"
              delay={25}
              fontSize={48}
              color={BRAND.colors.white}
              fontFamily={BRAND.fonts.serif}
              style={{ textAlign: 'left', lineHeight: 1.2 }}
            />
            <GoldLine delay={45} width={80} />
            <FadeInText
              text="Wake up to the world's third highest peak. Every room offers breathtaking views of the Himalayan range."
              delay={60}
              fontSize={22}
              color={BRAND.colors.white}
              fontFamily={BRAND.fonts.sans}
              style={{ textAlign: 'left', lineHeight: 1.6, opacity: 0.9 }}
            />
          </ContentBox>
        </AnimatedScene>
      </Sequence>

      {/* Scene 3: Rooms Preview (330-540 frames / 11-18 seconds) */}
      <Sequence from={330} durationInFrames={105}>
        <AnimatedScene src={IMAGES.room1}>
          <ContentBox position="right">
            <FadeInText
              text="ACCOMMODATION"
              delay={10}
              fontSize={18}
              color={BRAND.colors.gold}
              fontFamily={BRAND.fonts.sans}
              style={{ letterSpacing: '0.4em', textAlign: 'left' }}
            />
            <ScaleInText
              text="Curated Spaces"
              delay={20}
              fontSize={52}
              color={BRAND.colors.white}
              fontFamily={BRAND.fonts.serif}
              style={{ textAlign: 'left' }}
            />
            <GoldLine delay={35} width={80} />
            <FadeInText
              text="From cozy backpacker dorms to luxurious suites with panoramic balconies"
              delay={45}
              fontSize={22}
              color={BRAND.colors.white}
              fontFamily={BRAND.fonts.sans}
              style={{ textAlign: 'left', lineHeight: 1.5 }}
            />
            <FadeInText
              text="Starting from ₹800/night"
              delay={60}
              fontSize={28}
              color={BRAND.colors.gold}
              fontFamily={BRAND.fonts.serif}
              style={{ textAlign: 'left', marginTop: 20 }}
            />
          </ContentBox>
        </AnimatedScene>
      </Sequence>

      <Sequence from={435} durationInFrames={105}>
        <AnimatedScene src={IMAGES.room2}>
          <ContentBox position="left">
            <FadeInText
              text="CLOUD MIST DELUXE"
              delay={10}
              fontSize={18}
              color={BRAND.colors.gold}
              fontFamily={BRAND.fonts.sans}
              style={{ letterSpacing: '0.3em', textAlign: 'left' }}
            />
            <ScaleInText
              text="Luxury with a View"
              delay={20}
              fontSize={48}
              color={BRAND.colors.white}
              fontFamily={BRAND.fonts.serif}
              style={{ textAlign: 'left' }}
            />
            <div
              style={{
                display: 'flex',
                gap: 15,
                marginTop: 25,
                flexWrap: 'wrap',
              }}
            >
              {['Private Balcony', 'Breakfast Included', 'Smart TV', 'Mini Bar'].map((feature, i) => (
                <FadeInText
                  key={i}
                  text={feature}
                  delay={35 + i * 8}
                  fontSize={16}
                  color={BRAND.colors.white}
                  fontFamily={BRAND.fonts.sans}
                  style={{
                    backgroundColor: 'rgba(201, 169, 98, 0.3)',
                    padding: '8px 16px',
                    borderRadius: 4,
                  }}
                />
              ))}
            </div>
          </ContentBox>
        </AnimatedScene>
      </Sequence>

      {/* Scene 4: Experiences (540-810 frames / 18-27 seconds) */}
      <Sequence from={540} durationInFrames={90}>
        <AbsoluteFill
          style={{
            backgroundColor: BRAND.colors.darkGreen,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <FadeInText
              text="DISCOVER PELLING"
              delay={10}
              fontSize={22}
              color={BRAND.colors.gold}
              fontFamily={BRAND.fonts.sans}
              style={{ letterSpacing: '0.4em' }}
            />
            <GoldLine delay={25} width={100} />
            <ScaleInText
              text="Adventure at Every Turn"
              delay={35}
              fontSize={64}
              color={BRAND.colors.white}
              fontFamily={BRAND.fonts.serif}
            />
          </div>
        </AbsoluteFill>
      </Sequence>

      <Sequence from={630} durationInFrames={90}>
        <AnimatedScene src={IMAGES.monastery} panDirection="right">
          <ContentBox position="left">
            <FadeInText
              text="1.5 KM FROM HOTEL"
              delay={5}
              fontSize={16}
              color={BRAND.colors.gold}
              fontFamily={BRAND.fonts.sans}
              style={{ letterSpacing: '0.3em', textAlign: 'left' }}
            />
            <ScaleInText
              text="Pemayangtse Monastery"
              delay={15}
              fontSize={42}
              color={BRAND.colors.white}
              fontFamily={BRAND.fonts.serif}
              style={{ textAlign: 'left' }}
            />
            <FadeInText
              text="One of Sikkim's oldest and most sacred Buddhist monasteries"
              delay={30}
              fontSize={20}
              color={BRAND.colors.white}
              fontFamily={BRAND.fonts.serif}
              style={{ fontStyle: 'italic', textAlign: 'left', marginTop: 15 }}
            />
          </ContentBox>
        </AnimatedScene>
      </Sequence>

      <Sequence from={720} durationInFrames={90}>
        <AnimatedScene src={IMAGES.bridge} panDirection="left">
          <ContentBox position="right">
            <FadeInText
              text="8 KM FROM HOTEL"
              delay={5}
              fontSize={16}
              color={BRAND.colors.gold}
              fontFamily={BRAND.fonts.sans}
              style={{ letterSpacing: '0.3em', textAlign: 'left' }}
            />
            <ScaleInText
              text="Singshore Bridge"
              delay={15}
              fontSize={42}
              color={BRAND.colors.white}
              fontFamily={BRAND.fonts.serif}
              style={{ textAlign: 'left' }}
            />
            <FadeInText
              text="Asia's second-highest suspension bridge with spectacular valley views"
              delay={30}
              fontSize={20}
              color={BRAND.colors.white}
              fontFamily={BRAND.fonts.serif}
              style={{ fontStyle: 'italic', textAlign: 'left', marginTop: 15 }}
            />
          </ContentBox>
        </AnimatedScene>
      </Sequence>

      {/* Scene 5: Amenities (810-990 frames / 27-33 seconds) */}
      <Sequence from={810} durationInFrames={180}>
        <AnimatedScene src={IMAGES.clouds}>
          <AbsoluteFill
            style={{
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <FadeInText
                text="MODERN ESSENTIALS"
                delay={10}
                fontSize={22}
                color={BRAND.colors.gold}
                fontFamily={BRAND.fonts.sans}
                style={{ letterSpacing: '0.4em' }}
              />
              <GoldLine delay={25} width={100} />
              <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 25 }}>
                <FadeInText
                  text="High-Speed Fiber Internet"
                  delay={40}
                  fontSize={42}
                  color={BRAND.colors.white}
                  fontFamily={BRAND.fonts.serif}
                />
                <FadeInText
                  text="24/7 Power Backup"
                  delay={60}
                  fontSize={42}
                  color={BRAND.colors.white}
                  fontFamily={BRAND.fonts.serif}
                />
                <FadeInText
                  text="Organic Sikkimese Cuisine"
                  delay={80}
                  fontSize={42}
                  color={BRAND.colors.white}
                  fontFamily={BRAND.fonts.serif}
                />
              </div>
              <GoldLine delay={100} width={150} />
              <FadeInText
                text="Where Mountains Meet Modern Comfort"
                delay={115}
                fontSize={28}
                color={BRAND.colors.gold}
                fontFamily={BRAND.fonts.serif}
                style={{ fontStyle: 'italic', marginTop: 20 }}
              />
            </div>
          </AbsoluteFill>
        </AnimatedScene>
      </Sequence>

      {/* Scene 6: Testimonial (990-1140 frames / 33-38 seconds) */}
      <Sequence from={990} durationInFrames={150}>
        <AnimatedScene src={IMAGES.lake}>
          <AbsoluteFill
            style={{
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                backgroundColor: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(10px)',
                padding: 60,
                maxWidth: 800,
                textAlign: 'center',
              }}
            >
              <FadeInText
                text="GUEST STORIES"
                delay={10}
                fontSize={18}
                color={BRAND.colors.gold}
                fontFamily={BRAND.fonts.sans}
                style={{ letterSpacing: '0.4em' }}
              />
              <GoldLine delay={20} width={60} />
              <ScaleInText
                text={`"The view from the balcony is literally breathtaking. Waking up to Kanchenjunga was a dream."`}
                delay={35}
                fontSize={32}
                color={BRAND.colors.white}
                fontFamily={BRAND.fonts.serif}
                fontWeight="normal"
                style={{ fontStyle: 'italic', lineHeight: 1.5 }}
              />
              <FadeInText
                text="- Priya D."
                delay={70}
                fontSize={22}
                color={BRAND.colors.gold}
                fontFamily={BRAND.fonts.sans}
                style={{ marginTop: 30 }}
              />
            </div>
          </AbsoluteFill>
        </AnimatedScene>
      </Sequence>

      {/* Scene 7: Final CTA (1140-1350 frames / 38-45 seconds) */}
      <Sequence from={1140} durationInFrames={210}>
        <AbsoluteFill
          style={{
            background: `linear-gradient(135deg, ${BRAND.colors.darkGreen} 0%, ${BRAND.colors.green} 100%)`,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <FadeInText
              text="YOUR MOUNTAIN HOME AWAITS"
              delay={15}
              fontSize={22}
              color={BRAND.colors.gold}
              fontFamily={BRAND.fonts.sans}
              style={{ letterSpacing: '0.4em' }}
            />
            <GoldLine delay={30} width={120} />
            <div style={{ marginTop: 30 }}>
              <Logo delay={45} size="large" />
            </div>
            <FadeInText
              text="Escape the chaos. Embrace the clouds."
              delay={80}
              fontSize={32}
              color={BRAND.colors.white}
              fontFamily={BRAND.fonts.serif}
              style={{ fontStyle: 'italic', marginTop: 40 }}
            />
            <div style={{ marginTop: 50 }}>
              <CTAButton text="Book Your Stay" delay={100} />
            </div>
            <FadeInText
              text="Best Rate Guarantee · Instant Confirmation"
              delay={120}
              fontSize={18}
              color={BRAND.colors.white}
              fontFamily={BRAND.fonts.sans}
              style={{ marginTop: 30, opacity: 0.8, letterSpacing: '0.1em' }}
            />
            <FadeInText
              text={HOTEL.website}
              delay={135}
              fontSize={28}
              color={BRAND.colors.gold}
              fontFamily={BRAND.fonts.sans}
              style={{ marginTop: 40, letterSpacing: '0.15em' }}
            />
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
