import React, { useState } from 'react';
import { Player } from '@remotion/player';
import { Play, Pause, Volume2, VolumeX, Maximize, X } from 'lucide-react';

// Import video compositions
// Note: These are the same compositions used for rendering
// You can preview them directly in the browser

interface VideoPlayerProps {
  composition: React.FC;
  durationInFrames: number;
  width?: number;
  height?: number;
  fps?: number;
  title?: string;
  description?: string;
  autoPlay?: boolean;
  loop?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  composition,
  durationInFrames,
  width = 1080,
  height = 1920,
  fps = 30,
  title,
  description,
  autoPlay = false,
  loop = true,
}) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const aspectRatio = width / height;
  const isVertical = aspectRatio < 1;

  return (
    <div className="relative group">
      {title && (
        <div className="mb-4">
          <h3 className="font-serif text-xl font-bold text-urbane-charcoal">{title}</h3>
          {description && (
            <p className="text-gray-500 text-sm mt-1">{description}</p>
          )}
        </div>
      )}

      <div
        className={`relative overflow-hidden rounded-lg shadow-xl ${
          isVertical ? 'max-w-sm mx-auto' : 'w-full'
        }`}
        style={{ aspectRatio: `${width}/${height}` }}
      >
        <Player
          component={composition}
          durationInFrames={durationInFrames}
          compositionWidth={width}
          compositionHeight={height}
          fps={fps}
          autoPlay={isPlaying}
          loop={loop}
          style={{
            width: '100%',
            height: '100%',
          }}
          controls={false}
        />

        {/* Custom Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full transition-colors"
              >
                {isPlaying ? (
                  <Pause size={18} className="text-white" />
                ) : (
                  <Play size={18} className="text-white ml-0.5" />
                )}
              </button>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full transition-colors"
              >
                {isMuted ? (
                  <VolumeX size={18} className="text-white" />
                ) : (
                  <Volume2 size={18} className="text-white" />
                )}
              </button>
            </div>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full transition-colors"
            >
              <Maximize size={18} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Video Gallery component to showcase all marketing videos
export const VideoGallery: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const videos = [
    {
      id: 'hero',
      title: 'Welcome to Urbane Haauz',
      description: 'Experience the magic of Kanchenjunga',
      thumbnail: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&q=80',
      duration: '15s',
      format: 'Reel/Story',
    },
    {
      id: 'rooms',
      title: 'Our Accommodation',
      description: 'From backpacker dorms to luxury suites',
      thumbnail: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400&q=80',
      duration: '20s',
      format: 'Reel/Story',
    },
    {
      id: 'experiences',
      title: 'Local Experiences',
      description: 'Discover the treasures of Pelling',
      thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80',
      duration: '20s',
      format: 'Reel/Story',
    },
    {
      id: 'full',
      title: 'Complete Marketing Video',
      description: 'The full Urbane Haauz experience',
      thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80',
      duration: '45s',
      format: 'YouTube/Website',
    },
  ];

  return (
    <div className="py-16 bg-urbane-mist">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-urbane-gold uppercase tracking-widest font-semibold text-xs">
            Video Content
          </span>
          <h2 className="font-serif text-4xl text-urbane-charcoal font-bold mt-3">
            Marketing Videos
          </h2>
          <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
            Professional video content for your social media and marketing campaigns
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {videos.map((video) => (
            <div
              key={video.id}
              className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
              onClick={() => setSelectedVideo(video.id)}
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  width={640}
                  height={360}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play size={24} className="text-urbane-green ml-1" />
                  </div>
                </div>
                <div className="absolute top-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {video.duration}
                </div>
              </div>
              <div className="p-4">
                <div className="text-xs text-urbane-gold uppercase tracking-wider mb-1">
                  {video.format}
                </div>
                <h3 className="font-serif text-lg font-bold text-urbane-charcoal">
                  {video.title}
                </h3>
                <p className="text-gray-500 text-sm mt-1">{video.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="mt-12 bg-white rounded-lg p-8 shadow-lg">
          <h3 className="font-serif text-2xl font-bold text-urbane-charcoal mb-4">
            How to Render Videos
          </h3>
          <div className="prose max-w-none text-gray-600">
            <p className="mb-4">
              These videos are built with <strong>Remotion</strong> and can be rendered as MP4 files for your marketing campaigns.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm">
              <p className="text-gray-500 mb-2"># Preview videos in Remotion Studio</p>
              <p className="mb-4">npm run remotion:studio</p>

              <p className="text-gray-500 mb-2"># Render individual videos</p>
              <p className="mb-1">npm run remotion:render:hero</p>
              <p className="mb-1">npm run remotion:render:rooms</p>
              <p className="mb-1">npm run remotion:render:experiences</p>
              <p className="mb-4">npm run remotion:render:full</p>

              <p className="text-gray-500 mb-2"># Render all videos at once</p>
              <p>npm run remotion:render:all</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for video preview */}
      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <button
            className="absolute top-4 right-4 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
            onClick={() => setSelectedVideo(null)}
          >
            <X size={24} className="text-white" />
          </button>
          <div
            className="max-w-4xl w-full bg-urbane-charcoal rounded-lg p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-white text-center mb-4">
              Video preview requires Remotion Studio. Run:
            </p>
            <code className="block bg-black/50 text-urbane-gold p-4 rounded text-center font-mono">
              npm run remotion:studio
            </code>
            <p className="text-white/70 text-center mt-4 text-sm">
              Then select the "{selectedVideo}" composition in the studio
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
