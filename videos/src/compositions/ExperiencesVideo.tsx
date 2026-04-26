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

// Local experiences from the hotel
const EXPERIENCES = [
  {
    name: 'Pelling Skywalk',
    description: 'India\'s first glass skywalk at 7,200 feet',
    distance: '2 km from hotel',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80',
  },
  {
    name: 'Rabdentse Ruins',
    description: '17th-century palace of Sikkim\'s second capital',
    distance: '3 km from hotel',
    image: 'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=1920&q=80',
  },
  {
    name: 'Khecheopalri Lake',
    description: 'The sacred wish-fulfilling lake',
    distance: '28 km from hotel',
    image: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1920&q=80',
  },
  {
    name: 'Singshore Bridge',
    description: 'Asia\'s second-highest suspension bridge',
    distance: '8 km from hotel',
    image: 'https://images.unsplash.com/photo-1515859005217-8a1f08870f59?w=1920&q=80',
  },
  {
    name: 'Pemayangtse Monastery',
    description: 'One of Sikkim\'s oldest Buddhist monasteries',
    distance: '1.5 km from hotel',
    image: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=1920&q=80',
  },
];

const ExperienceSlide: React.FC<{
  experience: typeof EXPERIENCES[0];
  delay?: number;
}> = ({ experience, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = interpolate(frame - delay, [0, 150], [1, 1.2], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });

  const contentOpacity = interpolate(frame - delay, [0, 25], [0, 1], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });

  const slideIn = spring({
    frame: frame - delay - 5,
    fps,
    config: { damping: 100 },
  });

  const translateX = interpolate(slideIn, [0, 1], [-80, 0]);

  return (
    <AbsoluteFill>
      <Img
        src={experience.image}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale})`,
        }}
      />
      <GradientOverlay
        direction="bottom"
        colors={['transparent', 'rgba(0,0,0,0.9)']}
      />

      <AbsoluteFill
        style={{
          justifyContent: 'flex-end',
          padding: 60,
          paddingBottom: 200,
          opacity: contentOpacity,
          transform: `translateX(${translateX}px)`,
        }}
      >
        <div
          style={{
            borderLeft: `4px solid ${BRAND.colors.gold}`,
            paddingLeft: 30,
          }}
        >
          <div
            style={{
              fontSize: 16,
              color: BRAND.colors.gold,
              fontFamily: BRAND.fonts.sans,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              marginBottom: 15,
            }}
          >
            {experience.distance}
          </div>
          <div
            style={{
              fontSize: 52,
              color: BRAND.colors.white,
              fontFamily: BRAND.fonts.serif,
              fontWeight: 'bold',
              marginBottom: 15,
              lineHeight: 1.1,
            }}
          >
            {experience.name}
          </div>
          <div
            style={{
              fontSize: 26,
              color: BRAND.colors.white,
              fontFamily: BRAND.fonts.serif,
              fontStyle: 'italic',
              opacity: 0.9,
            }}
          >
            {experience.description}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const ExperiencesVideo: React.FC = () => {
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
      {/* Intro (0-75 frames) */}
      <Sequence from={0} durationInFrames={75}>
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
              fontSize={24}
              color={BRAND.colors.gold}
              fontFamily={BRAND.fonts.sans}
              style={{ letterSpacing: '0.4em' }}
            />
            <GoldLine delay={25} width={80} />
            <ScaleInText
              text="Local Experiences"
              delay={35}
              fontSize={68}
              color={BRAND.colors.white}
              fontFamily={BRAND.fonts.serif}
            />
            <FadeInText
              text="Adventure awaits at every turn"
              delay={50}
              fontSize={26}
              color={BRAND.colors.white}
              fontFamily={BRAND.fonts.serif}
              style={{ fontStyle: 'italic', marginTop: 20, opacity: 0.8 }}
            />
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Experience slides - each 75 frames (2.5 seconds) */}
      {EXPERIENCES.map((exp, i) => (
        <Sequence key={i} from={75 + i * 75} durationInFrames={75}>
          <ExperienceSlide experience={exp} />
        </Sequence>
      ))}

      {/* CTA (450-600 frames) */}
      <Sequence from={450} durationInFrames={150}>
        <AbsoluteFill
          style={{
            backgroundColor: BRAND.colors.darkGreen,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <FadeInText
              text="YOUR BASE FOR ADVENTURE"
              delay={10}
              fontSize={22}
              color={BRAND.colors.gold}
              fontFamily={BRAND.fonts.sans}
              style={{ letterSpacing: '0.3em' }}
            />
            <GoldLine delay={25} width={100} />
            <div style={{ marginTop: 20 }}>
              <Logo delay={35} size="medium" />
            </div>
            <FadeInText
              text="We arrange guided tours, transportation & packed lunches"
              delay={55}
              fontSize={24}
              color={BRAND.colors.white}
              fontFamily={BRAND.fonts.serif}
              style={{ fontStyle: 'italic', marginTop: 40, maxWidth: 700 }}
            />
            <div style={{ marginTop: 50 }}>
              <CTAButton text="Plan Your Trip" delay={70} />
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
