import React from 'react';

function ChapterDropdown({ chapters, selectedChapter, onSelect }) {
  return (
    <ul className="p-2 space-y-1">
      {chapters.map((chapter) => (
        <li key={chapter.id}>
          <button
            onClick={(e) => {
              e.stopPropagation(); 
              onSelect(chapter);
            }}
            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group text-left
              ${selectedChapter?.id === chapter.id 
                ? 'bg-emerald-900/20 text-emerald-400' 
                : 'hover:bg-[rgb(37,38,40)] text-gray-300'
              }`}
          >
            {/* Left Side: Number + Names */}
            <div className="flex items-center gap-4 min-w-0 flex-1">
              {/* Chapter Number */}
              <span className={`text-xs font-mono w-6 h-6 flex items-center justify-center rounded-full shrink-0
                ${selectedChapter?.id === chapter.id ? 'bg-emerald-500/20' : 'bg-gray-800 text-gray-500'}`}>
                {chapter.id}
              </span>
              
              {/* Names Container */}
              <div className="flex flex-col items-start overflow-hidden">
                <span className="text-sm font-medium truncate w-full">{chapter.name_simple}</span>
                <span className={`font-arabic text-sm mt-0.5 ${selectedChapter?.id === chapter.id ? 'text-emerald-500' : 'text-gray-500 group-hover:text-gray-400'}`}>
                  {chapter.name_arabic}
                </span>
              </div>
            </div>

            {/* Right Side: Total Verses */}
            <span className="text-[10px] text-gray-500 font-mono bg-white/5 px-2 py-1 rounded-2xl shrink-0 ml-2">
              {chapter.verses_count} Verses
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export default ChapterDropdown;