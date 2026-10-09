interface VideoCardMetaInfoProps {
  size?: string;
  format?: string;
}

export function VideoCardMetaInfo({ size, format }: VideoCardMetaInfoProps) {
  return (
    <div className="flex items-center gap-1 text-[10px] text-gray-600 dark:text-gray-400 font-mono">
      {size && <span className="truncate">📦 {size}</span>}
      {format && (
        <span className="uppercase text-gray-500 dark:text-gray-500">
          • {format}
        </span>
      )}
    </div>
  );
}

export default VideoCardMetaInfo;
