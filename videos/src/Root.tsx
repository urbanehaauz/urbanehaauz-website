import { Composition } from 'remotion';
import { HeroVideo } from './compositions/HeroVideo';
import { RoomsVideo } from './compositions/RoomsVideo';
import { ExperiencesVideo } from './compositions/ExperiencesVideo';
import { FullMarketingVideo } from './compositions/FullMarketingVideo';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Hero Video - 15 seconds, ideal for Instagram Reels/Stories */}
      <Composition
        id="HeroVideo"
        component={HeroVideo}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{}}
      />

      {/* Rooms Showcase - 20 seconds */}
      <Composition
        id="RoomsVideo"
        component={RoomsVideo}
        durationInFrames={600}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{}}
      />

      {/* Experiences Video - 20 seconds */}
      <Composition
        id="ExperiencesVideo"
        component={ExperiencesVideo}
        durationInFrames={600}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{}}
      />

      {/* Full Marketing Video - 45 seconds for YouTube/Website */}
      <Composition
        id="FullMarketingVideo"
        component={FullMarketingVideo}
        durationInFrames={1350}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
    </>
  );
};
