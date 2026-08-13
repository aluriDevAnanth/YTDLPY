import { Icon } from "@iconify/react";
import axios, { type AxiosRequestConfig } from "axios";
import fileDownload from "js-file-download";
import { Button } from "primereact/button";
import { ContextMenu } from "primereact/contextmenu";
import { Dialog } from "primereact/dialog";
import { Menu } from "primereact/menu";
import type { MenuItem } from "primereact/menuitem";
import { Toast } from "primereact/toast";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import ReactJson from "react-json-view";
import useVideoStore from "src/context/videoStore";
import type { VideoT } from "src/schema";
import { getAuthToken } from "src/store/useAppStore";
import LogViewerDialog from "./LogViewerDialog";
import VideoDialog from "./VideoDialog";

const API_BASE = import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";

const SkeletonCard = memo(() => (
  <div className="flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800/80 rounded-xl overflow-hidden shadow-xs hover:shadow-sm animate-pulse">
    {/* 16:9 Thumbnail Skeleton Box with Vibrant Gradient Shimmer */}
    <div className="relative w-full aspect-video bg-gray-100 dark:bg-gray-800/90 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700/80 dark:to-gray-800 animate-pulse" />
      <Icon icon="tabler:video" className="relative z-10 text-3xl text-gray-400 dark:text-gray-500/80 animate-pulse" />
    </div>

    {/* Details Skeleton Lines */}
    <div className="flex flex-col p-2.5 gap-2">
      <div className="h-3.5 w-4/5 bg-gray-300 dark:bg-gray-700/80 rounded-xs animate-pulse" />
      <div className="flex items-center justify-between pt-1">
        <div className="h-2.5 w-1/3 bg-gray-200 dark:bg-gray-700/60 rounded-xs animate-pulse" />
        <div className="h-3 w-8 bg-gray-200 dark:bg-gray-700/70 rounded-xs animate-pulse" />
      </div>
    </div>
  </div>
));

