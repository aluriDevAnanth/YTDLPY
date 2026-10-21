import axios, { type AxiosRequestConfig } from "axios";
import fileDownload from "js-file-download";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { type ReactNode, useRef, useState } from "react";
import ReactJson from "react-json-view";
import useVideoStore from "src/context/videoStore";
import { type VideoT } from "src/schema";
import { API_BASE, getAuthToken } from "src/store/useAppStore";
import AddToPlaylistDialog from "../AddToPlaylistDialog";
import LogViewerDialog from "../LogViewerDialog";
import VideoDialog from "../VideoDialog";
import { PlayRowButton, TableRowActionButtons } from "./actions";

export function TableRowOptionsMenu(rowData: VideoT): ReactNode {
  const toast = useRef<Toast>(null);
  const [visible, setVisible] = useState(false);
  const [info, setInfo] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const removeVideo = useVideoStore((state) => state.removeVideo);
  const pauseVideo = useVideoStore((state) => state.pauseVideo);
  const resumeVideo = useVideoStore((state) => state.resumeVideo);
  const retryVideo = useVideoStore((state) => state.retryVideo);

  function downloadVideo() {
    const token = getAuthToken();
    const config: AxiosRequestConfig<object> = {
      method: "get",
      maxBodyLength: Infinity,
      url: `${API_BASE}/api/files/${rowData.id}_video.mp4`,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      responseType: "blob",
    };
    axios
      .request(config)
      .then((response) => {
        fileDownload(response.data, `${rowData.fullTitle}.mp4`);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  const deleteVideo = async () => {
    try {
      const token = getAuthToken();
      await axios.delete(`${API_BASE}/api/video/${rowData.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      removeVideo(rowData.id);
    } catch (error) {
      console.error(error);
    }
  };

  const isCompleted = rowData.downloadStatus === "completed";

  return (
    <div className="flex items-center gap-1 relative group">
      <Toast ref={toast} />

      {/* Info Dialog */}
      {info && (
        <Dialog
          header="Video Info Data"
          visible={info}
          style={{ width: "80vw" }}
          onHide={() => {
            if (!info) return;
            setInfo(false);
          }}
        >
          <ReactJson src={rowData} theme={"monokai"} />
        </Dialog>
      )}

      {/* Video Dialog */}
      {visible && (
        <VideoDialog
          visible={visible}
          setVisible={setVisible}
          rowData={rowData}
        />
      )}

      {/* Log Viewer Dialog */}
      {showLogs && (
        <LogViewerDialog
          visible={showLogs}
          setVisible={setShowLogs}
          video={rowData}
        />
      )}

      <PlayRowButton
        isCompleted={isCompleted}
        onClick={() => setVisible(true)}
      />

      <TableRowActionButtons
        rowData={rowData}
        isCompleted={isCompleted}
        onDownload={downloadVideo}
        onShowLogs={() => setShowLogs(true)}
        onPause={() => pauseVideo(rowData.id)}
        onResume={() => resumeVideo(rowData.id)}
        onRetry={() => retryVideo(rowData.id)}
        onShowPlaylist={() => setShowPlaylist(true)}
        onShowInfo={() => setInfo(true)}
        onDelete={deleteVideo}
      />

      {showPlaylist && (
        <AddToPlaylistDialog
          video={rowData}
          visible={showPlaylist}
          onHide={() => setShowPlaylist(false)}
        />
      )}
    </div>
  );
}

export default TableRowOptionsMenu;
