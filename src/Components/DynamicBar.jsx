import { useState } from 'react';
import ChapterDropdown from './ChapterDropdown';

function DynamicBar({ chapters, selectedChapter, onSelect }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Desktop Hover Logic
  const handleMouseEnter = () => {
    if (window.innerWidth >= 1024) setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    if (window.innerWidth >= 1024) setIsDropdownOpen(false);
  };

  // Mobile Tap Logic
  const handleMobileClick = () => {
    if (window.innerWidth < 1024) setIsDropdownOpen(!isDropdownOpen);
  };

  // Wrapper to close dropdown after selection
  const handleSelectInternal = (chapter) => {
    onSelect(chapter);
    setIsDropdownOpen(false);
  };

  return (
    <div 
      className="relative pointer-events-auto"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleMobileClick}
    >
      {/* The Bar Itself */}
      <div className={`
        relative cursor-pointer h-10 md:h-11 bg-[#1a1b1d] border rounded-full flex items-center justify-between px-4 md:px-5 shadow-lg transition-all duration-300
        ${isDropdownOpen ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-white/10 hover:border-white/20'}
        w-[calc(100vw-120px)] md:w-[500px]
      `}>
        {selectedChapter ? (
          <>
            {/* Left: English Name */}
            <span className="text-gray-200 font-medium text-sm md:text-base z-10">
              {selectedChapter.name_simple}
            </span>

            {/* Center: Arabic Name (Absolute Centering) */}
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[55%] font-arabic text-lg md:text-xl text-emerald-500 pb-1 leading-none select-none">
              {selectedChapter.name_arabic}
            </span>

            {/* Right: Verses Count Badge */}
            <div className="z-10 flex items-center justify-center bg-[#2A2B2D] text-gray-400 rounded-full border border-white/5 h-7 min-w-[28px] md:px-3">
              {/* Mobile: Number Only (Circle) */}
              <span className="text-[10px] font-mono md:hidden">
                {selectedChapter.verses_count}
              </span>
              {/* Desktop: Text Pill */}
              <span className="text-[11px] font-medium hidden md:inline">
                {selectedChapter.verses_count} Verses
              </span>
            </div>
          </>
        ) : (
          <span className="text-gray-400 text-sm mx-auto">Select a Surah</span>
        )}
      </div>

      {/* THE DROPDOWN */}
      {isDropdownOpen && (
        <ChapterDropdown 
          chapters={chapters} 
          selectedChapter={selectedChapter} 
          onSelect={handleSelectInternal} 
        />
      )}
    </div>
  );
}

export default DynamicBar;