import { useEffect } from "react";
import { useParams } from "react-router";
import useVideoStore from "../context/videoStore";
import { useAuthStore } from "../context/authStore";
import GridView from "./components/GridView";
import TableView from "./components/TableView";

export default function PlaylistDetail() {
  const { viewMode } = useAuthStore();
  const { public_id } = useParams<{ public_id: string }>();

  const playlists = useVideoStore((state) => state.playlists);
  const activePlaylistId = useVideoStore((state) => state.activePlaylistId);
  const setActivePlaylistId = useVideoStore((state) => state.setActivePlaylistId);

  useEffect(() => {
    if (public_id) {
      const targetPl = playlists.find(
        (p) => p.public_id === public_id || p.id === public_id,
      );
      if (targetPl && activePlaylistId !== targetPl.id) {
        setActivePlaylistId(targetPl.id);
      }
    }
  }, [public_id, playlists, activePlaylistId, setActivePlaylistId]);

  return viewMode === "grid" ? <GridView /> : <TableView />;
}
