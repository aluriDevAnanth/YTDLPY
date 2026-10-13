import { OverlayPanel } from "primereact/overlaypanel";
import { forwardRef } from "react";
import type { User } from "src/store/useAppStore";
import { LogoutMenuItem } from "./LogoutMenuItem";
import { UserProfileHeader } from "./UserProfileHeader";
import { UserProfileMenuItem } from "./UserProfileMenuItem";

interface UserProfileMenuProps {
  user: User | null;
  onOpenSettings: () => void;
  onOpenStorageManager: () => void;
  onOpenShortcutsHelp: () => void;
  onLogout: () => void;
}

export const UserProfileMenu = forwardRef<OverlayPanel, UserProfileMenuProps>(
  (
    {
      user,
      onOpenSettings,
      onOpenStorageManager,
      onOpenShortcutsHelp,
      onLogout,
    },
    ref,
  ) => {
    const closePanel = () => {
      if (ref && "current" in ref && ref.current) {
        ref.current.hide();
      }
    };

    return (
      <OverlayPanel
        pt={{ content: { className: "px-2 py-1" } }}
        ref={ref}
        dismissable
        className="dark:bg-[#18181b] dark:text-white dark:border-gray-800 rounded-xl shadow-2xl p-0 w-64 border border-gray-200"
      >
        <div className="flex flex-col">
          <UserProfileHeader user={user} />

          <div className="flex flex-col p-1 gap-0.5">
            <UserProfileMenuItem
              icon="tabler:bell-ringing"
              iconColorClass="text-amber-500"
              label="Toast Notification Studio"
              to="/toast-studio"
              onClick={closePanel}
            />

            <UserProfileMenuItem
              icon="tabler:playlist"
              iconColorClass="text-cyan-400"
              label="Playlist Management Studio"
              to="/playlists"
              onClick={closePanel}
            />

            <UserProfileMenuItem
              icon="tabler:settings"
              iconColorClass="text-gray-400"
              label="Settings & Preferences"
              onClick={() => {
                closePanel();
                onOpenSettings();
              }}
            />

            <UserProfileMenuItem
              icon="tabler:database"
              iconColorClass="text-emerald-400"
              label="Storage Manager"
              onClick={() => {
                closePanel();
                onOpenStorageManager();
              }}
            />

            <UserProfileMenuItem
              icon="tabler:keyboard"
              iconColorClass="text-cyan-400"
              label="Keyboard Shortcuts"
              shortcutBadge="?"
              onClick={() => {
                closePanel();
                onOpenShortcutsHelp();
              }}
            />

            {user?.role === "admin" && (
              <UserProfileMenuItem
                icon="tabler:shield"
                iconColorClass="text-purple-400"
                label="Admin Dashboard"
                to="/admin"
                onClick={closePanel}
              />
            )}

            <div className="h-px bg-gray-200 dark:bg-gray-800 my-1" />

            <LogoutMenuItem
              onLogout={() => {
                closePanel();
                onLogout();
              }}
            />
          </div>
        </div>
      </OverlayPanel>
    );
  },
);

UserProfileMenu.displayName = "UserProfileMenu";

export default UserProfileMenu;
