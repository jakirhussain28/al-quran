import { useState, useEffect, useRef } from 'react';
import { Settings } from 'lucide-react';
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
  const [paginationMeta, setPaginationMeta] = useState(null);
  const [page, setPage] = useState(1);

  // --- UI STATES ---
  const [loadingChapters, setLoadingChapters] = useState(true);
  const [loadingVerses, setLoadingVerses] = useState(false);
  
  // --- SETTINGS STATES ---
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [theme, setTheme] = useState('night'); // 'night' or 'light'
  const [showTranslation, setShowTranslation] = useState(true);
  const [fontSize, setFontSize] = useState(3); // 1 to 5
  
  // Refs
  const verseCache = useRef({});
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

  // --- FETCH VERSES ---
  useEffect(() => {
    if (!selectedChapter) return;
    if (contentTopRef.current) contentTopRef.current.scrollTop = 0;

    const chapterId = selectedChapter.id;
    const cacheKey = `${chapterId}-${page}`;

    if (verseCache.current[cacheKey]) {
      setVerses(verseCache.current[cacheKey].verses);
      setPaginationMeta(verseCache.current[cacheKey].meta);
      setLoadingVerses(false);
      return;
    }

    setLoadingVerses(true);
    fetch(`${API_URL}/api/chapters/${chapterId}/verses?page=${page}`)
      .then(res => res.json())
      .then(data => {
        const fetchedVerses = data.verses || [];
        const meta = data.pagination || {};
        verseCache.current[cacheKey] = { verses: fetchedVerses, meta: meta };
        setVerses(fetchedVerses);
        setPaginationMeta(meta);
        setLoadingVerses(false);
      })
      .catch(err => setLoadingVerses(false));
  }, [selectedChapter, page]);

  // --- HANDLERS ---
  const handleChapterSelect = (chapter) => {
    setSelectedChapter(chapter);
    setPage(1);
  };

  // --- THEME COLORS ---
  // If theme is 'light', we use warm colors (Heaven Light). If 'night', we use the original dark scheme (Night Sky).
  const isLight = theme === 'light';
  
  const mainBgClass = isLight ? 'bg-[#f5f5f0] text-[#2b2b2b]' : 'bg-[rgb(22,22,24)] text-[rgb(252,252,252)]';
  const headerBgClass = isLight ? 'bg-[#e7e5e4] border-stone-300' : 'bg-[rgb(46,47,48)] border-gray-700/50';
  
  return (
    <div className={`flex h-screen font-sans overflow-hidden transition-colors duration-300 ${mainBgClass}`}>
      
      {/* --- GLOBAL HEADER --- */}
      <div className={`fixed top-0 w-full z-50 h-16 px-4 flex items-center justify-between shadow-sm border-b transition-colors duration-300 ${headerBgClass}`}>
        
        {/* Left: Logo */}
        <div className="flex items-center gap-3 z-20">
          <img src={logoquran} alt="Al-Qur'an" className="w-9 h-9" />
          <span className="hidden md:block font-bold text-xl tracking-tight" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
            Al-Qur'an
          </span>
        </div>

        {/* CENTER: DYNAMIC BAR CONTAINER */}
        <div className="absolute top-0 left-0 right-0 flex justify-center z-30 pt-2.5 pointer-events-none">
          <div className="pointer-events-auto">
            {loadingChapters ? (
              // LOADING STATE: Skeleton Pulse
              <div className="h-11 w-[300px] md:w-[500px] bg-[#1a1b1d] border border-white/5 rounded-2xl animate-pulse flex items-center justify-center">
                <div className="h-2 w-24 bg-gray-700 rounded-full opacity-50"></div>
              </div>
            ) : (
              <DynamicBar 
                chapters={chapters}
                selectedChapter={selectedChapter}
                onSelect={handleChapterSelect}
              />
            )}
          </div>
        </div>

        {/* Right: Settings */}
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
            paginationMeta={paginationMeta}
            scrollRef={contentTopRef}
            // PASS SETTINGS PROPS
            theme={theme}
            showTranslation={showTranslation}
            fontSize={fontSize}
          />
        )}
      </main>

      {/* --- MODAL (Rendered at root level) --- */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        setTheme={setTheme}
        showTranslation={showTranslation}
        setShowTranslation={setShowTranslation}
        fontSize={fontSize}
        setFontSize={setFontSize}
      />
    </div>
  );
}

export default App;