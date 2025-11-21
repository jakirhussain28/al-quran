import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import logoquran from '/src/assets/logo-quran.svg';

function VerseList({ 
  verses, 
  loading, 
  page, 
  setPage, 
  paginationMeta, 
  scrollRef,
  theme,           // New Prop
  showTranslation, // New Prop
  fontSize         // New Prop
}) {

  // Map slider value (1-5) to Tailwind text sizes
  const arabicSizeMap = {
    1: 'text-xl leading-[2.0]',
    2: 'text-2xl leading-[2.2]',
    3: 'text-3xl leading-[2.5]',
    4: 'text-4xl leading-[2.8]',
    5: 'text-5xl leading-[3.0]',
  };

  const translationSizeMap = {
    1: 'text-sm',
    2: 'text-base',
    3: 'text-lg',
    4: 'text-xl',
    5: 'text-2xl',
  };

  // Theme classes
  const isLight = theme === 'light';
  const cardClass = isLight 
    ? 'bg-white border-stone-200 hover:border-stone-300 text-stone-800 shadow-sm' 
    : 'bg-[rgb(37,38,40)]/50 border-gray-800/50 hover:border-gray-700 text-gray-300';
  
  const verseKeyClass = isLight
    ? 'text-emerald-600 bg-emerald-50'
    : 'text-emerald-500 bg-emerald-900/20';

  const controlsClass = isLight
    ? 'bg-white border-stone-200 text-stone-600'
    : 'bg-[rgb(37,38,40)] border-gray-800 text-gray-400';

  const btnHoverClass = 'hover:bg-emerald-900/30 hover:text-emerald-400'; // Kept similar for consistency, or tweak for light

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth custom-scrollbar"
    >
      <div className="max-w-6xl mx-auto pb-10">
        {loading ? (
           <div className="flex justify-center py-20">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center animate-pulse ${isLight ? 'bg-stone-200' : 'bg-gray-800'}`}>
                <img src={logoquran} className="w-8 h-8 opacity-50" />
              </div>
           </div>
        ) : (
          <>
            <div className="space-y-8 mb-10">
              {verses.map((verse) => (
                <div key={verse.id} className={`p-6 rounded-xl border transition-colors duration-300 ${cardClass}`}>
                  
                  {/* Header: Verse Key */}
                  <div className={`flex justify-between items-center mb-4 pb-2 border-b ${isLight ? 'border-stone-100' : 'border-gray-700/50'}`}>
                    <span className={`text-xs font-mono px-2 py-1 rounded ${verseKeyClass}`}>
                      {verse.verse_key}
                    </span>
                  </div>

                  {/* Arabic Text */}
                  <p 
                    className={`text-right font-arabic mb-6 transition-all duration-200 ${arabicSizeMap[fontSize]}`} 
                    dir="rtl"
                  >
                    {verse.text_uthmani}
                  </p>

                  {/* Translation (Conditional) */}
                  {showTranslation && (
                    <p 
                      className={`leading-relaxed transition-all duration-200 ${translationSizeMap[fontSize]} ${isLight ? 'text-stone-600' : 'text-gray-300'}`}
                    >
                      {verse.translations?.[0]?.text ? (
                        <span dangerouslySetInnerHTML={{__html: verse.translations[0].text}} />
                      ) : "Translation unavailable"}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* --- PAGINATION CONTROLS --- */}
            <div className={`flex items-center justify-between p-2 rounded-xl border transition-colors ${controlsClass}`}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors ${btnHoverClass}`}
              >
                <ChevronLeft size={18} /> Previous
              </button>

              <span className="font-mono text-sm opacity-70">
                Page {page} <span className="opacity-50">/ {paginationMeta?.total_pages || '?'}</span>
              </span>

              <button
                onClick={() => setPage(p => p + 1)}
                disabled={paginationMeta && page >= paginationMeta.total_pages}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors ${btnHoverClass}`}
              >
                Next <ChevronRight size={18} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default VerseList;