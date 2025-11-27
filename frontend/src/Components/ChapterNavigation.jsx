import React from 'react';
import { ChevronLeft, ChevronRight, ArrowUp } from 'lucide-react';

const ChapterNavigation = ({ 
  selectedChapter, 
  onNavigate, 
  onScrollToTop, 
  theme 
}) => {
  const isLight = theme === 'light';
  const currentId = selectedChapter?.id;

  // Logic to hide buttons
  const showPrev = currentId > 1;
  const showNext = currentId < 114;

  // Updated button styles: Reduced padding on mobile (px-3) vs desktop (md:px-5)
  const btnBase = `flex items-center justify-center gap-2 px-4 py-3 md:px-5 rounded-xl transition-all duration-200 font-medium border shrink-0 ${
    isLight 
      ? 'bg-white border-stone-200 text-stone-600 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200' 
      : 'bg-[#1a1b1d] border-white/5 text-gray-400 hover:bg-emerald-900/20 hover:text-emerald-400 hover:border-emerald-500/20'
  }`;

  return (
    // Changed to flex-row to keep items in one line on all devices
    <div className="flex flex-row items-center justify-between gap-2 md:gap-4 py-6 md:py-4 mt-0">
      
      {/* PREV CHAPTER */}
      <div className="flex-1 flex justify-start">
        {showPrev ? (
          <button 
            onClick={() => onNavigate(currentId - 1)}
            className={btnBase}
            title="Previous Chapter"
          >
            <ChevronLeft size={18} />
            {/* Hide text on mobile, show on md screens and up */}
            <span className="hidden md:inline">Previous Chapter</span>
          </button>
        ) : <div className="w-12 md:w-24" />} {/* Adjusted spacer width */}
      </div>

      {/* SCROLL TOP */}
      <button 
        onClick={onScrollToTop}
        className={`flex items-center justify-center gap-2 px-4 py-3 md:px-6 rounded-full shadow-lg transform hover:-translate-y-1 transition-all shrink-0 ${
           isLight ? 'bg-stone-200 text-stone-700 hover:bg-stone-300' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
        }`}
        title="Scroll to Top"
      >
        <ArrowUp size={18} />
        {/* Hide text on mobile */}
        <span className="text-sm font-bold hidden md:inline">Top</span>
      </button>

      {/* NEXT CHAPTER */}
      <div className="flex-1 flex justify-end">
        {showNext ? (
          <button 
            onClick={() => onNavigate(currentId + 1)}
            className={btnBase}
            title="Next Chapter"
          >
            {/* Text first on desktop for Next button, hidden on mobile */}
            <span className="hidden md:inline">Next Chapter</span>
            <ChevronRight size={18} />
          </button>
        ) : <div className="w-12 md:w-24" />}
      </div>

    </div>
  );
};

export default ChapterNavigation;