import React from 'react';

function ChapterDropdown({ chapters, selectedChapter, onSelect }) {
  return (
    <div className="absolute top-full mt-2 left-0 w-full max-h-[60vh] overflow-y-auto 
      bg-[rgb(22,22,24)] border border-emerald-500 rounded-2xl shadow-2xl 
      z-50 custom-scrollbar flex flex-col">
      
      {/* Optional: Dropdown Header */}
      <div className="sticky top-0 bg-[rgb(22,22,24)] p-3 border-b border-gray-800 z-10">
        <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">Select Surah</span>
      </div>

      <ul className="p-2 space-y-1">
        {chapters.map((chapter) => (
          <li key={chapter.id}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(chapter);
              }}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group
                ${selectedChapter?.id === chapter.id 
                  ? 'bg-emerald-900/20 border border-emerald-500/30 text-emerald-400' 
                  : 'hover:bg-[rgb(37,38,40)] text-gray-300 border border-transparent'
                }`}
            >
              {/* Left: Number & English Name */}
              <div className="flex items-center gap-4">
                <span className={`text-xs font-mono w-6 h-6 flex items-center justify-center rounded-full 
                  ${selectedChapter?.id === chapter.id ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-500'}`}>
                  {chapter.id}
                </span>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{chapter.name_simple}</span>
                  {/* Translated name shown in your screenshots */}
                  <span className="text-[10px] text-gray-500">{chapter.translated_name?.name}</span>
                </div>
              </div>

              {/* Right: Arabic Name */}
              <span className={`font-arabic text-lg ${selectedChapter?.id === chapter.id ? 'text-emerald-500' : 'text-gray-500 group-hover:text-gray-400'}`}>
                {chapter.name_arabic}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ChapterDropdown;