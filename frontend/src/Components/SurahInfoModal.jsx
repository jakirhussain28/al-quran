import React, { useEffect, useState } from 'react';
import { X, MapPin, BookOpen } from 'lucide-react';

function SurahInfoModal({ 
  isOpen, 
  onClose, 
  chapter, 
  theme 
}) {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      fetchInfo();
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, chapter]);

  const fetchInfo = async () => {
    if (!chapter) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/chapters/${chapter.id}/info`);
      const data = await res.json();
      if (data.chapter_info) {
        setInfo(data.chapter_info);
      }
    } catch (error) {
      console.error("Failed to load chapter info", error);
    } finally {
      setLoading(false);
    }
  };

  // --- REGEX STYLE INJECTOR ---
  // This ensures styles work even without the 'prose' plugin
  const formatHTML = (htmlContent) => {
    if (!htmlContent) return '';
    
    let processed = htmlContent;
    const isLight = theme === 'light';

    // 1. Define Classes based on Theme
    const h2Classes = `text-2xl md:text-3xl font-bold mt-8 mb-4 leading-tight ${isLight ? 'text-emerald-800' : 'text-emerald-400'}`;
    const h3Classes = `text-xl md:text-2xl font-bold mt-6 mb-3 ${isLight ? 'text-emerald-700' : 'text-emerald-500'}`;
    const pClasses = `text-base md:text-lg leading-relaxed mb-4 block ${isLight ? 'text-stone-700' : 'text-gray-300'}`;
    const bClasses = `font-bold ${isLight ? 'text-stone-900' : 'text-white'}`;

    // 2. Inject Classes using Regex
    // We look for the opening tag <tag> and replace it with <tag class="...">
    
    // Replace <h2>
    processed = processed.replace(/<h2(.*?)>/gi, `<h2 class="${h2Classes}"$1>`);
    
    // Replace <h3> (just in case)
    processed = processed.replace(/<h3(.*?)>/gi, `<h3 class="${h3Classes}"$1>`);

    // Replace <p>
    processed = processed.replace(/<p(.*?)>/gi, `<p class="${pClasses}"$1>`);

    // Replace <b> and <strong>
    processed = processed.replace(/<(b|strong)(.*?)>/gi, `<strong class="${bClasses}"$2>`);

    return processed;
  };

  if (!isOpen || !chapter) return null;

  const isLight = theme === 'light';
  
  // --- CONTAINER STYLES ---
  const overlayClass = "fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4 md:p-6";
  
  const modalClass = `w-full md:max-w-6xl max-h-[85vh] rounded-3xl shadow-2xl flex flex-col relative overflow-hidden transition-colors duration-300 ${
    isLight ? 'bg-white text-stone-800' : 'bg-[#1a1b1d] text-gray-200 border border-white/10'
  }`;

  const headerClass = `px-6 py-5 border-b flex items-center justify-between shrink-0 ${
    isLight ? 'border-stone-100 bg-white' : 'border-white/5 bg-[#1a1b1d]'
  }`;

  const closeBtnClass = `p-2 rounded-full transition-colors ${
    isLight ? 'hover:bg-stone-100 text-stone-500' : 'hover:bg-white/5 text-gray-400'
  }`;

  const badgeClass = `text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-2 ${
    isLight ? 'bg-stone-100 text-stone-600' : 'bg-white/5 text-gray-400'
  }`;

  return (
    <div className={overlayClass} onClick={onClose}>
      <div className={modalClass} onClick={(e) => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className={headerClass}>
          <div>
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3">
              <span>Surah {chapter.name_simple}</span>
              <span className={`font-arabic text-2xl mt-1 ${isLight ? 'text-emerald-600' : 'text-emerald-500'}`}>
                {chapter.name_arabic}
              </span>
            </h2>
            <div className="flex items-center gap-3 mt-2">
              <span className={`${badgeClass} capitalize`}>
                <MapPin size={14} />
                {chapter.revelation_place}
              </span>
              <span className={badgeClass}>
                <BookOpen size={14} />
                {chapter.verses_count} Verses
              </span>
            </div>
          </div>
          
          <button onClick={onClose} className={closeBtnClass}>
            <X size={24} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
          {loading ? (
             <div className="space-y-6 animate-pulse max-w-4xl mx-auto">
               <div className={`h-8 w-1/3 rounded-lg ${isLight ? 'bg-stone-200' : 'bg-gray-800'}`}></div>
               <div className="space-y-3">
                 <div className={`h-4 w-full rounded ${isLight ? 'bg-stone-200' : 'bg-gray-800'}`}></div>
                 <div className={`h-4 w-full rounded ${isLight ? 'bg-stone-200' : 'bg-gray-800'}`}></div>
                 <div className={`h-4 w-5/6 rounded ${isLight ? 'bg-stone-200' : 'bg-gray-800'}`}></div>
               </div>
               <div className={`h-8 w-1/4 rounded-lg mt-8 ${isLight ? 'bg-stone-200' : 'bg-gray-800'}`}></div>
               <div className={`h-32 w-full rounded-lg ${isLight ? 'bg-stone-200' : 'bg-gray-800'}`}></div>
             </div>
          ) : info ? (
            <div className="max-w-none">
               {/* We call formatHTML() here. 
                  This function manually injects Tailwind classes into the strings 
                  returned by the API before React renders them. 
               */}
               <div dangerouslySetInnerHTML={{ __html: formatHTML(info.text) }} />
               
               <div className={`mt-8 pt-6 border-t text-xs opacity-50 ${isLight ? 'border-stone-200' : 'border-white/10'}`}>
                 Source: {info.source}
               </div>
            </div>
          ) : (
            <div className="text-center opacity-50 py-10">
              Information unavailable for this chapter.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default SurahInfoModal;