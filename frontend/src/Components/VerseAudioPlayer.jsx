import React from 'react';
import { Play, Pause, Loader2 } from 'lucide-react';

const VerseAudioPlayer = ({ 
  audioUrl, 
  isPlaying, 
  isLoading,
  onToggle, 
  theme 
}) => {
  const isLight = theme === 'light';

  // Theme-based coloring
  const buttonClass = isLight
    ? 'bg-stone-100 hover:bg-stone-200 text-emerald-600 border-stone-200'
    : 'bg-white/5 hover:bg-white/10 text-emerald-400 border-white/5';

  if (!audioUrl) return null;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      disabled={isLoading}
      className={`
        relative group flex items-center justify-center 
        w-10 h-10 rounded-full border transition-all duration-300
        ${buttonClass}
        ${isPlaying ? 'scale-120 ring-2 ring-emerald-500/20' : ''}
      `}
      aria-label={isPlaying ? "Pause" : "Play"}
    >
      {isLoading ? (
        <Loader2 size={18} className="animate-spin opacity-80" />
      ) : isPlaying ? (
        <Pause size={18} className="fill-current" />
      ) : (
        <Play size={18} className="fill-current ml-0.5" />
      )}
    </button>
  );
};

export default VerseAudioPlayer;