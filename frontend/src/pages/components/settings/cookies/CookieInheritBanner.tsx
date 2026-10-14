import { Icon } from "@iconify/react";

interface CookieInheritBannerProps {
  adminDefaultsInfo: any;
}

export function CookieInheritBanner({
  adminDefaultsInfo,
}: CookieInheritBannerProps) {
  return (
    <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/20 text-xs text-gray-300 leading-relaxed">
      <div className="font-semibold text-cyan-300 mb-1 flex items-center gap-1.5">
        <Icon icon="tabler:info-circle" className="text-sm" />
        Inheriting Administrator Defaults
      </div>
      Your downloads automatically utilize the administrator's configured cookie
      profile (
      <span className="font-mono text-cyan-200">
        {adminDefaultsInfo
          ? `${adminDefaultsInfo.cookies_browser}`
          : "Auto Multi-Browser"}
      </span>
      ).
    </div>
  );
}

export default CookieInheritBanner;
