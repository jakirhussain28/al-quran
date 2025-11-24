import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import logoquran from '/src/assets/logo-quran.svg';
import VerseAudioPlayer from './VerseAudioPlayer'; 

function VerseList({ 
  verses, 
  loading, 
  page, 
  setPage, 
  paginationMeta, 
  scrollRef,
  theme,           
  showTranslation, 
  fontSize,
  // New props from App
  onAudioStatusChange, 
  registerStopHandler,
  selectedChapter // <--- 1. Added Prop
}) {
  // --- AUDIO STATE MANAGEMENT ---
  const [playingVerseKey, setPlayingVerseKey] = useState(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const audioRef = useRef(null);
  
  // Needed to check if we can resume the current audio
  const currentAudioKeyRef = useRef(null);
  
  // --- SCROLL TRACKING REFS ---
  const verseRefs = useRef({}); 

  // Helper to scroll to a specific verse
  const scrollToVerse = (verseKey) => {
    const element = verseRefs.current[verseKey];
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  };

  const shouldShowBismillah = () => {
    if (!selectedChapter) return false;
    if (page !== 1) return false;
    if (selectedChapter.id === 1 || selectedChapter.id === 9) return false;
    return true;
  };

  // --- GLOBAL STOP LOGIC (Called by Parent App) ---
  useEffect(() => {
    if (registerStopHandler) {
      registerStopHandler(() => {
        // Full Stop: Pause, Reset Time, clear State
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        setPlayingVerseKey(null);
        currentAudioKeyRef.current = null;
        if (onAudioStatusChange) onAudioStatusChange(false);
      });
    }
  }, [registerStopHandler, onAudioStatusChange]);

  // --- HANDLE PLAY / PAUSE (With Resume Support) ---
  const handlePlayPause = (verse) => {
    const verseKey = verse.verse_key;
    
    // 1. PAUSE LOGIC (Resume later)
    if (playingVerseKey === verseKey) {
      // Just pause, DO NOT reset currentTime
      audioRef.current?.pause();
      setPlayingVerseKey(null);
      if (onAudioStatusChange) onAudioStatusChange(false);
      return;
    }

    // 2. DETERMINE AUDIO URL
    const relativeUrl = verse.audio?.url;
    if (!relativeUrl) return;
    
    const audioUrl = relativeUrl.startsWith('http') 
      ? relativeUrl 
      : `https://verses.quran.com/${relativeUrl}`;

    setAudioLoading(true);
    
    // 3. CHECK RESUME VS NEW PLAY
    const isResuming = currentAudioKeyRef.current === verseKey && audioRef.current;

    if (isResuming) {
        // --- RESUME EXISTING ---
        audioRef.current.play()
            .then(() => {
                setAudioLoading(false);
                setPlayingVerseKey(verseKey);
                if (onAudioStatusChange) onAudioStatusChange(true);
            })
            .catch(err => {
                console.error(err);
                setAudioLoading(false);
            });
    } else {
        // --- START NEW AUDIO ---
        
        // Stop previous if exists
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }

        const newAudio = new Audio(audioUrl);
        audioRef.current = newAudio;
        currentAudioKeyRef.current = verseKey;

        newAudio.play()
            .then(() => {
                setAudioLoading(false);
                setPlayingVerseKey(verseKey);
                if (onAudioStatusChange) onAudioStatusChange(true);
            })
            .catch(err => {
                console.error("Audio playback error:", err);
                setAudioLoading(false);
                setPlayingVerseKey(null);
                if (onAudioStatusChange) onAudioStatusChange(false);
            });

        // AUTO-PLAY NEXT LOGIC
        newAudio.onended = () => {
            const currentIndex = verses.findIndex((v) => v.verse_key === verse.verse_key);
            if (currentIndex !== -1 && currentIndex < verses.length - 1) {
                const nextVerse = verses[currentIndex + 1];
                handlePlayPause(nextVerse); 
            } else {
                setPlayingVerseKey(null);
                currentAudioKeyRef.current = null; // Reset on list end
                if (onAudioStatusChange) onAudioStatusChange(false);
            }
        };
    }
    
    // Always scroll to the active verse
    scrollToVerse(verseKey);
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  // --- STYLING MAPS ---
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

  const isLight = theme === 'light';
  const cardClass = isLight 
    ? 'bg-white border-stone-200 text-stone-800 shadow-sm' 
    : 'bg-[#1a1b1d] border-white/5 text-gray-300';
  
  const verseKeyBg = isLight
    ? 'bg-emerald-100/50 text-emerald-700 border-emerald-200'
    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

  const controlsClass = isLight
    ? 'bg-white border-stone-200 text-stone-600'
    : 'bg-[#1a1b1d] border-white/5 text-gray-400';

  const btnHoverClass = 'hover:bg-emerald-500/10 hover:text-emerald-500';

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 lg:p-6 scroll-smooth custom-scrollbar"
    >
      <div className="max-w-6xl mx-auto pb-24">
        {loading ? (
           <div className="flex justify-center py-20">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center animate-pulse ${isLight ? 'bg-stone-200' : 'bg-gray-800'}`}>
                <img src={logoquran} className="w-8 h-8 opacity-50" />
              </div>
           </div>
        ) : (
          <>
            {shouldShowBismillah() && (
              <div className="flex flex-col items-center justify-center py-8 pb-8 select-none">
                <div className={`font-arabic text-2xl md:text-4xl leading-relaxed opacity-90 transition-colors duration-300 ${isLight ? 'text-stone-700' : 'text-gray-300'}`}>
                  بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                </div>
              </div>
            )}

            <div className="space-y-6 mb-10">
              {verses.map((verse) => (
                <div 
                    key={verse.id}
                    ref={(el) => (verseRefs.current[verse.verse_key] = el)} 
                    className={`rounded-2xl border transition-colors duration-300 flex flex-col md:flex-row ${cardClass} ${playingVerseKey === verse.verse_key ? (isLight ? 'ring-2 ring-emerald-500/50' : 'ring-1 ring-emerald-500/30') : ''}`}
                >
                  
                  <div className={`
                    flex md:flex-col items-center justify-between md:justify-start md:items-center
                    p-4 md:py-6 md:px-5 md:w-20 md:border-r md:shrink-0 gap-4
                    ${isLight ? 'border-stone-100 ' : 'border-white/5 '}
                  `}>
                    <span className={`text-xs font-mono px-3 py-1 rounded-lg border font-medium ${verseKeyBg}`}>
                      {verse.verse_key}
                    </span>

                    <VerseAudioPlayer 
                        audioUrl={verse.audio?.url} 
                        verseKey={verse.verse_key}
                        theme={theme}
                        isPlaying={playingVerseKey === verse.verse_key}
                        isLoading={playingVerseKey === verse.verse_key && audioLoading}
                        onToggle={() => handlePlayPause(verse)}
                    />
                  </div>

                  <div className="flex-1 p-5 md:p-8 pt-2 md:pt-8">
                    <p 
                      className={`text-right font-arabic mb-6 transition-all duration-200 ${arabicSizeMap[fontSize]}`} 
                      dir="rtl"
                    >
                      {verse.text_uthmani} 
                    </p>

                    {showTranslation && (
                      <p 
                        className={`leading-relaxed transition-all duration-200 opacity-90 ${translationSizeMap[fontSize]} ${isLight ? 'text-stone-600' : 'text-gray-400'}`}
                      >
                        {verse.translations?.[0]?.text ? (
                          <span dangerouslySetInnerHTML={{__html: verse.translations[0].text}} />
                        ) : "Translation unavailable"}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* PAGINATION */}
            <div className={`flex items-center justify-between p-2 rounded-2xl border transition-colors ${controlsClass}`}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-colors ${btnHoverClass}`}
              >
                <ChevronLeft size={18} /> Previous
              </button>

              <span className="font-mono text-sm opacity-70">
                Page {page} <span className="opacity-30">/ {paginationMeta?.total_pages || '?'}</span>
              </span>

              <button
                onClick={() => setPage(p => p + 1)}
                disabled={paginationMeta && page >= paginationMeta.total_pages}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-colors ${btnHoverClass}`}
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