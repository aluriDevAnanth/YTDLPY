interface TotalDiskCardProps {
  formattedBytes?: string;
  completedDownloads?: number;
}

export function TotalDiskCard({
  formattedBytes = "0 B",
  completedDownloads = 0,
}: TotalDiskCardProps) {
  return (
    <div className="p-3 rounded-lg bg-gray-900/60 border border-gray-800 flex flex-col justify-between">
      <span className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">
        Total Disk Usage
      </span>
      <span className="text-lg sm:text-xl font-bold font-mono text-amber-400 truncate mt-1">
        {formattedBytes}
      </span>
      <span className="text-[10px] text-gray-400 mt-0.5">
        {completedDownloads} completed download(s)
      </span>
    </div>
  );
}

export default TotalDiskCard;
