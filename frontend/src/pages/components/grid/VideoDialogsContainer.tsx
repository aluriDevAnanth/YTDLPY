import { Dialog } from "primereact/dialog";
import { memo } from "react";
import ReactJson from "react-json-view";
import type { VideoT } from "src/schema";
import AddToPlaylistDialog from "../AddToPlaylistDialog";
import LogViewerDialog from "../LogViewerDialog";
import VideoDialog from "../VideoDialog";

interface VideoDialogsContainerProps {
  playVideo: VideoT | null;
  setPlayVideo: (video: VideoT | null) => void;
  infoVideo: VideoT | null;
  setInfoVideo: (video: VideoT | null) => void;
  logVideo: VideoT | null;
  setLogVideo: (video: VideoT | null) => void;
  playlistVideo: VideoT | null;
  setPlaylistVideo: (video: VideoT | null) => void;
}

export const VideoDialogsContainer = memo(
  ({
    playVideo,
    setPlayVideo,
    infoVideo,
    setInfoVideo,
    logVideo,
    setLogVideo,
    playlistVideo,
    setPlaylistVideo,
  }: VideoDialogsContainerProps) => {
    return (
      <>
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

        {playlistVideo && (
          <AddToPlaylistDialog
            video={playlistVideo}
            visible={!!playlistVideo}
            onHide={() => setPlaylistVideo(null)}
          />
        )}
      </>
    );
  },
);

VideoDialogsContainer.displayName = "VideoDialogsContainer";
