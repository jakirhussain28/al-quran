import { useState, useEffect, useRef } from 'react';
import { Settings } from 'lucide-react';
import logoquran from '/src/assets/logo-quran.svg';
import VerseList from './Components/VerseList';
import DynamicBar from './Components/DynamicBar';

const API_URL = "http://localhost:8000/api";

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
  
  // Refs
  const verseCache = useRef({});
  const contentTopRef = useRef(null);

  // --- FETCH CHAPTERS ---
  useEffect(() => {
    fetch(`${API_URL}/chapters`)
      .then(res => res.json())
      .then(data => {
        setChapters(data.chapters || []);
        setLoadingChapters(false);
      })
      .catch(err => console.error("Failed to load chapters", err));
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
    fetch(`${API_URL}/chapters/${chapterId}/verses?page=${page}`)
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
    // Dropdown closing logic is now handled inside DynamicBar
  };

  return (
    <div className="flex h-screen bg-[rgb(22,22,24)] text-[rgb(252,252,252)] font-sans overflow-hidden">
      
      {/* --- GLOBAL HEADER --- */}
      <div className="fixed top-0 w-full bg-[rgb(46,47,48)] z-50 h-16 px-4 flex items-center justify-between shadow-sm border-b border-gray-700/50">
        
        {/* Left: Logo */}
        <div className="flex items-center gap-3 z-20">
          <img src={logoquran} alt="Al-Qur'an" className="w-9 h-9" />
          <span className="hidden md:block font-bold text-xl tracking-tight" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
            Al-Qur'an
          </span>
        </div>

        {/* CENTER: DYNAMIC BAR CONTAINER */}
        {/* The absolute positioning remains here to center the component in the header */}
        <div className="absolute top-0 h-16 flex items-center justify-center left-0 right-0 z-30 pointer-events-none">
          <DynamicBar 
            chapters={chapters}
            selectedChapter={selectedChapter}
            onSelect={handleChapterSelect}
          />
        </div>

        {/* Right: Settings */}
        <div className="flex items-center z-20">
           <button className="p-2 hover:bg-gray-700 rounded-full transition-colors text-gray-300">
             <Settings size={20} />
           </button>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 h-full flex flex-col overflow-hidden relative pt-16">
        {!selectedChapter ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-4">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center animate-pulse">
               <img src={logoquran} className="w-8 h-8 opacity-50" />
            </div>
            <p className="text-lg font-mono">Select a Surah from the bar above</p>
          </div>
        ) : (
          <VerseList
            verses={verses}
            loading={loadingVerses}
            page={page}
            setPage={setPage}
            paginationMeta={paginationMeta}
            scrollRef={contentTopRef}
          />
        )}
      </main>
    </div>
  );
}

export default App;