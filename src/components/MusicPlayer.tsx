import { useState, useEffect, useRef } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Music, Play, Pause, Volume2, VolumeX, SkipForward, ExternalLink, X } from "lucide-react";

interface MusicPlayerProps {
  autoPlay?: boolean;
}

interface Track {
  title: string;
  url: string;
  embedId: string;
}

const LOFI_TRACKS: Track[] = [
  {
    title: "Lofi Hip Hop Radio 24/7",
    url: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
    embedId: "jfKfPfyJRdk"
  },
  {
    title: "Calm Lofi Study Beats",
    url: "https://www.youtube.com/watch?v=lTRiuFIWV54",
    embedId: "lTRiuFIWV54"
  },
  {
    title: "Peaceful Piano Study Music",
    url: "https://www.youtube.com/watch?v=5qap5aO4i9A",
    embedId: "5qap5aO4i9A"
  },
  {
    title: "Jazz Lofi Hip Hop",
    url: "https://www.youtube.com/watch?v=Dx5qFachd3A",
    embedId: "Dx5qFachd3A"
  }
];

export function MusicPlayer({ autoPlay = false }: MusicPlayerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(30);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const playerRef = useRef<HTMLIFrameElement>(null);

  const currentTrack = LOFI_TRACKS[currentTrackIndex];

  useEffect(() => {
    if (autoPlay) {
      setIsPlaying(true);
    }
  }, [autoPlay]);

  const togglePlay = () => {
    if (isPlaying) {
      // Pause by removing iframe
      setIsPlaying(false);
    } else {
      // Play by adding iframe
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    if (value[0] > 0) {
      setIsMuted(false);
    }
  };

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % LOFI_TRACKS.length);
  };

  const openInNewTab = () => {
    window.open(currentTrack.url, "_blank");
  };

  if (!isExpanded) {
    return (
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          onClick={() => setIsExpanded(true)}
          className="bg-[#7EC4B6] hover:bg-[#6BB3A5] text-[#1f3740] rounded-full w-14 h-14 shadow-lg"
          size="icon"
        >
          <Music className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <Card className="w-80 bg-[#2C4A52] border-[#7EC4B6]/20 shadow-xl">
        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="w-5 h-5 text-[#7EC4B6]" />
              <span className="text-white font-medium">Study Music</span>
            </div>
            <Button
              onClick={() => setIsExpanded(false)}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-[#A8DCD1]/60 hover:text-[#A8DCD1]"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Current Track */}
          <div className="bg-[#1f3740] rounded-lg p-3">
            <p className="text-[#A8DCD1] text-sm mb-1">Now Playing</p>
            <p className="text-white text-sm truncate">{currentTrack.title}</p>
          </div>

          {/* Hidden iframe for audio playback */}
          {isPlaying && (
            <iframe
              ref={playerRef}
              className="hidden"
              src={`https://www.youtube.com/embed/${currentTrack.embedId}?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=${currentTrack.embedId}`}
              allow="autoplay; encrypted-media"
              title="Music Player"
            />
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            <Button
              onClick={togglePlay}
              className="bg-[#7EC4B6] hover:bg-[#6BB3A5] text-[#1f3740] rounded-full w-12 h-12"
              size="icon"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </Button>
            <Button
              onClick={nextTrack}
              variant="outline"
              className="border-[#7EC4B6]/30 text-[#7EC4B6] hover:bg-[#7EC4B6]/10"
              size="icon"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
            <Button
              onClick={openInNewTab}
              variant="outline"
              className="border-[#7EC4B6]/30 text-[#7EC4B6] hover:bg-[#7EC4B6]/10"
              size="icon"
              title="Open in YouTube"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-3">
            <Button
              onClick={toggleMute}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-[#A8DCD1]/60 hover:text-[#A8DCD1]"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              onValueChange={handleVolumeChange}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-[#A8DCD1]/60 text-xs w-8 text-right">
              {isMuted ? 0 : volume}%
            </span>
          </div>

          {/* Track Selection */}
          <div className="space-y-1 max-h-40 overflow-y-auto">
            <p className="text-[#A8DCD1]/60 text-xs mb-2">Available Tracks</p>
            {LOFI_TRACKS.map((track, index) => (
              <button
                key={track.embedId}
                onClick={() => setCurrentTrackIndex(index)}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                  index === currentTrackIndex
                    ? "bg-[#7EC4B6]/20 text-[#7EC4B6]"
                    : "text-[#A8DCD1]/80 hover:bg-[#1f3740]"
                }`}
              >
                {track.title}
              </button>
            ))}
          </div>

          {/* Info */}
          <p className="text-[#A8DCD1]/40 text-xs text-center">
            Music helps maintain focus and reduces distractions
          </p>
        </div>
      </Card>
    </div>
  );
}