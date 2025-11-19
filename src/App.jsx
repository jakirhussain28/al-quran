import { useState, useEffect, useRef } from 'react';
import { Menu, X, BookOpen } from 'lucide-react';
import Sidebar from './Sidebar';
import ChapterHeader from './ChapterHeader';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Cache & Refs
  const verseCache = useRef({}); 
  const contentTopRef = useRef(null);

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

    // Reset Scroll
    if (contentTopRef.current) {
      contentTopRef.current.scrollTop = 0;
    }
    
    const chapterId = selectedChapter.id;
    const cacheKey = `${chapterId}-${page}`;

    if (verseCache.current[cacheKey]) {
      console.log(`⚡ Loaded ${cacheKey} from Cache`);
      const cachedData = verseCache.current[cacheKey];
      setVerses(cachedData.verses);
      setPaginationMeta(cachedData.meta);
      setLoadingVerses(false);
      return;
    }

    console.log(`🌐 Fetching ${cacheKey} from API...`);
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
  };

  return (
    <div className="flex h-screen bg-[rgb(22,22,24)] text-[rgb(252,252,252)] font-sans overflow-hidden">
      
      {/* --- MOBILE HEADER --- */}
      <div className="lg:hidden fixed top-0 w-full bg-[rgb(37,38,40)] z-50 p-4 flex items-center justify-between border-b border-gray-700">
        <span className="font-bold text-lg flex items-center gap-2 ">
           Al-Qur'an
        </span>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* --- COMPONENT: SIDEBAR --- */}
      <Sidebar 
        chapters={chapters}
        loading={loadingChapters}
        selectedChapter={selectedChapter}
        onSelect={handleChapterSelect}
        isOpen={mobileMenuOpen}
        closeMobileMenu={() => setMobileMenuOpen(false)}
      />

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 h-full flex flex-col overflow-hidden relative pt-16 lg:pt-0">
        {!selectedChapter ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
            <BookOpen size={64} className="mb-4" />
            <p className="text-xl">Select a Surah to begin reading</p>
          </div>
        ) : (
          <>
            {/* --- COMPONENT: CHAPTER HEADER --- */}
            <ChapterHeader chapter={selectedChapter} />

            {/* --- COMPONENT: VERSE LIST --- */}
            <VerseList 
              verses={verses}
              loading={loadingVerses}
              page={page}
              setPage={setPage}
              paginationMeta={paginationMeta}
              scrollRef={contentTopRef}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default App;