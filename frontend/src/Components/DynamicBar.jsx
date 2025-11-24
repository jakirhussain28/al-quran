import { useState, useEffect, useRef } from 'react';
import ChapterDropdown from './ChapterDropdown';

function DynamicBar({ chapters, selectedChapter, onSelect }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const barRef = useRef(null);

  // 2. Click Outside Logic
  useEffect(() => {
    function handleClickOutside(event) {
      if (isDropdownOpen && barRef.current && !barRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

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

  const handleSelectInternal = (chapter) => {
    onSelect(chapter);
    setIsDropdownOpen(false);
  };

  return (
    <div 
      ref={barRef} 
      className="relative pointer-events-auto z-50 flex flex-col items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleMobileClick}
    >
      {/* ANIMATION CONTAINER */}
      <div className={`
        relative bg-[#1a1b1d] border shadow-2xl transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] overflow-hidden flex flex-col
        
        /* --- WIDTH LOGIC MODIFICATION START --- */
        ${isDropdownOpen 
          ? 'w-[94vw] md:w-[500px] border-white/10 rounded-3xl max-h-[65vh]' // Open: Full width on mobile
          : 'w-[calc(100vw-130px)] md:w-[500px] border-white/10 hover:border-white/20 rounded-[20px] md:rounded-[22px] max-h-11 md:max-h-11' // Closed: Fits between icons
        }
        /* --- WIDTH LOGIC MODIFICATION END --- */
      `}>

        {/* --- 1. HEADER (THE BAR) --- */}
        <div className="h-10 md:h-10.5 w-full flex items-center justify-between px-3 md:px-3 cursor-pointer shrink-0 relative z-20 bg-[#1a1b1d]">
          {selectedChapter ? (
            <>
              {/* Left: English Name - Truncate ensures it doesn't hit the Arabic text */}
              <span className={`
                text-gray-200 font-medium text-sm md:text-base z-10 truncate transition-all duration-300
                ${isDropdownOpen ? 'max-w-[35%]' : 'max-w-[40%]'} 
                md:max-w-none
              `}>
                {selectedChapter.translated_name.name}
              </span>

              {/* Center: Arabic Name */}
              <span className="absolute sm:left-1/2 top-3/5 left-4/7 -translate-x-1/2 -translate-y-[55%] font-arabic text-lg md:text-xl text-emerald-500 pb-1 leading-none select-none pointer-events-none">
                {selectedChapter.name_arabic}
              </span>

              {/* Right: Verses Count Badge */}
              <div className="z-10 flex items-center justify-center bg-[#2A2B2D] text-gray-400 rounded-full border border-white/5 h-7 min-w-6 md:min-w-7 px-2 md:px-3">
                <span className="text-[10px] font-mono md:hidden">
                  {selectedChapter.verses_count}
                </span>
                <span className="text-[11px] font-medium hidden md:inline">
                  {selectedChapter.verses_count} Verses
                </span>
              </div>
            </>
          ) : (
            <span className="text-gray-400 text-sm mx-auto">Select a Surah</span>
          )}
        </div>

        {/* --- 2. DROPDOWN LIST --- */}
        <div className={`
          flex-1 overflow-y-auto custom-scrollbar bg-[#1a1b1d]
          border-t border-gray-800/50
          transition-opacity duration-300 delay-75
          ${isDropdownOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}
        `}>
          <ChapterDropdown 
            chapters={chapters} 
            selectedChapter={selectedChapter} 
            onSelect={handleSelectInternal} 
          />
        </div>

      </div>
    </div>
  );
}

export default DynamicBar;