const VideoCard = memo(
  ({
    video,
    onOpenContextMenu,
    onOpenMenuButton,
    onCopyUrl,
    copiedVideoId,
  }: {
    video: VideoT;
    onOpenContextMenu: (e: React.MouseEvent, video: VideoT) => void;
    onOpenMenuButton: (e: React.MouseEvent, video: VideoT) => void;
    onCopyUrl: (e: React.MouseEvent, video: VideoT) => void;
    copiedVideoId: string | null;
  }) => {
    const [playVisible, setPlayVisible] = useState(false);
    const [imgError, setImgError] = useState(false);
    const upsertVideo = useVideoStore((state) => state.upsertVideo);
    const videoProgress = useVideoStore((state) => state.videoProgress);

    const rawProgress = useMemo(
      () => videoProgress[video.id],
      [videoProgress, video.id],
    );

    const displayPercent = useMemo(() => {
      if (video.downloadStatus === "generating_sprites") {
        if (rawProgress?.speed === "FFmpeg") {
          const val = rawProgress?.percent?.toString().replace("%", "");
          return val ? parseFloat(val) : 0;
        }
        return 0;
      }
      const val = rawProgress?.percent?.toString().replace("%", "");
      return val ? parseFloat(val) : 0;
    }, [rawProgress, video.downloadStatus]);

    useEffect(() => {
      if (
        displayPercent === 100 &&
        video.downloadStatus !== "completed" &&
        video.downloadStatus !== "generating_sprites"
      ) {
        axios
          .get<VideoT>(`${API_BASE}/api/video/${video.id}`)
          .then((response) => upsertVideo(response.data))
          .catch(console.error);
      }
    }, [displayPercent, video.id, video.downloadStatus, upsertVideo]);

    const fileBaseUrl =
      import.meta.env.VITE_FILE_BASE_URL || "http://localhost:8000/api/files/";
    const token = getAuthToken() || "";
    const thumbnailUrl = `${fileBaseUrl}${video.id}_thumbnail?token=${token}`;

    const isCompleted =
      video.downloadStatus === "completed" && thumbnailUrl && !imgError;
    const isCopied = copiedVideoId === video.id;

    return (
      <div
        onContextMenu={(e) => onOpenContextMenu(e, video)}
        className="group flex flex-col bg-white dark:bg-gray-900/70 hover:bg-slate-50 dark:hover:bg-transparent border border-gray-200 dark:border-gray-800/80 hover:border-gray-300 dark:hover:border-gray-700 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200"
      >
        {/* Video Dialog */}
        {playVisible && (
          <VideoDialog
            visible={playVisible}
            setVisible={setPlayVisible}
            rowData={video}
          />
        )}

        {/* Thumbnail or Download Progress Container */}
        <div
          className="relative w-full aspect-video bg-gray-100 dark:bg-gray-950 overflow-hidden cursor-pointer select-none"
          onClick={() => isCompleted && setPlayVisible(true)}
        >
          {isCompleted ? (
            <>
              <img
                src={thumbnailUrl}
                alt={video.fullTitle || "Video Thumbnail"}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {/* Play Overlay Button */}
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="size-9 rounded-full bg-cyan-500/90 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                  <Icon icon="tabler:play" className="text-lg ml-0.5" />
                </div>
              </div>
            </>
          ) : (
            /* Thumbnail Progress Overlay with YTDLnis Card-Wide Fill & Shimmer */
            <div className="relative w-full h-full p-2 flex flex-col justify-between bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 border-b border-gray-200 dark:border-gray-800/60 overflow-hidden">
              {/* Pulsing Skeleton Shimmer Layer */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/30 via-cyan-500/20 to-cyan-900/30 animate-pulse pointer-events-none z-0" />

              {/* YTDLnis-style card-wide progress fill overlay */}
              <div
                className="absolute inset-y-0 left-0 bg-cyan-500/25 border-r border-cyan-400/50 transition-all duration-300 pointer-events-none z-0"
                style={{ width: `${Math.max(displayPercent, 0)}%` }}
              />

              <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-cyan-600 dark:text-cyan-400">
                <span className="flex items-center gap-1.5 font-medium">
                  <Icon
                    icon={
                      video.downloadStatus === "generating_sprites"
                        ? "tabler:movie"
                        : "tabler:download"
                    }
                    className="text-cyan-600 dark:text-cyan-400 animate-pulse text-sm"
                  />
                  {video.downloadStatus === "generating_sprites"
                    ? "Generating Sprites..."
                    : video.downloadStatus === "queued"
                      ? "Queued..."
                      : "Downloading..."}
                </span>
                <span className="font-bold text-xs text-gray-900 dark:text-white">
                  {displayPercent > 0 ? `${displayPercent.toFixed(1)}%` : "0.0%"}
                </span>
              </div>

              <div>
                <div className="relative z-10 flex items-center justify-between text-[12px] font-mono">
                  <span>⚡ {rawProgress?.speed || "0 B/s"}</span>
                </div>
                <div className="relative z-10 flex items-center justify-between text-[12px] font-mono">
                  <span>⏱️ {rawProgress?.eta || "Calculating..."}</span>
                </div>
              </div>
            </div>
          )}

          {/* Top Badges (Status & Watched) */}
          <div className="absolute top-1.5 left-1.5 flex items-center gap-1 z-10 pointer-events-none">
            {video.watched && (
              <Icon icon="tabler:eye" fontSize={24}
                className="text-cyan-400 drop-shadow-md p-1 bg-black/50 rounded-lg"
              />
            )}
          </div>

          {/* Repositioned Resolution & Duration Badges */}
          <div className="absolute right-1.5 flex items-center gap-1 z-10 pointer-events-none bottom-1.5">
            {video.resolution && (
              <span className="bg-black/80 backdrop-blur-xs text-cyan-300 text-[10px] font-mono font-medium px-1 py-0.5 rounded shadow-xs">
                {video.resolution}
              </span>
            )}
            {video.durationString && (
              <span className="bg-black/85 backdrop-blur-xs text-white text-[10px] font-mono font-medium px-1 py-0.5 rounded shadow-xs">
                {video.durationString}
              </span>
            )}
          </div>
        </div>

        {/* Compact Card Body */}
        <div className="flex flex-col px-2.5 py-2 gap-1.5 grow justify-between bg-white dark:bg-transparent">
          <div className="flex flex-col gap-0.5">
            <span
              onClick={() => isCompleted && setPlayVisible(true)}
              className="text-xs font-semibold text-gray-900 dark:text-gray-100 line-clamp-1 hover:text-cyan-600 dark:hover:text-cyan-400 cursor-pointer transition-colors leading-tight"
              title={video.fullTitle || video.url}
            >
              {video.fullTitle || video.url}
            </span>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-[10px] text-gray-600 dark:text-gray-400 font-mono">
                {video.size && <span className="truncate">📦 {video.size}</span>}
                {video.format && (
                  <span className="uppercase text-gray-500 dark:text-gray-500">• {video.format}</span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <Icon
                  onClick={(e) => onCopyUrl(e, video)}
                  icon={isCopied ? "tabler:check" : "tabler:copy"}
                  className={`text-sm ${isCopied ? "text-emerald-600 dark:text-emerald-400" : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"} transition-colors cursor-pointer`}
                />
                <Button
                  type="button"
                  rounded
                  text
                  severity="secondary"
                  onClick={(e) => onOpenMenuButton(e, video)}
                  className="!p-[1px] text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  title="Options Menu"
                >
                  <Icon icon="tabler:dots-vertical" className="text-sm" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

export default function YoutubeGridView() {
  const toast = useRef<Toast>(null);
  const token = useVideoStore((state) => state.token);
  const videos = useVideoStore((state) => state.videos);
  const globalFilter = useVideoStore((state) => state.globalFilter);
  const fetchVideos = useVideoStore((state) => state.fetchVideos);
  const removeVideo = useVideoStore((state) => state.removeVideo);
  const [loading, setLoading] = useState(() => Object.keys(videos).length === 0);

  const [activeVideo, setActiveVideo] = useState<VideoT | null>(null);
  const [playVideo, setPlayVideo] = useState<VideoT | null>(null);
  const [infoVideo, setInfoVideo] = useState<VideoT | null>(null);
  const [logVideo, setLogVideo] = useState<VideoT | null>(null);
  const [copiedVideoId, setCopiedVideoId] = useState<string | null>(null);

  const menuRef = useRef<Menu>(null);
  const contextMenuRef = useRef<ContextMenu>(null);

  useEffect(() => {
    if (token && Object.keys(videos).length === 0) {
      fetchVideos().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token, fetchVideos, videos]);

  const handleDownload = (video: VideoT) => {
    const config: AxiosRequestConfig<object> = {
      method: "get",
      maxBodyLength: Infinity,
      url: `http://localhost:8000/api/files/${video.id}_video`,
      responseType: "blob",
    };
    axios
      .request(config)
      .then((response) => {
        fileDownload(response.data, `${video.fullTitle || video.id}.mp4`);
      })
      .catch((error) => console.error("Download failed:", error));
  };

  const handleDelete = async (video: VideoT) => {
    try {
      await axios.delete(`http://localhost:8000/api/video/${video.id}`);
      removeVideo(video.id);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleCopyUrl = async (e: React.MouseEvent, video: VideoT) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(video.url);
      setCopiedVideoId(video.id);
      setTimeout(() => setCopiedVideoId(null), 1200);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  const menuItems: MenuItem[] = [
    {
      label: "Play Video",
      icon: "pi pi-play",
      command: () => activeVideo && setPlayVideo(activeVideo),
    },
    {
      label: "Download File",
      icon: "pi pi-download",
      command: () => activeVideo && handleDownload(activeVideo),
    },
    {
      label: "View Metadata Info",
      icon: "pi pi-info-circle",
      command: () => activeVideo && setInfoVideo(activeVideo),
    },
    {
      label: "View Execution Logs",
      icon: "pi pi-file",
      command: () => activeVideo && setLogVideo(activeVideo),
    },
    {
      label: "Copy Video Link",
      icon: "pi pi-link",
      command: () => {
        if (activeVideo) {
          navigator.clipboard.writeText(activeVideo.url);
          setCopiedVideoId(activeVideo.id);
          setTimeout(() => setCopiedVideoId(null), 1200);
        }
      },
    },
    {
      separator: true,
    },
    {
      label: "Delete Video",
      icon: "pi pi-trash",
      className: "text-red-400 font-medium",
      command: () => activeVideo && handleDelete(activeVideo),
    },
  ];

  const handleOpenContextMenu = (e: React.MouseEvent, video: VideoT) => {
    e.preventDefault();
    menuRef.current?.hide(e);
    setActiveVideo(video);
    contextMenuRef.current?.show(e);
  };

  const handleOpenMenuButton = (e: React.MouseEvent, video: VideoT) => {
    e.stopPropagation();
    contextMenuRef.current?.hide(e);
    setActiveVideo(video);
    menuRef.current?.toggle(e);
  };

  const videosList = Object.values(videos).filter((v) => {
    if (!v) return false;
    if (!globalFilter) return true;
    const q = globalFilter.toLowerCase();
    return (
      (v.fullTitle && v.fullTitle.toLowerCase().includes(q)) ||
      (v.url && v.url.toLowerCase().includes(q)) ||
      (v.id && v.id.toLowerCase().includes(q)) ||
      (v.resolution && v.resolution.toLowerCase().includes(q)) ||
      (v.size && v.size.toLowerCase().includes(q))
    );
  });

  if (loading) {
    return (
      <div className="w-full py-2 grow">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-3 w-full">
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (videosList.length === 0) {
    return (
      <div className="w-full py-12 flex flex-col items-center justify-center text-center text-gray-400 bg-gray-900/30 border border-gray-800 rounded-xl">
        <Icon icon="tabler:video-off" className="text-4xl text-gray-600 mb-2" />
        <p className="text-sm font-medium">No videos found</p>
        <p className="text-xs text-gray-500 mt-1">
          {globalFilter
            ? `No matches for "${globalFilter}"`
            : "Use the top header form to add video downloads"}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full grow">
      <Toast ref={toast} />

      {/* Shared Single Instance Menus */}
      <ContextMenu model={menuItems} ref={contextMenuRef} />
      <Menu model={menuItems} popup ref={menuRef} />

      {/* Global Dialogs */}
      {playVideo && (
        <VideoDialog
          visible={!!playVideo}
          setVisible={(vis) => !vis && setPlayVideo(null)}
          rowData={playVideo}
        />
      )}
      {infoVideo && (
        <Dialog
          header={`Info: ${infoVideo.fullTitle || infoVideo.id}`}
          visible={!!infoVideo}
          style={{ width: "95vw", maxWidth: "800px" }}
          onHide={() => setInfoVideo(null)}
          dismissableMask
        >
          <div className="overflow-x-auto max-h-[70vh]">
            <ReactJson
              src={infoVideo}
              theme={"ocean"}
              iconStyle="circle"
              collapseStringsAfterLength={100}
            />
          </div>
        </Dialog>
      )}

      {logVideo && (
        <LogViewerDialog
          visible={!!logVideo}
          setVisible={(val) => !val && setLogVideo(null)}
          video={logVideo}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-3 w-full">
        {videosList.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            onOpenContextMenu={handleOpenContextMenu}
            onOpenMenuButton={handleOpenMenuButton}
            onCopyUrl={handleCopyUrl}
            copiedVideoId={copiedVideoId}
          />
        ))}
      </div>
    </div>
  );
}
