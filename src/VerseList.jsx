import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

function VerseList({ 
  verses, 
  loading, 
  page, 
  setPage, 
  paginationMeta, 
  scrollRef 
}) {
  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth custom-scrollbar"
    >
      <div className="max-w-4xl mx-auto pb-10">
        {loading ? (
           <div className="flex justify-center py-20">
             <Loader2 className="animate-spin h-10 w-10 text-emerald-500"/>
           </div>
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

            {/* --- PAGINATION CONTROLS --- */}
            <div className="flex items-center justify-between bg-[rgb(37,38,40)] p-2 rounded-xl border border-gray-800">
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
  );
}

export default VerseList;