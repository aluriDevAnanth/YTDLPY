import { Tooltip } from "primereact/tooltip";
import { useCallback, useState } from "react";
import useVideoStore from "src/context/videoStore";
import type { VideoT } from "src/schema";
import VideoDialog from "./VideoDialog";
import YoutubeGridView from "./GridView";
import {
  HoverContext,
  PreviewPortalContainer,
  TableGrid,
} from "./table";

export function TableView() {
  const [visible, setVisible] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoT>();
  const [contextValue] = useState(() => {
    let registerSetter: (
      s: {
        url: string;
        x: number;
        y: number;
      } | null,
    ) => void = () => {};
    return {
      setHoveredThumbnail: (
        state: {
          url: string;
          x: number;
          y: number;
        } | null,
      ) => registerSetter(state),
      _registerSetter: (setter: any) => {
        registerSetter = setter;
      },
    };
  });

  const handleTagDoubleClick = useCallback((video: VideoT) => {
    setSelectedVideo(video);
    setVisible(true);
  }, []);

  const viewMode = useVideoStore((state) => state.viewMode);

  return (
    <HoverContext.Provider value={contextValue}>
      <div className="relative py-2">
        <Tooltip target=".qqq" mouseTrack mouseTrackLeft={10} />
        {selectedVideo && (
          <VideoDialog
            visible={visible}
            setVisible={setVisible}
            rowData={selectedVideo}
          />
        )}
        <PreviewPortalContainer />
        {viewMode === "grid" ? (
          <YoutubeGridView />
        ) : (
          <TableGrid onTagDoubleClick={handleTagDoubleClick} />
        )}
      </div>
    </HoverContext.Provider>
  );
}

export default TableView;

