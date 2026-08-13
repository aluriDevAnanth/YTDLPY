import { Icon } from "@iconify/react/dist/iconify.js";
import axios, { type AxiosRequestConfig } from "axios";
import fileDownload from "js-file-download";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { type ReactNode, useRef, useState } from "react";
import ReactJson from "react-json-view";
import useVideoStore from "src/context/videoStore";
import { type VideoT } from "src/schema";
import VideoDialog from "./VideoDialog";
import LogViewerDialog from "./LogViewerDialog";

export default function TableRowOptionMenu(rowData: VideoT): ReactNode {
  const toast = useRef<Toast>(null);
  const [visible, setVisible] = useState(false);
  const [info, setInfo] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const removeVideo = useVideoStore((state) => state.removeVideo);

  function downloadVideo() {
    const config: AxiosRequestConfig<object> = {
      method: "get",
      maxBodyLength: Infinity,
      url: `http://localhost:8000/api/files/${rowData.id}_video`,
      headers: {},
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
      await axios.delete(`http://localhost:8000/api/video/${rowData.id}`);
      removeVideo(rowData.id);
    } catch (error) {
      console.error(error);
    }
  };

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

      {/* Disable play & download options if download is not completed */}
      {(() => {
        const isCompleted = rowData.downloadStatus === "completed";
        return (
          <>
            <Button
              onClick={() => isCompleted && setVisible(true)}
              disabled={!isCompleted}
              className="px-1.5 py-1 p-button-sm"
              tooltip={isCompleted ? "Play Video" : "Unavailable while downloading"}
              tooltipOptions={{ position: "top" }}
            >
              <Icon icon="tabler:play" className="text-lg" />
            </Button>

            {/* Action buttons: inline on small screens, slide out on hover on desktop */}
            <div
              className="flex items-center gap-1 md:absolute md:left-full md:top-0 md:ml-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                onClick={downloadVideo}
                disabled={!isCompleted}
                severity="success"
                className="px-1.5 py-1 p-button-sm"
                tooltip={isCompleted ? "Download File" : "Unavailable while downloading"}
                tooltipOptions={{ position: "top" }}
              >
                <Icon icon="tabler:download" className="text-lg" />
              </Button>
              <Button
                onClick={() => setShowLogs(true)}
                severity="help"
                className="px-1.5 py-1 p-button-sm"
                tooltip="View Execution Logs"
                tooltipOptions={{ position: "top" }}
              >
                <Icon icon="tabler:terminal-2" className="text-lg" />
              </Button>
              <Button
                onClick={() => setInfo(true)}
                severity="warning"
                className="px-1.5 py-1 p-button-sm"
                tooltip="Info"
                tooltipOptions={{ position: "top" }}
              >
                <Icon icon="tabler:info-circle" className="text-lg" />
              </Button>
              <Button
                onClick={deleteVideo}
                severity="danger"
                className="px-1.5 py-1 p-button-sm"
                tooltip="Delete"
                tooltipOptions={{ position: "top" }}
              >
                <Icon icon="tabler:trash" className="text-lg" />
              </Button>
            </div>
          </>
        );
      })()}
    </div>
  );
}
