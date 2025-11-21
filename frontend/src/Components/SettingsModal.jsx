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

  return (
    // 1. Backdrop with Blur & Centering
    <div 
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* 2. Modal Card */}
      <div 
        className="w-[90%] max-w-[380px] bg-[#121212] border border-white/10 rounded-4xl p-6 relative shadow-2xl"
        onClick={(e) => e.stopPropagation()} // Prevent click from closing modal
      >
        
        {/* 3. Gear Icon (Top Right) */}
        <div className="flex justify-end mb-2">
           <Settings className="text-gray-400 w-7 h-7" />
        </div>

        <div className="space-y-5">
          
          {/* --- ROW 1: THEME --- */}
          <div className="bg-[#192516] rounded-3xl h-20 px-6 flex items-center justify-between">
            <span className={`text-base font-medium ${theme === 'night' ? 'text-gray-300' : 'text-gray-500'}`}>
              Night Sky
            </span>
            
            {/* Theme Switch */}
            <button 
              onClick={() => setTheme(theme === 'night' ? 'light' : 'night')}
              className="relative w-16 h-8 bg-[#3e3e3e] rounded-full flex items-center px-1 transition-colors focus:outline-none"
            >
              <div className={`
                w-6 h-6 rounded-full shadow-sm transform transition-transform duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1.0)]
                ${theme === 'light' ? 'translate-x-8 bg-emerald-500' : 'translate-x-0 bg-[#4b4b4b]'}
              `}></div>
            </button>

            <span className={`text-base font-medium ${theme === 'light' ? 'text-gray-300' : 'text-gray-500'}`}>
              Heaven Light
            </span>
          </div>

          {/* --- ROW 2: TRANSLATION --- */}
          <div className="bg-[#192516] rounded-3xl h-20 px-6 flex items-center justify-between">
            <span className="text-gray-400 text-base font-medium">Toggle Translation</span>
            
            {/* Pill Toggle */}
            <div className="bg-[#3e3e3e] rounded-full p-1 flex items-center relative h-8 w-24">
               {/* Background Slider */}
               <div className={`
                 absolute top-1 bottom-1 w-[calc(50%-4px)] bg-emerald-500 rounded-full transition-transform duration-200 ease-out z-0
                 ${showTranslation ? 'translate-x-full left-1' : 'translate-x-0 left-1'}
               `}></div>

               <button 
                 onClick={() => setShowTranslation(false)}
                 className={`flex-1 text-xs font-bold z-10 text-center transition-colors ${!showTranslation ? 'text-white' : 'text-gray-400'}`}
               >
                 Off
               </button>
               <button 
                 onClick={() => setShowTranslation(true)}
                 className={`flex-1 text-xs font-bold z-10 text-center transition-colors ${showTranslation ? 'text-white' : 'text-gray-400'}`}
               >
                 On
               </button>
            </div>
          </div>

          {/* --- ROW 3: FONT SIZE --- */}
          <div className="bg-[#192516] rounded-3xl h-24 px-6 flex flex-col justify-center">
            <span className="text-gray-400 text-base font-medium mb-3">Font Size</span>
            
            <div className="flex items-center gap-4">
              <span className="text-xs font-medium text-gray-300">A</span>
              
              {/* Slider Track */}
              <div className="flex-1 relative h-3 bg-[#3e3e3e] rounded-full flex items-center justify-between px-1">
                {fontSizes.map((step) => (
                  <button
                    key={step}
                    onClick={() => setFontSize(step)}
                    className={`
                      w-4 h-4 rounded-full z-10 transition-all duration-200 focus:outline-none relative
                      ${fontSize === step 
                        ? 'bg-emerald-500 scale-125 shadow-lg' 
                        : 'bg-gray-500 hover:bg-gray-400'}
                    `}
                  >
                  </button>
                ))}
              </div>

              <span className="text-xl font-medium text-gray-300">A</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default SettingsModal;