import { useState, useRef, useEffect, useCallback } from 'react';
import logoquran from '/src/assets/logo-quran.svg';
import VerseAudioPlayer from './VerseAudioPlayer'; 
import ChapterNavigation from './ChapterNavigation';

// --- HELPER: Convert English Digits to Arabic ---
const toArabicNumerals = (num) => {
  const id = String(num);
  return id.replace(/[0-9]/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
};

// --- OPTIMIZATION: Skeleton Loader Component ---
const VerseSkeleton = ({ isLight }) => {
  const bgBase = isLight ? 'bg-white border-stone-200' : 'bg-[#1a1b1d] border-white/5';
  const shimmer = isLight ? 'bg-stone-200' : 'bg-gray-800';

  return (
    <div className={`rounded-2xl border p-4 lg:p-6 flex flex-col md:flex-row gap-4 animate-pulse ${bgBase}`}>
      <div className={`hidden md:block w-20 h-full rounded-lg ${shimmer} opacity-20`}></div>
      <div className="flex-1 space-y-6">
        <div className={`h-8 w-3/4 ml-auto rounded-lg ${shimmer} opacity-30`}></div>
        <div className={`h-6 w-1/2 ml-auto rounded-lg ${shimmer} opacity-20`}></div>
        <div className={`h-4 w-full rounded-lg ${shimmer} opacity-10 mt-8`}></div>
        <div className={`h-4 w-5/6 rounded-lg ${shimmer} opacity-10`}></div>
      </div>
    </div>
  );
};

function VerseList({ 
  verses, 
  loading, 
  page, 
  setPage, 
  totalPages,
  scrollRef,
  theme,           
  showTranslation, 
  onlyTranslation,
  fontSize,
  onAudioStatusChange, 
  registerStopHandler,
  selectedChapter,
  onChapterNavigate,
  targetVerse, 
  setTargetVerse 
}) {
  // --- AUDIO STATE MANAGEMENT ---
  const [playingVerseKey, setPlayingVerseKey] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  
  // Refs
  const audioRef = useRef(null);
  const currentAudioKeyRef = useRef(null);
  const verseRefs = useRef({}); 
  const loadMoreRef = useRef(null);
  const versesRef = useRef(verses);

  // Keep versesRef in sync for the audio 'onended' callback
  useEffect(() => {
    versesRef.current = verses;
  }, [verses]);

  // --- SCROLL HELPERS ---
  const scrollToVerse = (verseKey) => {
    const element = verseRefs.current[verseKey];
    if (element) {
      setTimeout(() => {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const scrollToTop = () => {
    if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // --- WATCH FOR JUMP TARGET ---
  useEffect(() => {
    if (targetVerse && selectedChapter) {
        const verseKey = `${selectedChapter.id}:${targetVerse.id}`;
        // Slight delay to ensure DOM is ready if verses just loaded
        setTimeout(() => {
           const verseExists = verses.find(v => v.verse_key === verseKey);
           if (verseExists) {
               scrollToVerse(verseKey);
               setTargetVerse(null); 
           }
        }, 300);
    }
  }, [targetVerse, verses, selectedChapter, setTargetVerse]);

  // --- INFINITE SCROLL OBSERVER ---
  const handleObserver = useCallback((entries) => {
    const target = entries[0];
    const expectedCount = page * 10;
    const hasDataCaughtUp = verses.length >= expectedCount;

    if (target.isIntersecting && !loading && page < totalPages && hasDataCaughtUp) {
      setPage((prev) => prev + 1);
    }
  }, [loading, page, totalPages, setPage, verses.length]);

  useEffect(() => {
    const option = {
      root: null, 
      rootMargin: "100px",
      threshold: 0
    };
    const observer = new IntersectionObserver(handleObserver, option);
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => {
      if (loadMoreRef.current) observer.unobserve(loadMoreRef.current);
    }
  }, [handleObserver]);

  // --- OPTIMIZED AUDIO LOGIC ---
  
  // 1. Core Stop Function
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      // Important: clear src to stop buffering
      audioRef.current.src = ""; 
    }
    setPlayingVerseKey(null);
    setIsPaused(false);
    setAudioLoading(false);
    currentAudioKeyRef.current = null;
    if (onAudioStatusChange) onAudioStatusChange('idle');
  }, [onAudioStatusChange]);

  // 2. Core Play Function (Separated from Toggle logic)
  const playVerseAudio = useCallback((verse) => {
    const verseKey = verse.verse_key;
    const relativeUrl = verse.audio?.url;
    if (!relativeUrl) return;
    
    const audioUrl = relativeUrl.startsWith('http') ? relativeUrl : `https://verses.quran.com/${relativeUrl}`;

    // Stop previous instance cleanly
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
    }

    setAudioLoading(true);
    // Optimistic UI update
    setPlayingVerseKey(verseKey);
    currentAudioKeyRef.current = verseKey;
    if (onAudioStatusChange) onAudioStatusChange('playing');

    const newAudio = new Audio(audioUrl);
    newAudio.preload = "auto"; // Fix: Improve buffering
    audioRef.current = newAudio;

    // --- Event: Ended (Auto-Advance) ---
    newAudio.onended = () => {
        const currentList = versesRef.current;
        const currentIndex = currentList.findIndex((v) => v.verse_key === verseKey);
        
        if (currentIndex !== -1 && currentIndex < currentList.length - 1) {
            const nextVerse = currentList[currentIndex + 1];
            // Recursively play next (Force play, do not toggle)
            playVerseAudio(nextVerse); 
        } else {
            stopAudio();
        }
    };

    // --- Event: Error (Stuck Fix) ---
    newAudio.onerror = (e) => {
        console.error("Audio Load Error", e);
        // If error occurs, stop UI from showing "Loading" forever
        setAudioLoading(false);
        setIsPaused(true); 
    };

    // --- Execute Play ---
    const playPromise = newAudio.play();
    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                setAudioLoading(false);
                setIsPaused(false);
                scrollToVerse(verseKey);
            })
            .catch(err => {
                // DOMException: The play() request was interrupted
                if (err.name === 'NotAllowedError' || err.name === 'AbortError') {
                   // User likely clicked pause or switched quickly. 
                   // We ignore this to prevent UI glitching.
                } else {
                   console.error("Playback error:", err);
                   setAudioLoading(false);
                   setIsPaused(true); // Revert to paused state in UI
                }
            });
    }

  }, [stopAudio, onAudioStatusChange]);


  // 3. Register Global Handler (Footer/Header controls)
  useEffect(() => {
    if (registerStopHandler) {
      registerStopHandler((forceStop = false) => {
        if (forceStop) {
          stopAudio();
        } else {
          // Toggle Resume/Pause
          if (audioRef.current) {
            if (audioRef.current.paused) {
              const playPromise = audioRef.current.play();
              if (playPromise !== undefined) {
                 playPromise.then(() => {
                    setIsPaused(false);
                    if (onAudioStatusChange) onAudioStatusChange('playing');
                    if (currentAudioKeyRef.current) scrollToVerse(currentAudioKeyRef.current);
                 }).catch(e => console.log("Resume interrupted", e));
              }
            } else {
              audioRef.current.pause();
              setIsPaused(true);
              if (onAudioStatusChange) onAudioStatusChange('paused');
            }
          }
        }
      });
    }
  }, [registerStopHandler, onAudioStatusChange, stopAudio]);

  // 4. User Interaction Handler
  const handlePlayPauseClick = (verse) => {
    const verseKey = verse.verse_key;
    
    // CASE A: Clicked the currently playing verse -> Toggle Pause/Play
    if (playingVerseKey === verseKey) {
      if (audioRef.current) {
        if (audioRef.current.paused) {
          audioRef.current.play().catch(e => console.error(e));
          setIsPaused(false);
          if (onAudioStatusChange) onAudioStatusChange('playing');
        } else {
          audioRef.current.pause();
          setIsPaused(true);
          if (onAudioStatusChange) onAudioStatusChange('paused');
        }
      }
      return;
    }

    // CASE B: Clicked a different verse -> Start new Playback
    playVerseAudio(verse);
  };

  // Cleanup on Unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = "";
      }
    };
  }, []);

  // --- STYLING ---
  const shouldShowBismillah = () => {
    if (!selectedChapter) return false;
    if (selectedChapter.id === 1 || selectedChapter.id === 9) return false;
    return true;
  };

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

  const markerStyleMap = {
    1: 'h-5 min-w-4 text-sm border-1',    
    2: 'h-6 min-w-6 text-base border-1', 
    3: 'h-8 min-w-8 text-lg border-1',   
    4: 'h-9 min-w-10 text-xl border-1', 
    5: 'h-10 min-w-12 text-2xl border-1' 
  };

  const isLight = theme === 'light';
  
  const cardClass = isLight 
    ? 'bg-white border-stone-200 text-stone-800 shadow-sm' 
    : 'bg-[#1a1b1d] border-white/5 text-gray-300';
  
  const verseKeyBg = isLight
    ? 'bg-emerald-100/50 text-emerald-700 border-emerald-200'
    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

  const ayahMarkerColor = isLight ? 'text-emerald-600' : 'text-emerald-500';

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 lg:p-6 scroll-smooth custom-scrollbar"
    >
      <div className="max-w-6xl mx-auto pb-24">
        
        {shouldShowBismillah() && (
          <div className="flex flex-col items-center justify-center py-8 pb-12 select-none">
            <div className={`font-arabic text-2xl md:text-4xl leading-relaxed opacity-90 transition-colors duration-300 ${isLight ? 'text-stone-700' : 'text-gray-300'}`}>
              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </div>
          </div>
        )}

        <div className="space-y-4 mb-4">
          
          {loading && verses.length === 0 && (
            <>
              <VerseSkeleton isLight={isLight} />
              <VerseSkeleton isLight={isLight} />
              <VerseSkeleton isLight={isLight} />
              <VerseSkeleton isLight={isLight} />
            </>
          )}

          {verses.map((verse) => {
            const isPlayingVerse = playingVerseKey === verse.verse_key;
            
            const activeStyles = isPlayingVerse
              ? isLight
                ? 'ring-1 ring-emerald-500 bg-emerald-50/40'
                : 'ring-1 ring-emerald-500/80 bg-emerald-900/10'
              : '';

            const verseNumber = verse.verse_key.split(':')[1];
            const arabicNumber = toArabicNumerals(verseNumber);

            return (
              <div 
                  key={verse.verse_key} 
                  ref={(el) => (verseRefs.current[verse.verse_key] = el)} 
                  className={`
                    scroll-mt-20 md:scroll-mt-20
                    rounded-2xl border transition-all duration-300 flex flex-col md:flex-row 
                    ${cardClass} 
                    ${activeStyles}
                  `}
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
                      isPlaying={isPlayingVerse && !isPaused}
                      isLoading={isPlayingVerse && audioLoading}
                      onToggle={() => handlePlayPauseClick(verse)}
                  />
                </div>

                <div className="flex-1 p-5 md:p-8 pt-2 md:pt-8">
                  {!onlyTranslation && (
                    <p 
                      className={`text-right font-arabic mb-6 transition-all duration-200 ${arabicSizeMap[fontSize]}`} 
                      dir="rtl"
                    >
                      {verse.text_uthmani} 
                      
                      <span 
                        className={`
                          inline-flex items-center justify-center 
                          px-1 mr-2 rounded-lg border-current
                          font-bold leading-none
                          align-middle select-none whitespace-nowrap
                          ${ayahMarkerColor}
                          ${markerStyleMap[fontSize]}
                        `}
                      >
                        {arabicNumber}
                      </span>
                    </p>
                  )}

                  {(showTranslation || onlyTranslation) && (
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
            );
          })}
        </div>

        <div 
          ref={loadMoreRef} 
          className={`flex items-center justify-center w-full transition-all duration-300 ${loading ? 'h-24 py-4' : 'h-6'}`}
        >
            {loading && verses.length > 0 && (
            <div className={`w-16 h-16 rounded-full flex items-center justify-center animate-pulse ${isLight ? 'bg-stone-300' : 'bg-gray-800'}`}>
               <img src={logoquran} className="w-8 h-8 opacity-50" />
            </div>
            )}
        </div>

        {!loading && page >= totalPages && verses.length > 0 && (
          <ChapterNavigation 
            selectedChapter={selectedChapter} 
            onNavigate={onChapterNavigate}
            onScrollToTop={scrollToTop}
            theme={theme}
          />
        )}

      </div>
    </div>
  );
}

export default VerseList;