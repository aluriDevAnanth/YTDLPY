interface LibraryCountCardProps {
  totalVideos?: number;
}

export function LibraryCountCard({ totalVideos = 0 }: LibraryCountCardProps) {
  return (
    <div className="p-3 rounded-lg bg-gray-900/60 border border-gray-800 flex flex-col justify-between">
      <span className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">
        Library Count
      </span>
      <span className="text-lg sm:text-xl font-bold font-mono text-emerald-400 truncate mt-1">
        {totalVideos} Items
      </span>
      <span className="text-[10px] text-gray-400 mt-0.5">
        Active & stored bundles
      </span>
    </div>
  );
}

export default LibraryCountCard;
