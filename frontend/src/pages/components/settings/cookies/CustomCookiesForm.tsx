import { Icon } from "@iconify/react";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";
import type { ChangeEvent, RefObject } from "react";

interface CustomCookiesFormProps {
  cookiesTxt: string;
  setCookiesTxt: (txt: string) => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  handleFileUpload: (e: ChangeEvent<HTMLInputElement>) => void;
}

export function CustomCookiesForm({
  cookiesTxt,
  setCookiesTxt,
  fileInputRef,
  handleFileUpload,
}: CustomCookiesFormProps) {
  return (
    <div className="flex flex-col gap-2.5 p-3 rounded-lg bg-gray-950/70 border border-gray-800">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-gray-200">
          Netscape Format cookies.txt
        </label>
        <div className="flex items-center gap-1.5">
          <input
            type="file"
            ref={fileInputRef as any}
            className="hidden"
            accept=".txt"
            onChange={handleFileUpload}
          />
          <Button
            type="button"
            severity="secondary"
            className="px-2 py-0.5 text-[11px] flex items-center gap-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-md"
            onClick={() => fileInputRef.current?.click()}
          >
            <Icon icon="tabler:upload" className="text-xs" />
            <span>Upload File</span>
          </Button>
        </div>
      </div>

      <InputTextarea
        value={cookiesTxt}
        onChange={(e) => setCookiesTxt(e.target.value)}
        rows={4}
        placeholder="# Netscape HTTP Cookie File&#10;.youtube.com&#9;TRUE&#9;/&#9;TRUE&#9;1735689600&#9;SID&#9;..."
        className="w-full text-[10px] font-mono p-2 bg-gray-900 border-gray-800 rounded-md"
      />
    </div>
  );
}

export default CustomCookiesForm;
