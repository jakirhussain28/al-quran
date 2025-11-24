import { useState, useRef, useEffect, useCallback } from 'react';
import logoquran from '/src/assets/logo-quran.svg';
import VerseAudioPlayer from './VerseAudioPlayer'; 
import ChapterNavigation from './ChapterNavigation';
import { Loader2 } from 'lucide-react';

function VerseList({ 
  verses, 
  loading, 
  page, 
  setPage, 
  totalPages,
  scrollRef,
  theme,           
  showTranslation, 
  fontSize,
  onAudioStatusChange, 
  registerStopHandler,
  selectedChapter,
  onChapterNavigate
}) {
  // --- AUDIO STATE MANAGEMENT ---
  const [playingVerseKey, setPlayingVerseKey] = useState(null);
  const [audioLoading, setAudioLoading] = useState(false);
  
  // Refs
  const audioRef = useRef(null);
  const currentAudioKeyRef = useRef(null);
  const verseRefs = useRef({}); 
  const loadMoreRef = useRef(null);
  
  // CRITICAL: Keep a ref of verses so the audio 'onended' callback 
  // can see the most recent list (including appended verses)
  const versesRef = useRef(verses);
  useEffect(() => {
    versesRef.current = verses;
  }, [verses]);

  // --- SCROLL HELPERS ---
  const scrollToVerse = (verseKey) => {
    const element = verseRefs.current[verseKey];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const scrollToTop = () => {
    if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const shouldShowBismillah = () => {
    if (!selectedChapter) return false;
    // Only show at absolute top (start of list)
    if (selectedChapter.id === 1 || selectedChapter.id === 9) return false;
    return true;
  };

  // --- INFINITE SCROLL OBSERVER ---
  const handleObserver = useCallback((entries) => {
    const target = entries[0];
    
    // FIX: Race Condition Prevention
    // The API returns 10 verses per page. We verify that we have enough verses 
    // for the CURRENT page before we allow requesting the NEXT page.
    // e.g. If page is 1, we need 10 verses. If verses.length is 10, we can go to page 2.
    // If page is 2, we need 20 verses. If verses.length is 10, we must WAIT.
    const expectedCount = page * 10;
    const hasDataCaughtUp = verses.length >= expectedCount;

    // Only load more if:
    // 1. Trigger is visible (isIntersecting)
    // 2. We are not currently loading (loading)
    // 3. We haven't reached the last page (page < totalPages)
    // 4. We have received the data for the current page (hasDataCaughtUp)
    if (target.isIntersecting && !loading && page < totalPages && hasDataCaughtUp) {
      setPage((prev) => prev + 1);
    }
  }, [loading, page, totalPages, setPage, verses.length]);

  useEffect(() => {
    const option = {
      root: null, // viewport
      rootMargin: "100px", // Trigger slightly before bottom
      threshold: 0
    };
    const observer = new IntersectionObserver(handleObserver, option);
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => {
      if (loadMoreRef.current) observer.unobserve(loadMoreRef.current);
    }
  }, [handleObserver]);


  // --- GLOBAL STOP LOGIC ---
  useEffect(() => {
    if (registerStopHandler) {
      registerStopHandler(() => {
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

  // --- HANDLE PLAY / PAUSE ---
  const handlePlayPause = (verse) => {
    const verseKey = verse.verse_key;
    
    // PAUSE
    if (playingVerseKey === verseKey) {
      audioRef.current?.pause();
      setPlayingVerseKey(null);
      if (onAudioStatusChange) onAudioStatusChange(false);
      return;
    }

    // PLAY
    const relativeUrl = verse.audio?.url;
    if (!relativeUrl) return;
    
    const audioUrl = relativeUrl.startsWith('http') 
      ? relativeUrl 
      : `https://verses.quran.com/${relativeUrl}`;

    setAudioLoading(true);
    
    // Check Resume
    const isResuming = currentAudioKeyRef.current === verseKey && audioRef.current;

    if (isResuming) {
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
        // New Track
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
                console.error("Audio error:", err);
                setAudioLoading(false);
                setPlayingVerseKey(null);
                if (onAudioStatusChange) onAudioStatusChange(false);
            });

        // CONTINUOUS PLAY LOGIC
        newAudio.onended = () => {
            // Use ref to get LATEST verses (including newly loaded ones)
            const currentList = versesRef.current;
            const currentIndex = currentList.findIndex((v) => v.verse_key === verse.verse_key);
            
            if (currentIndex !== -1 && currentIndex < currentList.length - 1) {
                const nextVerse = currentList[currentIndex + 1];
                handlePlayPause(nextVerse); 
            } else {
                // End of list (or waiting for load)
                setPlayingVerseKey(null);
                currentAudioKeyRef.current = null; 
                if (onAudioStatusChange) onAudioStatusChange(false);
            }
        };
    }
    scrollToVerse(verseKey);
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  // --- STYLING ---
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

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 lg:p-6 scroll-smooth custom-scrollbar"
    >
      <div className="max-w-6xl mx-auto pb-24">
        
        {/* BISMILLAH (Start of Surah only) */}
        {shouldShowBismillah() && (
          <div className="flex flex-col items-center justify-center py-8 pb-12 select-none">
            <div className={`font-arabic text-2xl md:text-4xl leading-relaxed opacity-90 transition-colors duration-300 ${isLight ? 'text-stone-700' : 'text-gray-300'}`}>
              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </div>
          </div>
        )}

        {/* VERSE LIST */}
        <div className="space-y-6 mb-4">
          {verses.map((verse) => (
            <div 
                key={verse.verse_key} // Use verse_key as ID is unique globally but key is safer
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

        {/* LOADING INDICATOR / TRIGGER AREA */}
        <div ref={loadMoreRef} className="h-20 flex items-center justify-center w-full">
            {loading && (
                 <div className={`flex items-center gap-2 text-sm ${isLight ? 'text-stone-400' : 'text-gray-600'}`}>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Loading verses...</span>
                 </div>
            )}
        </div>

        {/* CHAPTER NAVIGATION FOOTER (Only when end is reached) */}
        {!loading && page >= totalPages && (
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