import { useState, useEffect, useRef } from 'react';
import { Menu, X, BookOpen, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

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

  // Cache
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

    // Scroll the VERSES container to top, not the whole window
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
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-[rgb(22,22,24)] text-[rgb(252,252,252)] font-sans overflow-hidden">
      
      {/* --- MOBILE HEADER (Fixed at very top) --- */}
      <div className="lg:hidden fixed top-0 w-full bg-[rgb(37,38,40)] z-50 p-4 flex items-center justify-between border-b border-gray-700">
        <span className="font-bold text-lg flex items-center gap-2">
           Al-Qur'an
        </span>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* --- SIDEBAR --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-[rgb(22,22,24)] border-r border-gray-800 transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 lg:mt-0 mt-16
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-4 h-full overflow-y-auto custom-scrollbar">
          <h2 className="text-xl font-bold mb-4 hidden lg:block text-emerald-400">Al-Qur'an</h2>
          {loadingChapters ? (
            <div className="flex justify-center p-4"><Loader2 className="animate-spin"/></div>
          ) : (
            <ul className="space-y-2">
              {chapters.map((chapter) => (
                <li key={chapter.id}>
                  <button
                    onClick={() => handleChapterSelect(chapter)}
                    className={`w-full text-left p-3 rounded-lg flex justify-between items-center transition-colors
                      ${selectedChapter?.id === chapter.id 
                        ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/30' 
                        : 'hover:bg-[rgb(37,38,40)]'
                      }`}
                  >
                    <div>
                      <span className="text-xs font-mono opacity-50 mr-2">{chapter.id}.</span>
                      <span className="font-medium">{chapter.name_simple}</span>
                    </div>
                    <span className="text-lg font-arabic">{chapter.name_arabic}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 h-full flex flex-col overflow-hidden relative pt-16 lg:pt-0">
        {!selectedChapter ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
            <BookOpen size={64} className="mb-4" />
            <p className="text-xl">Select a Surah to begin reading</p>
          </div>
        ) : (
          <>
{/* --- FIXED CHAPTER HEADER --- */}
<div className="shrink-0 z-10 w-full bg-[rgb(22,22,24)] border-b border-gray-800 shadow-sm">
  <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
    
    {/* Left Side: Names */}
    <div className="flex items-baseline gap-3">
      <h1 className="text-xl lg:text-2xl font-bold text-white">
        {selectedChapter.name_simple}
      </h1>
      <span className="text-lg lg:text-xl font-arabic text-emerald-400">
        {selectedChapter.name_arabic}
      </span>
    </div>

    {/* Right Side: Tags */}
    <div className="flex items-center gap-3 text-xs lg:text-sm text-gray-400">
      {/* <span className="capitalize bg-[rgb(37,38,40)] px-2 py-1 rounded">
        {selectedChapter.revelation_place}
      </span> */}
      <span className="bg-[rgb(37,38,40)] px-2 py-1 rounded">
        {selectedChapter.verses_count} Verses
      </span>
    </div>

  </div>
</div>

            {/* --- SCROLLABLE VERSES AREA --- */}
            <div 
              ref={contentTopRef}
              className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth custom-scrollbar"
            >
              <div className="max-w-4xl mx-auto pb-10">
                {loadingVerses ? (
                   <div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-emerald-500"/></div>
                ) : (
                  <>
                    <div className="space-y-8 mb-10">
                      {verses.map((verse) => (
                        <div key={verse.id} className="bg-[rgb(37,38,40)]/50 p-6 rounded-xl border border-gray-800/50 hover:border-gray-700 transition-colors">
                          <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-700/50">
                            <span className="text-xs font-mono text-emerald-500 bg-emerald-900/20 px-2 py-1 rounded">
                              {verse.verse_key}
                            </span>
                          </div>
                          <p className="text-right text-3xl leading-[2.5] font-arabic mb-6" dir="rtl">
                            {verse.text_uthmani}
                          </p>
                          <p className="text-gray-300 text-lg leading-relaxed">
                            {verse.translations?.[0]?.text ? (
                               <span dangerouslySetInnerHTML={{__html: verse.translations[0].text}} />
                            ) : "Translation unavailable"}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* --- PAGINATION CONTROLS (Normal Flow) --- */}
                    {/* Removed "sticky bottom-0 shadow-lg" classes */}
                    <div className="flex items-center justify-between bg-[rgb(37,38,40)] p-4 rounded-xl border border-gray-800">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-emerald-900/30 hover:text-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft size={18} /> Previous
                      </button>

                      <span className="font-mono text-sm text-gray-400">
                        Page {page} <span className="opacity-50">/ {paginationMeta?.total_pages || '?'}</span>
                      </span>

                      <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={paginationMeta && page >= paginationMeta.total_pages}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-emerald-900/30 hover:text-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        Next <ChevronRight size={18} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;