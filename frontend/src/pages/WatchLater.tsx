import { useEffect } from "react";
import useVideoStore from "../context/videoStore";
import { useAuthStore } from "../context/authStore";
import GridView from "./components/GridView";
import TableView from "./components/TableView";

export default function WatchLater() {
  const { viewMode } = useAuthStore();
  const playlists = useVideoStore((state) => state.playlists);
  const activePlaylistId = useVideoStore((state) => state.activePlaylistId);
  const setActivePlaylistId = useVideoStore((state) => state.setActivePlaylistId);

  useEffect(() => {
    const defaultPl = playlists.find((p) => p.is_default);
    if (defaultPl && activePlaylistId !== defaultPl.id) {
      setActivePlaylistId(defaultPl.id);
    }
  }, [playlists, activePlaylistId, setActivePlaylistId]);

  return viewMode === "grid" ? <GridView /> : <TableView />;
}
