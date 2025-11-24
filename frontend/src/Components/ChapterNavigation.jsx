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

  const btnBase = `flex items-center gap-2 px-5 py-3 rounded-xl transition-all duration-200 font-medium border ${
    isLight 
      ? 'bg-white border-stone-200 text-stone-600 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200' 
      : 'bg-[#1a1b1d] border-white/5 text-gray-400 hover:bg-emerald-900/20 hover:text-emerald-400 hover:border-emerald-500/20'
  }`;

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-8 border-t border-dashed border-gray-700/30 mt-8">
      
      {/* PREV CHAPTER */}
      <div className="flex-1 flex justify-start w-full md:w-auto">
        {showPrev ? (
          <button 
            onClick={() => onNavigate(currentId - 1)}
            className={btnBase}
          >
            <ChevronLeft size={18} />
            <span>Prev Chapter</span>
          </button>
        ) : <div className="w-24" />} 
      </div>

      {/* SCROLL TOP */}
      <button 
        onClick={onScrollToTop}
        className={`flex items-center gap-2 px-6 py-3 rounded-full shadow-lg transform hover:-translate-y-1 transition-all ${
           isLight ? 'bg-stone-200 text-stone-700 hover:bg-stone-300' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
        }`}
      >
        <ArrowUp size={18} />
        <span className="text-sm font-bold">Top</span>
      </button>

      {/* NEXT CHAPTER */}
      <div className="flex-1 flex justify-end w-full md:w-auto">
        {showNext ? (
          <button 
            onClick={() => onNavigate(currentId + 1)}
            className={btnBase}
          >
            <span>Next Chapter</span>
            <ChevronRight size={18} />
          </button>
        ) : <div className="w-24" />}
      </div>

    </div>
  );
};

export default ChapterNavigation;