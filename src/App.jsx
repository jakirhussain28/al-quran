import { useState, useEffect, useRef } from 'react';
import { Menu, X, BookOpen, Loader2 } from 'lucide-react';

const API_URL = "http://localhost:8000/api";

function App() {
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [verses, setVerses] = useState([]);
  
  // Loading states
  const [loadingChapters, setLoadingChapters] = useState(true);
  const [loadingVerses, setLoadingVerses] = useState(false);
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- CACHING MECHANISM ---
  // useRef persists data between renders but clears on page refresh.
  // Structure: { 1: [verses...], 2: [verses...] }
  const verseCache = useRef({}); 
  
  // Ref for the main content area to scroll to top on navigation
  const contentTopRef = useRef(null);

  // 1. Load Chapters on Mount
  useEffect(() => {
    fetch(`${API_URL}/chapters`)
      .then(res => res.json())
      .then(data => {
        setChapters(data.chapters || []); 
        setLoadingChapters(false);
      })
      .catch(err => console.error("Failed to load chapters", err));
  }, []);

  // 2. Load Verses (with Cache Check)
  useEffect(() => {
    if (!selectedChapter) return;

    setMobileMenuOpen(false);
    
    // Scroll to top of content when changing chapter
    if (contentTopRef.current) {
      contentTopRef.current.scrollTop = 0;
    }

    const chapterId = selectedChapter.id;

    // --- CACHE CHECK ---
    if (verseCache.current[chapterId]) {
      console.log(`⚡ Loaded Chapter ${chapterId} from Cache`);
      setVerses(verseCache.current[chapterId]);
      setLoadingVerses(false); // Ensure loader is off
      return;
    }

    // --- NETWORK FETCH ---
    console.log(`🌐 Fetching Chapter ${chapterId} from API...`);
    setLoadingVerses(true);
    
    fetch(`${API_URL}/chapters/${chapterId}/verses`)
      .then(res => res.json())
      .then(data => {
        const fetchedVerses = data.verses || [];
        
        // Save to Cache
        verseCache.current[chapterId] = fetchedVerses;
        
        setVerses(fetchedVerses);
        setLoadingVerses(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingVerses(false);
      });
  }, [selectedChapter]);

  return (
    <div className="flex h-screen bg-[rgb(22,22,24)] text-[rgb(252,252,252)] font-sans overflow-hidden">
      
      {/* --- MOBILE HEADER --- */}
      <div className="lg:hidden fixed top-0 w-full bg-[rgb(37,38,40)] z-50 p-4 flex items-center justify-between border-b border-gray-700">
        <span className="font-bold text-lg flex items-center gap-2">
          <BookOpen size={20} className="text-emerald-400"/> Quran App
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
          <h2 className="text-xl font-bold mb-4 hidden lg:block text-emerald-400">Chapters</h2>
          
          {loadingChapters ? (
            <div className="flex justify-center p-4"><Loader2 className="animate-spin"/></div>
          ) : (
            <ul className="space-y-2">
              {chapters.map((chapter) => (
                <li key={chapter.id}>
                  <button
                    onClick={() => setSelectedChapter(chapter)}
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
      {/* Added ref={contentTopRef} here to enable scrolling to top on nav */}
      <main ref={contentTopRef} className="flex-1 h-full overflow-y-auto pt-20 lg:pt-0 p-4 lg:p-8 relative scroll-smooth">
        {!selectedChapter ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
            <BookOpen size={64} className="mb-4" />
            <p className="text-xl">Select a Surah to begin reading</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {/* Chapter Header */}
            <div className="mb-8 text-center border-b border-gray-800 pb-6">
              <h1 className="text-4xl font-bold mb-2">{selectedChapter.name_simple}</h1>
              <p className="text-2xl font-arabic text-emerald-400 mb-2">{selectedChapter.name_arabic}</p>
              <div className="flex justify-center gap-4 text-sm text-gray-400">
                <span className="capitalize">{selectedChapter.revelation_place}</span> • 
                <span>{selectedChapter.verses_count} Verses</span>
              </div>
            </div>

            {/* Verses List */}
            {loadingVerses ? (
               <div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-emerald-500"/></div>
            ) : (
              <div className="space-y-8 pb-20">
                {verses.map((verse) => (
                  <div key={verse.id} className="bg-[rgb(37,38,40)]/50 p-6 rounded-xl border border-gray-800/50 hover:border-gray-700 transition-colors">
                    
                    {/* Action Bar */}
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-700/50">
                      <span className="text-xs font-mono text-emerald-500 bg-emerald-900/20 px-2 py-1 rounded">
                        {verse.verse_key}
                      </span>
                    </div>

                    {/* Arabic Text */}
                    <p className="text-right text-3xl leading-[2.5] font-arabic mb-6" dir="rtl">
                      {verse.text_uthmani}
                    </p>

                    {/* Translation */}
                    <p className="text-gray-300 text-lg leading-relaxed">
                      {verse.translations?.[0]?.text ? (
                         <span dangerouslySetInnerHTML={{__html: verse.translations[0].text}} />
                      ) : "Translation unavailable"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;