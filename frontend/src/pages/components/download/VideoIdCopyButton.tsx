import { Icon } from "@iconify/react";
import { useState } from "react";

interface VideoIdCopyButtonProps {
  id: string;
}

export function VideoIdCopyButton({ id }: VideoIdCopyButtonProps) {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = async (
    e: React.MouseEvent<HTMLSpanElement>,
  ): Promise<void> => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 1000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="w-full min-w-[140px] max-w-[190px] flex items-center justify-between gap-2">
      <span className="font-mono text-xs text-gray-700 dark:text-gray-300 truncate">
        {id}
      </span>
      <span
        onClick={handleCopy}
        className="px-2 py-1 h-7 text-xs flex items-center gap-1.5 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 border-0 text-gray-600 dark:text-gray-300 rounded-md shrink-0 transition-colors cursor-pointer"
      >
        <Icon
          icon={copied ? "tabler:check" : "tabler:copy"}
          className={`text-sm ${copied ? "text-emerald-500" : "text-gray-400"}`}
        />
        <span className="text-[11px] font-medium">
          {copied ? "Copied" : "Copy"}
        </span>
      </span>
    </div>
  );
}

export default VideoIdCopyButton;
