import { MediaPlayerInstance, useStore } from "@vidstack/react";
import axios from "axios";
import { Dialog } from "primereact/dialog";
import { type Dispatch, type SetStateAction, useEffect, useRef, useState } from "react";
import useVideoStore from "src/context/videoStore";
import type { VideoT } from "src/schema";
import { SpeedNotificationToast } from "./controls";
import { VidstackMediaPlayer } from "./VidstackMediaPlayer";

import { API_BASE, getAuthToken } from "src/store/useAppStore";

interface VideoDialogProps {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  rowData: VideoT;
}

export function VideoDialog({
  visible,
  setVisible,
  rowData,
}: VideoDialogProps) {
  const player = useRef<MediaPlayerInstance>(null);
  let localPrevWatchTime = rowData.prevWatchTime;
  const notificationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { playbackRate } = useStore(MediaPlayerInstance, player);
  const [speedIndex, setSpeedIndex] = useState(1.5);
  const [showSpeedChangeNotification, setShowSpeedChangeNotification] = useState(false);
  const upsertVideo = useVideoStore((state) => state.upsertVideo);

  function markAsWatched(): void {
    const data = { ...rowData };
    if (data.watched === true) return;
    data.watched = true;
    const token = getAuthToken();
    const config = {
      method: "put",
      maxBodyLength: Infinity,
      url: `${API_BASE}/api/video/${rowData.id}`,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      data: data,
    };
    axios
      .request(config)
      .then((response) => {
        upsertVideo(response.data);
      })
      .catch((error: unknown) => {
        console.error(error);
      });
  }

  const handleSpeedChange = (newSpeed: number) => {
    setSpeedIndex(newSpeed);
    if (player.current) {
      player.current.playbackRate = newSpeed;
    }
  };

  useEffect(() => {
    if (playbackRate !== undefined) {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
        notificationTimeoutRef.current = null;
      }
      setShowSpeedChangeNotification(true);
      notificationTimeoutRef.current = setTimeout(() => {
        setShowSpeedChangeNotification(false);
        notificationTimeoutRef.current = null;
      }, 1000);
    }
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
        notificationTimeoutRef.current = null;
      }
    };
  }, [playbackRate]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (localPrevWatchTime === Math.floor(player.current?.currentTime || 0)) {
        return;
      }
      const token = getAuthToken();
      const config = {
        method: "put",
        maxBodyLength: Infinity,
        url: `${API_BASE}/api/video/${rowData.id}`,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        data: {
          ...rowData,
          prevWatchTime: Math.floor(player.current?.currentTime || 0),
        },
      };
      axios
        .request(config)
        .then((response) => {
          localPrevWatchTime = response.data.prevWatchTime;
        })
        .catch((error: unknown) => {
          console.error(error);
        });
    }, 5000);

    return () => {
      clearInterval(interval);
      upsertVideo({
        ...useVideoStore.getState().videos[rowData.id],
        prevWatchTime: localPrevWatchTime,
      });
    };
  }, []);

  return (
    <Dialog
      position="top"
      closeOnEscape
      maximizable
      visible={visible}
      className="w-[95vw] sm:w-[85vw] lg:w-[70vw] max-w-6xl h-fit"
      showHeader={false}
      onHide={() => setVisible(false)}
      dismissableMask
      pt={{ content: { className: "p-1" } }}
    >
      <SpeedNotificationToast
        show={showSpeedChangeNotification}
        playbackRate={playbackRate}
      />
      <VidstackMediaPlayer
        ref={player}
        rowData={rowData}
        speedIndex={speedIndex}
        playbackRate={playbackRate}
        onPlay={markAsWatched}
        onSpeedChange={handleSpeedChange}
      />
    </Dialog>
  );
}

export default VideoDialog;
