import React from 'react';

function ChapterDropdown({ chapters, selectedChapter, onSelect }) {
  return (
    <ul className="p-2 space-y-1">
      {chapters.map((chapter) => {
        const isSelected = selectedChapter?.id === chapter.id;
        
        return (
          <li key={chapter.id}>
            <button
              onClick={(e) => {
                e.stopPropagation(); 
                onSelect(chapter);
              }}
              className={`
                w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group text-left
                ${isSelected 
                  ? 'bg-emerald-900/20 text-emerald-400' 
                  : 'hover:bg-[rgb(37,38,40)] text-gray-300'
                }
              `}
            >
              {/* LEFT SIDE: Number + English/Arabic Names */}
              <div className="flex items-center gap-4 min-w-0">
                {/* Chapter Number Badge */}
                <span className={`
                  text-xs font-mono w-8 h-8 flex items-center justify-center rounded-full shrink-0
                  ${isSelected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-500'}
                `}>
                  {chapter.id}
                </span>
                
                {/* Names Container */}
                <div className="flex flex-col items-start">
                  <span className={`text-sm font-medium truncate ${isSelected ? 'text-emerald-400' : 'text-gray-200'}`}>
                    {chapter.name_complex}
                  </span>
                  <span className={`font-arabic text-md mt-0.5 ${isSelected ? 'text-emerald-500/80' : 'text-gray-500 group-hover:text-gray-400'}`}>
                    {chapter.name_arabic}
                  </span>
                </div>
              </div>

              {/* CENTER (DESKTOP ONLY): Translated Name */}
              {/* hidden on mobile, visible block on md screens, takes up available flex space to center itself */}
              <div className="hidden md:block flex-1 text-center px-4">
                <span className={`text-sm font-medium ${isSelected ? 'text-emerald-400' : 'text-gray-200'}`}>
                  {chapter.translated_name.name}
                </span>
              </div>

              {/* RIGHT SIDE: Mobile Translation + Verses Count */}
              <div className="flex flex-col items-end ml-2 shrink-0">
                
                {/* Mobile Only: Translated Name (Stacked on top of badge) */}
                <span className={`md:hidden text-sm font-medium mb-1 ${isSelected ? 'text-emerald-400' : 'text-gray-200'}`}>
                   {chapter.translated_name.name}
                </span>

                {/* Verses Count Badge */}
                <span className={`
                  text-[10px] font-mono px-2 py-1 rounded-3xl
                  ${isSelected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-gray-500'}
                `}>
                  {chapter.verses_count} Verses
                </span>
              </div>

            </button>
          </li>
        );
      })}
    </ul>
  );
}

export default ChapterDropdown;