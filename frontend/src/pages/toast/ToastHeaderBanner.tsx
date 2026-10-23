import { Icon } from "@iconify/react";
import { Button } from "primereact/button";

interface ToastHeaderBannerProps {
  onBurstTest: () => void;
}

export function ToastHeaderBanner({ onBurstTest }: ToastHeaderBannerProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 shadow-sm transition-all">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 shrink-0">
          <Icon icon="tabler:bell-ringing" className="text-2xl sm:text-3xl" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Toast Notification Studio
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Interactive playground to trigger, customize, and test system toast
            alerts across positions & themes.
          </p>
        </div>
      </div>

      <Button
        label="Burst Test (3 Toasts)"
        icon="pi pi-bolt"
        severity="help"
        className="p-button-sm rounded-xl shrink-0"
        onClick={onBurstTest}
      />
    </div>
  );
}

export default ToastHeaderBanner;
