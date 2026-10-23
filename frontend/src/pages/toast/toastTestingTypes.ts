export type SeverityType = "success" | "info" | "warn" | "error";

export type PositionType =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left"
  | "top-center"
  | "bottom-center";

export interface ToastLogEntry {
  id: string;
  timestamp: string;
  severity: SeverityType;
  summary: string;
  detail: string;
  position: PositionType;
  sticky: boolean;
}

export const positionOptions: { label: string; value: PositionType }[] = [
  { label: "Top Right", value: "top-right" },
  { label: "Top Left", value: "top-left" },
  { label: "Top Center", value: "top-center" },
  { label: "Bottom Right", value: "bottom-right" },
  { label: "Bottom Left", value: "bottom-left" },
  { label: "Bottom Center", value: "bottom-center" },
];

export const getSeverityBadgeClass = (sev: SeverityType) => {
  switch (sev) {
    case "success":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
    case "info":
      return "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30";
    case "warn":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
    case "error":
      return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30";
  }
};
