interface LargestFileCardProps {
  formattedLargestBytes?: string;
  largestVideoTitle?: string;
}

export function LargestFileCard({
  formattedLargestBytes = "0 B",
  largestVideoTitle = "No videos",
}: LargestFileCardProps) {
  return (
    <div className="p-3 rounded-lg bg-gray-900/60 border border-gray-800 flex flex-col justify-between">
      <span className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">
        Largest Media File
      </span>
      <span className="text-lg sm:text-xl font-bold font-mono text-indigo-400 truncate mt-1">
        {formattedLargestBytes}
      </span>
      <span
        className="text-[10px] text-gray-400 truncate mt-0.5"
        title={largestVideoTitle}
      >
        {largestVideoTitle}
      </span>
    </div>
  );
}

export default LargestFileCard;
