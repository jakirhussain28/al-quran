import { useState, useRef, useEffect } from 'react';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
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
  fontSize         
}) {
  // --- AUDIO STATE MANAGEMENT ---
  const [playingVerseKey, setPlayingVerseKey] = useState(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const audioRef = useRef(null);

  // Handle Audio Play/Pause logic
  const handlePlayPause = (verse) => {
    const verseKey = verse.verse_key; // [cite: 171]
    
    // 1. If clicking the currently playing verse, pause it.
    if (playingVerseKey === verseKey) {
      audioRef.current?.pause();
      setPlayingVerseKey(null);
      return;
    }

    // 2. Stop any existing audio
    if (audioRef.current) {
      audioRef.current.pause();
    }

    // 3. Determine Audio URL 
    // Note: Ensure your API maps the specific verse audio URL correctly.
    // Based on Audio API[cite: 676], ideally, the verse object has an attached audio URL.
    // If your backend sends just the filename, construct the path:
    const audioUrl = verse.audio?.url || `https://verses.quran.com/${verse.audio_url}`; 

    if (!audioUrl) {
        console.warn("No audio URL found for verse", verseKey);
        return;
    }

    setAudioLoading(true);
    setPlayingVerseKey(verseKey);

    // 4. Create new Audio instance
    const newAudio = new Audio(audioUrl);
    audioRef.current = newAudio;

    // 5. Play and handle events
    newAudio.play()
      .then(() => setAudioLoading(false))
      .catch(err => {
        console.error("Audio playback error:", err);
        setAudioLoading(false);
        setPlayingVerseKey(null);
      });

    newAudio.onended = () => {
      setPlayingVerseKey(null);
    };
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

  // Theme classes
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
            <div className="space-y-6 mb-10">
              {verses.map((verse) => (
                <div 
                    key={verse.id}
                    className={`rounded-2xl border transition-colors duration-300 flex flex-col md:flex-row ${cardClass}`}
                >
                  
                  {/* --- LEFT COLUMN (Desktop) / HEADER (Mobile) --- */}
                  <div className={`
                    flex md:flex-col items-center justify-between md:justify-start md:items-center
                    p-4 md:py-6 md:px-5 md:w-20 md:border-r md:shrink-0 gap-4
                    ${isLight ? 'border-stone-100 bg-stone-50/50' : 'border-white/5 bg-white/2'}
                  `}>
                    {/* Verse Key Badge */}
                    <span className={`
                      text-xs font-mono px-3 py-1 rounded-lg border font-medium
                      ${verseKeyBg}
                    `}>
                      {verse.verse_key}
                    </span>

                    {/* Play Button Component */}
                    <VerseAudioPlayer 
                        audioUrl={verse.audio_url} // Ensure this exists in your data
                        verseKey={verse.verse_key}
                        theme={theme}
                        isPlaying={playingVerseKey === verse.verse_key}
                        isLoading={playingVerseKey === verse.verse_key && audioLoading}
                        onToggle={() => handlePlayPause(verse)}
                    />
                  </div>

                  {/* --- RIGHT COLUMN (Content) --- */}
                  <div className="flex-1 p-5 md:p-8 pt-2 md:pt-8">
                    {/* Arabic Text */}
                    <p 
                      className={`text-right font-arabic mb-6 transition-all duration-200 ${arabicSizeMap[fontSize]}`} 
                      dir="rtl"
                    >
                      {verse.text_uthmani} 
                      {/*  textUthmani */}
                    </p>

                    {/* Translation (Conditional) */}
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

            {/* --- PAGINATION CONTROLS --- */}
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