import { Icon } from "@iconify/react/dist/iconify.js";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Menubar } from "primereact/menubar";
import { Tag } from "primereact/tag";
import { useState } from "react";
import { useAuthStore } from "src/context/authStore";
import useVideoStore from "src/context/videoStore";
import AdminDialog from "./AdminDialog";
import DownloadForm from "./DownloadForm";
import SettingsDialog from "./SettingsDialog";
import ThemeSwitcher from "./ThemeSwitcher";
interface HeaderProps {
  onRestart: () => void;
  isRestarting: boolean;
}
function Header({ onRestart, isRestarting }: HeaderProps) {
  const [visible, setVisible] = useState(false);
  const globalFilter = useVideoStore((state) => state.globalFilter);
  const { user, logout, setAdminOpen, setSettingsOpen } = useAuthStore();
  return (
    <>
      <SettingsDialog />
      <AdminDialog />
      <Dialog
        header="Header"
        visible={visible}
        style={{ width: "80vw" }}
        onHide={() => {
          if (!visible) return;
          setVisible(false);
        }}
        dismissableMask
        showHeader={false}
        pt={{ content: { className: "px-3 py-3" } }}
        position="top"
      >
        <div>
          <DownloadForm />
        </div>
      </Dialog>
      <Menubar
        pt={{
          end: { className: "ml-0" },
          start: { className: "flex-none" },
          menu: { className: "px-auto px-3 mx-auto flex" },
          action: { className: "px-3 " },
        }}
        start={
          <div className="flex gap-3 items-center">
            <div className="font-bold text-lg text-white flex items-center gap-2">
              <span>YTDLP-PY-GUI</span>
              {user?.role === "admin" && (
                <Tag
                  value="ADMIN DASHBOARD"
                  severity="danger"
                  className="text-white text-[10px] font-mono tracking-wider ml-1"
                />
              )}
            </div>
            {user?.role !== "admin" && (
              <>
                <div>
                  <InputText
                    value={globalFilter}
                    onChange={(e) =>
                      useVideoStore.setState(() => ({
                        globalFilter: e.target.value,
                      }))
                    }
                    placeholder="Search videos..."
                    className="w-full p-inputtext-sm"
                  />
                </div>
                <div>
                  <Button
                    onClick={() => setVisible(true)}
                    className="py-[2px] px-[2px]"
                    severity="success"
                    aria-label="Add Download"
                    tooltip="Add Video Download"
                  >
                    <Icon icon="tabler:plus" className="text-[28px]" />
                  </Button>
                </div>
              </>
            )}
          </div>
        }
        end={
          <div className="flex items-center gap-2">
            {user && (
              <div className="flex items-center gap-2 p-[6.5px] border-1 rounded-[6px] ">
                <Icon icon="tabler:user" className="text-[16px]" />
                {user.role !== "admin" && (
                  <span className="font-medium">{user.username}</span>
                )}
                <Tag
                  value={user.role.toUpperCase()}
                  severity={user.role === "admin" ? "danger" : "info"}
                  className="text-[10px] py-[1px] px-1"
                />
              </div>
            )}
            {user?.role === "admin" && (
              <Button
                onClick={() => setAdminOpen(true)}
                className="py-[4px] px-[4px]"
                severity="help"
                outlined
                tooltip="Admin User Management"
                tooltipOptions={{ position: "bottom" }}
              >
                <Icon icon="tabler:shield" className="text-[22px]" />
              </Button>
            )}
            <Button
              onClick={() => setSettingsOpen(true)}
              className="py-[4px] px-[4px]"
              severity="secondary"
              outlined
              tooltip="User Preferences & Settings"
              tooltipOptions={{ position: "bottom" }}
            >
              <Icon icon="tabler:settings" className="text-[22px]" />
            </Button>
            {}
            <Button
              onClick={onRestart}
              disabled={isRestarting}
              className="py-[4px] px-[4px]"
              severity="danger"
              outlined
              tooltip="Restart Backend Server"
              tooltipOptions={{ position: "bottom" }}
            >
              <Icon icon="tabler:refresh" className="text-[22px]" />
            </Button>
            <ThemeSwitcher />
            <Button
              onClick={logout}
              className="py-[4px] px-[4px]"
              severity="warning"
              outlined
              tooltip="Logout"
              tooltipOptions={{ position: "bottom" }}
            >
              <Icon icon="tabler:logout" className="text-[22px]" />
            </Button>
          </div>
        }
        className="rounded-lg border-b shadow-sm px-3 py-2"
      />
    </>
  );
}
export default Header;
