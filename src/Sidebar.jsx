import { Loader2 } from 'lucide-react';

function Sidebar({ 
  chapters, 
  loading, 
  selectedChapter, 
  onSelect, 
  isOpen, 
  closeMobileMenu 
}) {
  return (
    <aside className={`
      fixed inset-y-0 left-0 z-40 w-72 bg-[rgb(22,22,24)] border-r border-gray-800 transform transition-transform duration-300 ease-in-out
      lg:relative lg:translate-x-0 lg:mt-0 mt-16
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="p-4 h-full overflow-y-auto custom-scrollbar">
        <h2 className="text-xl font-bold mb-4 hidden lg:block ">Al-Qur'an</h2>
        
        {loading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="animate-spin text-emerald-500" />
          </div>
        ) : (
          <ul className="space-y-2">
            {chapters.map((chapter) => (
              <li key={chapter.id}>
                <button
                  onClick={() => {
                    onSelect(chapter);
                    closeMobileMenu();
                  }}
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
  );
}

export default Sidebar;