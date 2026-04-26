# Urbane Haauz Marketing Videos

Professional marketing videos for Urbane Haauz hotel, built with [Remotion](https://remotion.dev).

## Videos Included

### 1. Hero Video (15 seconds)
- **Format**: 1080x1920 (Vertical - Instagram Reels/Stories)
- **Purpose**: Quick brand introduction with Kanchenjunga views
- **Scenes**: Opening, Tagline, Features, CTA

### 2. Rooms Showcase (20 seconds)
- **Format**: 1080x1920 (Vertical - Instagram Reels/Stories)
- **Purpose**: Showcase all room categories
- **Rooms Featured**:
  - Backpacker Dorm (₹800/night)
  - Kanchenjunga View Standard (₹3,500/night)
  - Cloud Mist Deluxe (₹5,000/night)
  - Royal Summit Suite (₹7,500/night)

### 3. Experiences Video (20 seconds)
- **Format**: 1080x1920 (Vertical - Instagram Reels/Stories)
- **Purpose**: Highlight local attractions near the hotel
- **Experiences Featured**:
  - Pelling Skywalk
  - Rabdentse Ruins
  - Khecheopalri Lake
  - Singshore Bridge
  - Pemayangtse Monastery

### 4. Full Marketing Video (45 seconds)
- **Format**: 1920x1080 (Horizontal - YouTube/Website)
- **Purpose**: Complete marketing video for website and YouTube
- **Includes**: All of the above plus testimonials and amenities

## Getting Started

### Prerequisites
- Node.js 18+ installed
- Chrome/Chromium browser (for rendering)

### Installation

```bash
# Install dependencies (if not already done)
npm install

# Preview videos in Remotion Studio
npm run remotion:studio
```

### Rendering Videos

```bash
# Render individual videos
npm run remotion:render:hero           # Hero video (15s vertical)
npm run remotion:render:rooms          # Rooms showcase (20s vertical)
npm run remotion:render:experiences    # Experiences video (20s vertical)
npm run remotion:render:full           # Full marketing video (45s horizontal)

# Render all videos at once
npm run remotion:render:all
```

Videos will be saved to the `out/` directory:
- `out/HeroVideo.mp4`
- `out/RoomsVideo.mp4`
- `out/ExperiencesVideo.mp4`
- `out/FullMarketingVideo.mp4`

## Project Structure

```
videos/
├── src/
│   ├── index.ts              # Entry point
│   ├── Root.tsx              # Composition registry
│   ├── compositions/
│   │   ├── HeroVideo.tsx     # Hero/intro video
│   │   ├── RoomsVideo.tsx    # Rooms showcase
│   │   ├── ExperiencesVideo.tsx  # Local experiences
│   │   └── FullMarketingVideo.tsx  # Complete marketing video
│   └── components/
│       ├── AnimatedText.tsx  # Text animation components
│       ├── ImageBackground.tsx  # Background with effects
│       └── Brand.tsx         # Brand colors, logo, CTA components
├── public/                   # Static assets
└── README.md                 # This file
```

## Customization

### Brand Colors
Edit `videos/src/components/Brand.tsx`:
```typescript
export const BRAND = {
  colors: {
    green: '#2D5A3D',
    darkGreen: '#1A3A28',
    gold: '#C9A962',
    // ... add your colors
  },
};
```

### Images
The videos use Unsplash images by default. To use your own images:
1. Add images to `videos/public/`
2. Use `staticFile('your-image.jpg')` in the compositions
3. Or replace the Unsplash URLs with your own CDN URLs

### Adding New Videos
1. Create a new composition in `videos/src/compositions/`
2. Register it in `videos/src/Root.tsx`
3. Add a render script in `package.json`

## Tips for Best Results

1. **Instagram/TikTok**: Use the vertical videos (Hero, Rooms, Experiences)
2. **YouTube**: Use the Full Marketing Video (horizontal)
3. **Website**: Use the Full Marketing Video or embed via @remotion/player
4. **Add Music**: Add audio files and use Remotion's `<Audio>` component

## Embedding in Website

The project includes a `VideoPlayer.tsx` component that uses `@remotion/player` for embedding videos directly in your React website. This allows real-time preview without needing to render MP4 files.

```tsx
import { Player } from '@remotion/player';
import { HeroVideo } from './videos/src/compositions/HeroVideo';

<Player
  component={HeroVideo}
  durationInFrames={450}
  fps={30}
  compositionWidth={1080}
  compositionHeight={1920}
  style={{ width: 300 }}
/>
```

## License

This video content is for Urbane Haauz marketing purposes only.

---

Made with ❤️ for Urbane Haauz, Pelling, Sikkim
