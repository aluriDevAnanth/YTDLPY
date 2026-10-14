import { Icon } from "@iconify/react";
import { Button } from "primereact/button";
import { memo } from "react";

interface AdminBannerProps {
  isAdmin: boolean;
  applyingAll: boolean;
  onApplyToAllUsers: () => void;
}

export const AdminBanner = memo(
  ({ isAdmin, applyingAll, onApplyToAllUsers }: AdminBannerProps) => {
    if (!isAdmin) return null;

    return (
      <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-amber-950/40 to-cyan-950/30 border border-amber-500/30 flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <Icon
            icon="tabler:shield-check"
            className="text-xl text-amber-400 shrink-0"
          />
          <div className="text-xs text-gray-300">
            <span className="font-bold text-amber-300">Admin Mode: </span>
            Your settings serve as the default template for all regular users.
          </div>
        </div>
        <Button
          type="button"
          label="Apply to All Users"
          icon="pi pi-users"
          loading={applyingAll}
          severity="warning"
          className="p-button-sm text-[11px] px-3 py-1 font-semibold rounded-lg shrink-0"
          onClick={onApplyToAllUsers}
        />
      </div>
    );
  },
);

AdminBanner.displayName = "AdminBanner";
