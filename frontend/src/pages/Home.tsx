import { useEffect } from "react";
import useVideoStore from "../context/videoStore";
import { useAuthStore } from "../context/authStore";
import GridView from "./components/GridView";
import TableView from "./components/TableView";

export default function Home() {
  const { viewMode } = useAuthStore();
  const activePlaylistId = useVideoStore((state) => state.activePlaylistId);
  const setActivePlaylistId = useVideoStore((state) => state.setActivePlaylistId);

  useEffect(() => {
    if (activePlaylistId !== null) {
      setActivePlaylistId(null);
    }
  }, [activePlaylistId, setActivePlaylistId]);

  return viewMode === "grid" ? <GridView /> : <TableView />;
}
