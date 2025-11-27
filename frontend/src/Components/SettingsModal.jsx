import React, { useEffect } from 'react';
import { Settings } from 'lucide-react';

function SettingsModal({ 
  isOpen, 
  onClose, 
  theme, 
  setTheme, 
  showTranslation, 
  setShowTranslation, 
  fontSize, 
  setFontSize 
}) {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const fontSizes = [1, 2, 3, 4, 5];
  const isLight = theme === 'light';

  // --- STYLES CONFIGURATION ---
  // Modal Container
  const modalBase = isLight 
    ? 'bg-white border-stone-200 shadow-xl' 
    : 'bg-[#121212] border-white/10 shadow-2xl';

  // The inner rows (Theme, Translation, Font)
  const rowBase = isLight
    ? 'bg-stone-100'
    : 'bg-[#192516]'; // Dark greenish for night

  // Text Colors
  const textActive = isLight ? 'text-stone-800' : 'text-gray-200';
  const textInactive = isLight ? 'text-stone-400' : 'text-gray-500';
  const labelColor = isLight ? 'text-stone-500' : 'text-gray-400';

  // Toggle/Slider Backgrounds
  const toggleTrack = isLight ? 'bg-stone-300' : 'bg-[#3e3e3e]';
  const sliderDotInactive = isLight ? 'bg-stone-400 hover:bg-stone-500' : 'bg-gray-500 hover:bg-gray-400';

  return (
    // 1. Backdrop with Blur & Centering
    <div 
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* 2. Modal Card */}
      <div 
        className={`w-[90%] max-w-[380px] rounded-4xl p-5 sm:p-6 relative  transition-colors duration-300 border ${modalBase}`}
        onClick={(e) => e.stopPropagation()} 
      >
        
        {/* 3. Gear Icon (Top Right) */}
        <div className="flex justify-end mb-2">
           <Settings className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors ${isLight ? 'text-stone-400' : 'text-gray-400'}`} />
        </div>

        <div className="space-y-4 sm:space-y-5">
          
          {/* --- ROW 1: THEME --- */}
          <div className={`${rowBase} rounded-3xl h-16 sm:h-20 px-4 sm:px-6 flex items-center justify-between gap-2 transition-colors duration-300`}>
            <span className={`text-sm sm:text-base font-medium whitespace-nowrap transition-colors ${theme === 'night' ? textActive : textInactive}`}>
              Night Sky
            </span>
            
            {/* Theme Switch */}
            <button 
              onClick={() => setTheme(theme === 'night' ? 'light' : 'night')}
              className={`relative w-14 h-7 sm:w-16 sm:h-8 rounded-full flex items-center px-1 transition-colors focus:outline-none shrink-0 ${toggleTrack}`}
            >
              <div className={`
                w-5 h-5 sm:w-6 sm:h-6 rounded-full shadow-sm transform transition-transform duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1.0)]
                ${theme === 'light' 
                  ? 'translate-x-7 sm:translate-x-8 bg-emerald-500' 
                  : 'translate-x-0 bg-[#1c1b1b]'
                }
              `}></div>
            </button>

            <span className={`text-sm sm:text-base font-medium whitespace-nowrap transition-colors ${theme === 'light' ? textActive : textInactive}`}>
              Heaven Light
            </span>
          </div>

          {/* --- ROW 2: TRANSLATION --- */}
          <div className={`${rowBase} rounded-3xl h-16 sm:h-20 px-4 sm:px-6 flex items-center justify-between transition-colors duration-300`}>
            <span className={`text-sm sm:text-base font-medium ${labelColor}`}>Sahih Translation</span>
            
            {/* Pill Toggle */}
            <div className={`${toggleTrack} rounded-full p-1 flex items-center relative h-7 w-20 sm:h-8 sm:w-24 shrink-0 transition-colors`}>
               {/* Background Slider */}
               <div className={`
                 absolute top-1 bottom-1 w-[calc(50%-4px)] bg-emerald-500 rounded-full transition-transform duration-200 ease-out z-0
                 ${showTranslation ? 'translate-x-full left-1' : 'translate-x-0 left-1'}
               `}></div>

               <button 
                 onClick={() => setShowTranslation(false)}
                 className={`flex-1 text-[10px] sm:text-xs font-bold z-10 text-center transition-colors ${!showTranslation ? 'text-white' : (isLight ? 'text-stone-500' : 'text-gray-400')}`}
               >
                 Off
               </button>
               <button 
                 onClick={() => setShowTranslation(true)}
                 className={`flex-1 text-[10px] sm:text-xs font-bold z-10 text-center transition-colors ${showTranslation ? 'text-white' : (isLight ? 'text-stone-500' : 'text-gray-400')}`}
               >
                 On
               </button>
            </div>
          </div>

          {/* --- ROW 3: FONT SIZE --- */}
          <div className={`${rowBase} rounded-3xl h-20 sm:h-24 px-4 sm:px-6 flex flex-col justify-center transition-colors duration-300`}>
            <span className={`text-sm sm:text-base font-medium mb-2 sm:mb-3 ${labelColor}`}>Font Size</span>
            
            <div className="flex items-center gap-3 sm:gap-4">
              <span className={`text-xs font-medium ${textInactive}`}>A</span>
              
              {/* Slider Track */}
              <div className={`flex-1 relative h-3 rounded-full flex items-center justify-between px-1 transition-colors ${toggleTrack}`}>
                {fontSizes.map((step) => (
                  <button
                    key={step}
                    onClick={() => setFontSize(step)}
                    className={`
                      w-3 h-3 sm:w-4 sm:h-4 rounded-full z-10 transition-all duration-200 focus:outline-none relative
                      ${fontSize === step 
                        ? 'bg-emerald-500 scale-150 shadow-lg' 
                        : sliderDotInactive
                      }
                    `}
                  >
                  </button>
                ))}
              </div>

              <span className={`text-lg sm:text-xl font-medium ${textInactive}`}>A</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default SettingsModal;