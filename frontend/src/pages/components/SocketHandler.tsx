import { Toast } from "primereact/toast";
import { useEffect } from "react";
import useAppStore, { type StartupSSE } from "src/store/useAppStore";
import { VideoS, type NotifyT, type VideoProgressT } from "src/schema";
import { socket } from "src/socket";
type Props = {
  toastRef: React.RefObject<Toast | null>;
};
export default function SocketHandler({ toastRef }: Props) {
  const upsertVideoProgress = useAppStore((s) => s.upsertVideoProgress);
  const upsertVideo = useAppStore((s) => s.upsertVideo);
  const removeVideo = useAppStore((s) => s.removeVideo);
  const setStartupSSE = useAppStore((s) => s.setStartupSSE);
  const token = useAppStore((s) => s.token);
  useEffect(() => {
    if (!token) {
      if (socket.connected) socket.disconnect();
      return;
    }
    socket.connect();
    socket.on("message", (data) => {
      const ddata = VideoS.safeParse(data);
      if (ddata.success) {
        upsertVideo(ddata.data);
      }
    });
    socket.on("status_update", (data: VideoProgressT) => {
      upsertVideoProgress(data);
    });
    socket.on("notify", (data: NotifyT) => {
      toastRef.current?.show({
        severity: data.severity as any,
        summary: data.summary ?? "Notification",
        detail: data.detail ?? JSON.stringify(data),
      });
    });
    socket.on("startupp", (data: StartupSSE) => {
      setStartupSSE({
        ...data,
        sseType: "startupp",
        dataID: "startupp",
      });
    });
    socket.on("remove_video", (id: string) => {
      const dVideo = useAppStore.getState().videos[id];
      toastRef.current?.show({
        severity: "error",
        summary: "Video Removed",
        detail: dVideo
          ? `Removing video with id ${dVideo.id} (${dVideo.fullTitle || dVideo.url})`
          : `Removed video ${id}`,
      });
      removeVideo(id);
    });
    socket.on("disconnect", () => {
      toastRef.current?.show({
        severity: "warn",
        summary: "Disconnected",
        detail: "Socket connection lost.",
        life: 3000,
      });
    });
    return () => {
      socket.disconnect();
      socket.off();
    };
  }, [token, toastRef, upsertVideo, upsertVideoProgress, removeVideo, setStartupSSE]);
  return null;
}
