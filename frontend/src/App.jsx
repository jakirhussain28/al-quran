import { useState, useEffect, useRef } from 'react';
import { Settings, Square } from 'lucide-react';
import logoquran from '/src/assets/logo-quran.svg';
import VerseList from './Components/VerseList';
import DynamicBar from './Components/DynamicBar';
import SettingsModal from './Components/SettingsModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function App() {
  // --- DATA STATES ---
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [verses, setVerses] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // --- NEW: JUMP TARGET STATE ---
  const [targetVerse, setTargetVerse] = useState(null);

  // --- UI STATES ---
  const [loadingChapters, setLoadingChapters] = useState(true);
  const [loadingVerses, setLoadingVerses] = useState(false);

  // --- AUDIO STATE ---
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const stopAudioTrigger = useRef(() => { });

  // --- SETTINGS STATES (WITH PERSISTENCE) ---
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 1. Theme
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('app-theme') || 'light';
  });

  // 2. Translation
  const [showTranslation, setShowTranslation] = useState(() => {
    const saved = localStorage.getItem('app-showTranslation');
    return saved !== null ? saved === 'true' : true;
  });

  // 3. Only Translation (New)
  const [onlyTranslation, setOnlyTranslation] = useState(() => {
    const saved = localStorage.getItem('app-onlyTranslation');
    return saved !== null ? saved === 'true' : false;
  });

  // 4. Font Size
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem('app-fontSize');
    return saved ? parseInt(saved, 10) : 3;
  });

  // --- PERSISTENCE EFFECTS ---
  useEffect(() => { localStorage.setItem('app-theme', theme); }, [theme]);
  useEffect(() => { localStorage.setItem('app-showTranslation', showTranslation); }, [showTranslation]);
  useEffect(() => { localStorage.setItem('app-onlyTranslation', onlyTranslation); }, [onlyTranslation]);
  useEffect(() => { localStorage.setItem('app-fontSize', fontSize); }, [fontSize]);

  // Refs
  const contentTopRef = useRef(null);

  // --- FETCH CHAPTERS ---
  useEffect(() => {
    setLoadingChapters(true);
    fetch(`${API_URL}/api/chapters`)
      .then(res => res.json())
      .then(data => {
        setChapters(data.chapters || []);
        setLoadingChapters(false);
      })
      .catch(err => {
        console.error("Failed to load chapters", err);
        setLoadingChapters(false);
      });
  }, []);

  // --- FETCH VERSES (Appends or Resets) ---
  useEffect(() => {
    if (!selectedChapter) return;

    const controller = new AbortController();
    const signal = controller.signal;

    if (page === 1 && contentTopRef.current) {
      contentTopRef.current.scrollTop = 0;
    }

    setLoadingVerses(true);

    fetch(`${API_URL}/api/chapters/${selectedChapter.id}/verses?page=${page}`, { signal })
      .then(res => res.json())
      .then(data => {
        if (signal.aborted) return;

        const fetchedVerses = data.verses || [];
        const meta = data.pagination || {};

        setTotalPages(meta.total_pages || 1);

        if (page === 1) {
          setVerses(fetchedVerses);
        } else {
          // Infinite Scroll Append
          setVerses(prev => {
            const existingIds = new Set(prev.map(v => v.id));
            const uniqueNewVerses = fetchedVerses.filter(v => !existingIds.has(v.id));
            return [...prev, ...uniqueNewVerses];
          });
        }
        setLoadingVerses(false);
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error(err);
          setLoadingVerses(false);
        }
      });

    return () => controller.abort();
  }, [selectedChapter, page]);

  // --- HANDLERS ---
  const handleChapterSelect = (chapter) => {
    const chapterObj = typeof chapter === 'number'
      ? chapters.find(c => c.id === chapter)
      : chapter;

    if (chapterObj) {
      if (selectedChapter && selectedChapter.id === chapterObj.id) return;
      stopAudioTrigger.current();
      setVerses([]);
      setPage(1);
      setSelectedChapter(chapterObj);
      setTargetVerse(null);
    }
  };

  const handleVerseJump = (verseNumber) => {
    const requiredPage = Math.ceil(verseNumber / 10);
    setTargetVerse({ id: verseNumber });
    if (page < requiredPage) {
      setPage(requiredPage);
    }
  };

  // --- THEME COLORS ---
  const isLight = theme === 'light';
  const mainBgClass = isLight ? 'bg-[#f5f5f0] text-[#2b2b2b]' : 'bg-[rgb(22,22,24)] text-[rgb(252,252,252)]';
  const headerBgClass = isLight ? 'bg-[#e7e5e4] border-stone-300' : 'bg-[rgb(46,47,48)] border-gray-700/50';
  const stopBtnClass = isLight ? 'bg-red-100 text-red-600 border-1 border-amber-800' : 'bg-red-500/20 text-red-400 border-1 border-amber-700';

  return (
    <div className={`flex h-screen font-sans overflow-hidden transition-colors duration-300 ${mainBgClass}`}>

      {/* --- GLOBAL HEADER --- */}
      <div className={`fixed top-0 w-full z-50 h-16 px-3 md:px-4 flex items-center justify-between shadow-sm border-b transition-colors duration-300 ${headerBgClass}`}>
        
        {/* LEFT */}
        <div className="flex items-center gap-3 z-20">
          <div className="md:hidden">
            {isAudioPlaying ? (
              <button
                onClick={() => stopAudioTrigger.current()}
                className={`w-9 h-9 rounded-full flex items-center justify-center animate-in fade-in zoom-in duration-200 ${stopBtnClass}`}
              >
                <Square size={16} fill="currentColor" />
              </button>
            ) : (
              <img src={logoquran} alt="Al-Qur'an" className="w-9 h-9" />
            )}
          </div>
          <div className="hidden md:block">
            <img src={logoquran} alt="Al-Qur'an" className="w-9 h-9" />
          </div>
          <span className="hidden md:block font-bold text-xl tracking-tight" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
            Al-Qur'an
          </span>
        </div>

        {/* CENTER: Dynamic Bar */}
        <div className="absolute top-0 left-0 right-0 flex justify-center z-30 pt-2.5 pointer-events-none">
          <div className="pointer-events-auto flex items-start gap-1">
             <div className={`
               hidden md:flex items-center justify-center mr-0
               transition-all duration-300 ease-out transform
               ${isAudioPlaying ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-4 scale-75 pointer-events-none'}
               mt-1 
            `}>
              <button
                onClick={() => stopAudioTrigger.current()}
                className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform ${stopBtnClass}`}
              >
                <Square size={16} fill="currentColor" />
              </button>
            </div>

            <div>
              {loadingChapters ? (
                <div className="h-11 w-[300px] md:w-[500px] bg-[#1a1b1d] border border-white/5 rounded-2xl animate-pulse flex items-center justify-center">
                  <div className="h-2 w-24 bg-gray-700 rounded-full opacity-50"></div>
                </div>
              ) : (
                <DynamicBar
                  chapters={chapters}
                  selectedChapter={selectedChapter}
                  onSelect={handleChapterSelect}
                  onVerseJump={handleVerseJump}
                />
              )}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center z-20">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className={`p-2 rounded-full transition-colors ${isLight ? 'hover:bg-stone-300 text-stone-700' : 'hover:bg-gray-700 text-gray-300'}`}
          >
            <Settings size={24} />
          </button>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 h-full flex flex-col overflow-hidden relative pt-16">
        {!selectedChapter ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center animate-pulse ${isLight ? 'bg-stone-300' : 'bg-gray-800'}`}>
              <img src={logoquran} className="w-8 h-8 opacity-50" />
            </div>
            <p className="text-lg font-mono">Bismillah</p>
            {loadingChapters && <p className="text-xs text-gray-500">Connecting to Server...</p>}
          </div>
        ) : (
          <VerseList
            verses={verses}
            loading={loadingVerses}
            page={page}
            setPage={setPage}
            totalPages={totalPages}
            scrollRef={contentTopRef}
            theme={theme}
            showTranslation={showTranslation}
            onlyTranslation={onlyTranslation} 
            fontSize={fontSize}
            onAudioStatusChange={setIsAudioPlaying}
            registerStopHandler={(handler) => stopAudioTrigger.current = handler}
            selectedChapter={selectedChapter}
            onChapterNavigate={handleChapterSelect}
            targetVerse={targetVerse}
            setTargetVerse={setTargetVerse}
          />
        )}
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        setTheme={setTheme}
        showTranslation={showTranslation}
        setShowTranslation={setShowTranslation}
        onlyTranslation={onlyTranslation}
        setOnlyTranslation={setOnlyTranslation}
        fontSize={fontSize}
        setFontSize={setFontSize}
      />
    </div>
  );
}

export default App;