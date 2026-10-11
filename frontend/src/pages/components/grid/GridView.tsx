import axios, { type AxiosRequestConfig } from "axios";
import fileDownload from "js-file-download";
import { ContextMenu } from "primereact/contextmenu";
import { Menu } from "primereact/menu";
import type { MenuItem } from "primereact/menuitem";
import { Toast } from "primereact/toast";
import { useEffect, useMemo, useRef, useState } from "react";
import useVideoStore from "src/context/videoStore";
import type { VideoT } from "src/schema";
import PlaylistBanner from "../PlaylistBanner";
import { SkeletonCard, VideoCard } from "./card";
import { GridEmptyState } from "./GridEmptyState";
import { GridFilterToolbar } from "./toolbar/GridFilterToolbar";
import { VideoDialogsContainer } from "./VideoDialogsContainer";

export function GridView() {
  const toast = useRef<Toast>(null);
  const videos = useVideoStore((state) => state.videos);
  const globalFilter = useVideoStore((state) => state.globalFilter);
  const removeVideo = useVideoStore((state) => state.removeVideo);
  const [loading, setLoading] = useState(
    () => Object.keys(videos).length === 0,
  );
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [activeVideo, setActiveVideo] = useState<VideoT | null>(null);
  const [playVideo, setPlayVideo] = useState<VideoT | null>(null);
  const [infoVideo, setInfoVideo] = useState<VideoT | null>(null);
  const [logVideo, setLogVideo] = useState<VideoT | null>(null);
  const [playlistVideo, setPlaylistVideo] = useState<VideoT | null>(null);
  const [copiedVideoId, setCopiedVideoId] = useState<string | null>(null);

  const menuRef = useRef<Menu>(null);
  const contextMenuRef = useRef<ContextMenu>(null);

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleDownload = (video: VideoT) => {
    const token = getAuthToken();
    const config: AxiosRequestConfig<object> = {
      method: "get",
      maxBodyLength: Infinity,
      url: `${API_BASE}/api/files/${video.id}_video.mp4`,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
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
      const token = getAuthToken();
      await axios.delete(`${API_BASE}/api/video/${video.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
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

  const playlists = useVideoStore((state) => state.playlists);
  const activePlaylistId = useVideoStore((state) => state.activePlaylistId);
  const toggleWatchLater = useVideoStore((state) => state.toggleWatchLater);

  const activePlaylist = useMemo(
    () => playlists.find((p) => p.id === activePlaylistId),
    [playlists, activePlaylistId],
  );

  const watchLaterPlaylist = useMemo(
    () => playlists.find((p) => p.is_default),
    [playlists],
  );

  const menuItems: MenuItem[] = [
    {
      label: "Play Video",
      icon: "pi pi-play",
      command: () => activeVideo && setPlayVideo(activeVideo),
    },
    {
      label: "Save to Playlist",
      icon: "pi pi-list",
      command: () => activeVideo && setPlaylistVideo(activeVideo),
    },
    {
      label:
        activeVideo && watchLaterPlaylist?.video_ids.includes(activeVideo.id)
          ? "Remove from Watch Later"
          : "Add to Watch Later",
      icon: "pi pi-clock",
      command: () => activeVideo && toggleWatchLater(activeVideo.id),
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
    if (activePlaylist && !activePlaylist.video_ids.includes(v.id)) {
      return false;
    }
    if (statusFilter !== "all") {
      if (statusFilter === "downloading") {
        if (
          ![
            "downloading",
            "queued",
            "generating_sprites",
            "packing_bundle",
          ].includes(v.downloadStatus)
        ) {
          return false;
        }
      } else if (v.downloadStatus !== statusFilter) {
        return false;
      }
    }
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

  return (
    <div className="w-full grow">
      <Toast ref={toast} />

      <ContextMenu model={menuItems} ref={contextMenuRef} />
      <Menu model={menuItems} popup ref={menuRef} />

      <VideoDialogsContainer
        playVideo={playVideo}
        setPlayVideo={setPlayVideo}
        infoVideo={infoVideo}
        setInfoVideo={setInfoVideo}
        logVideo={logVideo}
        setLogVideo={setLogVideo}
        playlistVideo={playlistVideo}
        setPlaylistVideo={setPlaylistVideo}
      />

      <PlaylistBanner onPlayFirstVideo={(video: VideoT) => setPlayVideo(video)} />

      <GridFilterToolbar
        statusFilter={statusFilter}
        onSelectStatusFilter={setStatusFilter}
      />

      {videosList.length === 0 ? (
        <GridEmptyState
          globalFilter={globalFilter}
          statusFilter={statusFilter}
        />
      ) : (
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
      )}
    </div>
  );
}

export default GridView;
