import { useState, useEffect, useRef } from 'react';
import { Menu, BookOpen, Settings } from 'lucide-react';
import logoquran from '/src/assets/logo-quran.svg';
import Sidebar from './Sidebar';
// Removed ChapterHeader import
import VerseList from './VerseList';

const API_URL = "http://localhost:8000/api";

function App() {
  // Data States
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [verses, setVerses] = useState([]);
  const [paginationMeta, setPaginationMeta] = useState(null);
  const [page, setPage] = useState(1);

  // UI States
  const [loadingChapters, setLoadingChapters] = useState(true);
  const [loadingVerses, setLoadingVerses] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Cache & Refs
  const verseCache = useRef({});
  const contentTopRef = useRef(null);
  const closeTimeoutRef = useRef(null);

  // --- HOVER HANDLERS (Desktop) ---
  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    setSidebarOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setSidebarOpen(false);
    }, 300);
  };

  // 1. Load Chapters
  useEffect(() => {
    fetch(`${API_URL}/chapters`)
      .then(res => res.json())
      .then(data => {
        setChapters(data.chapters || []);
        setLoadingChapters(false);
      })
      .catch(err => console.error("Failed to load chapters", err));
  }, []);

  // 2. Load Verses
  useEffect(() => {
    if (!selectedChapter) return;

    if (contentTopRef.current) {
      contentTopRef.current.scrollTop = 0;
    }

    const chapterId = selectedChapter.id;
    const cacheKey = `${chapterId}-${page}`;

    if (verseCache.current[cacheKey]) {
      const cachedData = verseCache.current[cacheKey];
      setVerses(cachedData.verses);
      setPaginationMeta(cachedData.meta);
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
      .catch(err => {
        console.error(err);
        setLoadingVerses(false);
      });
  }, [selectedChapter, page]);

  const handleChapterSelect = (chapter) => {
    setSelectedChapter(chapter);
    setPage(1);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-[rgb(22,22,24)] text-[rgb(252,252,252)] font-sans overflow-hidden">

      {/* --- GLOBAL HEADER --- */}
      <div className="fixed top-0 w-full bg-[rgb(46,47,48)] z-50 h-16 px-4 flex items-center justify-between shadow-sm border-b border-gray-700/50">

        {/* LEFT: Menu Button & Logo */}
        <div className="flex items-center gap-4 h-full z-20 shrink-0">
          <button
            className="lg:hidden p-2 hover:bg-gray-700 rounded-lg transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu />
          </button>

          {/* Logo & Title: Hidden on Mobile if a chapter is selected (to make room for bar) */}
          <div className={`items-center gap-3 ${selectedChapter ? 'hidden md:flex' : 'flex'}`}>
            <img src={logoquran} alt="Al-Qur'an" className="w-9 h-9" />
            <span
              className="font-bold text-xl flex items-center tracking-tight"
              style={{ fontFamily: '"JetBrains Mono", monospace' }}
            >
              Al-Qur'an
            </span>
          </div>
        </div>

        {/* CENTER: Dynamic Bar */}
        {/* Logic:
            - If Chapter Selected: Visible on Mobile (anchored left-14/right-14) & Desktop (Centered)
            - If No Chapter: Hidden on Mobile, Visible on Desktop
        */}
        <div className={`absolute top-1/2 -translate-y-1/2 z-10 transition-all duration-300
          ${selectedChapter 
            ? 'left-14 right-14 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-auto' 
            : 'hidden md:block left-1/2 -translate-x-1/2'
          }
        `}>
           {selectedChapter ? (
             <div className="h-10 md:h-12 bg-[#1a1b1d] border border-white/5 rounded-full flex items-center justify-between px-3 md:px-6 gap-2 md:gap-12 w-full md:min-w-[450px] md:w-fit shadow-inner transition-all">
                
                {/* English Name */}
                <span className="text-gray-200 font-medium text-sm md:text-lg tracking-wide truncate min-w-0">
                  {selectedChapter.name_simple}
                </span>

                {/* Arabic Name */}
                <span className="font-arabic text-lg md:text-2xl text-emerald-500 pb-1 leading-none whitespace-nowrap">
                  {selectedChapter.name_arabic}
                </span>

                {/* Verse Count Pill */}
                <span className="bg-[rgb(60,61,63)] text-[10px] md:text-xs text-gray-300 py-1 px-2 md:px-4 rounded-full font-medium whitespace-nowrap">
                  {selectedChapter.verses_count} <span className="hidden sm:inline">Verses</span>
                </span>
             </div>
           ) : (
             // Placeholder (Desktop Only)
             <div className="w-[450px] bg-black/30 border border-white/5 hover:bg-black/30 transition-all rounded-full h-12 flex items-center justify-center text-gray-400/80 text-sm cursor-default select-none">
                Select a Surah to begin reading
             </div>
           )}
        </div>

        {/* RIGHT: Settings Button */}
        <div className="flex items-center gap-2 z-20 shrink-0">
           <button className="p-2.5 hover:bg-gray-700 rounded-full transition-colors text-gray-300">
             <Settings size={22} />
           </button>
        </div>
      </div>

      {/* --- DESKTOP HOVER TRIGGER ZONE --- */}
      <div
        className="hidden lg:block fixed top-16 bottom-0 left-0 w-10 z-30"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />

      {/* --- SIDEBAR --- */}
      <Sidebar
        chapters={chapters}
        loading={loadingChapters}
        selectedChapter={selectedChapter}
        onSelect={handleChapterSelect}
        isOpen={sidebarOpen}
        closeMobileMenu={() => setSidebarOpen(false)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 h-full flex flex-col overflow-hidden relative pt-16">
        {!selectedChapter ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
            <p className="text-xl">Select a Surah to begin reading</p>
          </div>
        ) : (
          <>
            {/* Deleted ChapterHeader Component Usage */}
            
            <VerseList
              verses={verses}
              loading={loadingVerses}
              page={page}
              setPage={setPage}
              paginationMeta={paginationMeta}
              scrollRef={contentTopRef}
              bismillahPre={selectedChapter.bismillah_pre}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default App;