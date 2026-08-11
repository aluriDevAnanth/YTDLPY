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

export default function TableRowOptionMenu(rowData: VideoT): ReactNode {
  const toast = useRef<Toast>(null);
  const [visible, setVisible] = useState(false);
  const [info, setInfo] = useState(false);
  const removeVideo = useVideoStore((state) => state.removeVideo);

  function downloadVideo() {
    const config: AxiosRequestConfig<object> = {
      method: "get",
      maxBodyLength: Infinity,
      url: `http://localhost:8000/api/files/${rowData.videoPathId}`,
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

  async function deleteVideo() {
    const config: AxiosRequestConfig = {
      method: "delete",
      maxBodyLength: Infinity,
      url: `http://localhost:8000/api/video/${rowData.id}`,
      headers: {},
    };
    await axios
      .request(config)
      .then(() => {
        removeVideo(rowData.id);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  return (
    <div className="relative group inline-flex items-center gap-1">
      <Toast ref={toast} />
      {info && (
        <Dialog
          header={`Info: ${rowData.fullTitle || rowData.id}`}
          visible={info}
          style={{ width: "95vw", maxWidth: "800px" }}
          onHide={() => setInfo(false)}
          dismissableMask
        >
          <div className="overflow-x-auto max-h-[70vh]">
            <ReactJson
              src={rowData}
              theme={"ocean"}
              iconStyle="circle"
              collapseStringsAfterLength={100}
            />
          </div>
        </Dialog>
      )}

      {visible && (
        <VideoDialog
          visible={visible}
          setVisible={setVisible}
          rowData={rowData}
        />
      )}

      <Button
        onClick={() => setVisible(true)}
        className="px-1.5 py-1 p-button-sm"
        tooltip="Play Video"
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
          severity="success"
          className="px-1.5 py-1 p-button-sm"
          tooltip="Download"
          tooltipOptions={{ position: "top" }}
        >
          <Icon icon="tabler:download" className="text-lg" />
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
    </div>
  );
}
