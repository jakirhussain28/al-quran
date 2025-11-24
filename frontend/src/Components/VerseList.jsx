import { useState, useRef, useEffect, useCallback } from 'react';
import logoquran from '/src/assets/logo-quran.svg';
import VerseAudioPlayer from './VerseAudioPlayer'; 
import ChapterNavigation from './ChapterNavigation';

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
  onChapterNavigate,
  targetVerse, 
  setTargetVerse 
}) {
  // --- AUDIO STATE MANAGEMENT ---
  const [playingVerseKey, setPlayingVerseKey] = useState(null);
  const [audioLoading, setAudioLoading] = useState(false);
  
  // Refs
  const audioRef = useRef(null);
  const currentAudioKeyRef = useRef(null);
  const verseRefs = useRef({}); 
  const loadMoreRef = useRef(null);
  const versesRef = useRef(verses);

  useEffect(() => {
    versesRef.current = verses;
  }, [verses]);

  // --- SCROLL HELPERS ---
  const scrollToVerse = (verseKey) => {
    const element = verseRefs.current[verseKey];
    if (element) {
      // Timeout ensures layout is stable
      setTimeout(() => {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // We don't need the temporary highlight logic here anymore 
        // since the active audio state will handle the persistent highlight
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
        const verseExists = verses.find(v => v.verse_key === verseKey);

        if (verseExists) {
            scrollToVerse(verseKey);
            setTargetVerse(null); 
        }
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

  // --- AUDIO LOGIC ---
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

  const handlePlayPause = (verse) => {
    const verseKey = verse.verse_key;
    
    if (playingVerseKey === verseKey) {
      audioRef.current?.pause();
      setPlayingVerseKey(null);
      if (onAudioStatusChange) onAudioStatusChange(false);
      return;
    }

    const relativeUrl = verse.audio?.url;
    if (!relativeUrl) return;
    
    const audioUrl = relativeUrl.startsWith('http') ? relativeUrl : `https://verses.quran.com/${relativeUrl}`;

    setAudioLoading(true);
    
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

        newAudio.onended = () => {
            const currentList = versesRef.current;
            const currentIndex = currentList.findIndex((v) => v.verse_key === verse.verse_key);
            
            if (currentIndex !== -1 && currentIndex < currentList.length - 1) {
                const nextVerse = currentList[currentIndex + 1];
                handlePlayPause(nextVerse); 
            } else {
                setPlayingVerseKey(null);
                currentAudioKeyRef.current = null; 
                if (onAudioStatusChange) onAudioStatusChange(false);
            }
        };
    }
    // Auto-scroll when play starts
    scrollToVerse(verseKey);
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
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
  const isLight = theme === 'light';
  
  // Default card styles
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
        
        {shouldShowBismillah() && (
          <div className="flex flex-col items-center justify-center py-8 pb-12 select-none">
            <div className={`font-arabic text-2xl md:text-4xl leading-relaxed opacity-90 transition-colors duration-300 ${isLight ? 'text-stone-700' : 'text-gray-300'}`}>
              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </div>
          </div>
        )}

        <div className="space-y-4 mb-4">
          {verses.map((verse) => {
            const isPlaying = playingVerseKey === verse.verse_key;
            
            // Determine active styles based on theme
            // Stronger ring (ring-2) + slight background tint for better UX
            const activeStyles = isPlaying
              ? isLight
                ? 'ring-1 ring-emerald-500 bg-emerald-50/40'
                : 'ring-1 ring-emerald-500/80 bg-emerald-900/10'
              : '';

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
                      isPlaying={isPlaying}
                      isLoading={isPlaying && audioLoading}
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
            );
          })}
        </div>

        <div ref={loadMoreRef} className="h-20 flex items-center justify-center w-full">
            {loading && (
            <div className={`w-16 h-16 rounded-full flex items-center justify-center animate-pulse ${isLight ? 'bg-stone-300' : 'bg-gray-800'}`}>
               <img src={logoquran} className="w-8 h-8 opacity-50" />
            </div>
            )}
        </div>

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