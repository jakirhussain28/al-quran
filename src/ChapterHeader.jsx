function ChapterHeader({ chapter }) {
  if (!chapter) return null;

  return (
    <div className="shrink-0 z-10 w-full bg-[rgb(22,22,24)] border-b border-gray-800 shadow-sm">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        
        {/* Left Side: Names */}
        <div className="flex items-baseline gap-3">
          <h1 className="text-xl lg:text-2xl font-bold text-white">
            {chapter.name_simple}
          </h1>
          <span className="text-lg lg:text-xl font-arabic text-emerald-400">
            {chapter.name_arabic}
          </span>
        </div>

        {/* Right Side: Tags */}
        <div className="flex items-center gap-3 text-xs lg:text-sm text-gray-400">
          <span className="bg-[rgb(37,38,40)] px-2 py-1 rounded">
            {chapter.verses_count} Verses
          </span>
        </div>

      </div>
    </div>
  );
}

export default ChapterHeader;