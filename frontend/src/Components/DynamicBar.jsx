import { useState, useEffect, useRef } from 'react';
import ChapterDropdown from './ChapterDropdown';

function DynamicBar({ chapters, selectedChapter, onSelect }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const barRef = useRef(null); // 1. Ref to track the component

  // 2. Click Outside Logic
  useEffect(() => {
    function handleClickOutside(event) {
      // If dropdown is open AND the click target is NOT inside this component
      if (isDropdownOpen && barRef.current && !barRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on cleanup
      document.removeEventListener("mousedown", handleClickOutside);
    };
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
      ref={barRef} // 3. Attach Ref here
      className="relative pointer-events-auto z-50 flex flex-col items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleMobileClick}
    >
      {/* ANIMATION CONTAINER */}
      <div className={`
        relative bg-[#1a1b1d] border shadow-2xl transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] overflow-hidden flex flex-col
        w-[calc(100vw-120px)] md:w-[500px]
        ${isDropdownOpen 
          ? 'border-white/10 rounded-3xl max-h-[65vh]' 
          : 'border-white/10 hover:border-white/20 rounded-[20px] md:rounded-[22px] max-h-11 md:max-h-11'
        }
      `}>

        {/* --- 1. HEADER (THE BAR) --- */}
        <div className="h-10 md:h-11 w-full flex items-center justify-between px-3 md:px-5 cursor-pointer shrink-0 relative z-20 bg-[#1a1b1d]">
          {selectedChapter ? (
            <>
              {/* Left: English Name */}
              <span className="text-gray-200 font-medium text-sm md:text-base z-10 truncate max-w-[40%] md:max-w-none">
                {selectedChapter.translated_name.name}
              </span>

              {/* Center: Arabic Name */}
              <span className="absolute left-1/2 top-2/3 -translate-x-1/2 -translate-y-[55%] font-arabic text-lg md:text-xl text-emerald-500 pb-1 leading-none select-none pointer-events-none">
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