import { Icon } from "@iconify/react";
import { Button } from "primereact/button";
import { useState } from "react";
import type { VideoT } from "src/schema";

interface CopyUrlButtonProps {
  rowData: VideoT;
}

export function CopyUrlButton({ rowData }: CopyUrlButtonProps) {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ): Promise<void> => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(rowData.url);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 1000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <Button
      onClick={handleCopy}
      className="p-1 p-button-sm shrink-0"
      tooltip={copied ? "Copied!" : "Copy URL"}
      tooltipOptions={{ position: "top" }}
    >
      <Icon
        icon={copied ? "tabler:check" : "tabler:copy"}
        className={`text-base ${copied ? "text-emerald-400" : ""}`}
      />
    </Button>
  );
}

export default CopyUrlButton;
