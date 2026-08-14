import { Icon } from "@iconify/react/dist/iconify.js";
import { FilterMatchMode } from "primereact/api";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { Tooltip } from "primereact/tooltip";
import {
  createContext,
  type JSX,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import PlaylistBanner from "./PlaylistBanner";

import useVideoStore from "src/context/videoStore";
import { type VideoT } from "src/schema";
import { getAuthToken } from "src/store/useAppStore";
import ProgressBarOrID from "./ProgressBarOrID";
import TableRowOptionMenu from "./TableRowOptionMenu";
import VideoDialog from "./VideoDialog";
import YoutubeGridView from "./GridView";

const HoverContext = createContext<{
  setHoveredThumbnail: (
    state: {
      url: string;
      x: number;
      y: number;
    } | null,
  ) => void;
} | null>(null);

const ThumbnailPreview = memo(
  ({
    hoveredThumbnail,
  }: {
    hoveredThumbnail: {
      url: string;
      x: number;
      y: number;
    };
  }) => {
    const windowWidth = typeof window !== "undefined" ? window.innerWidth : 1024;
    const previewWidth = Math.min(0.8 * windowWidth, 720);
    const { url, x } = hoveredThumbnail;
    const adjustedX =
      x + previewWidth > windowWidth
        ? Math.max(10, windowWidth - previewWidth - 100)
        : Math.max(10, x);

    return (
      <div
        className="z-50 fixed pointer-events-none shadow-xl rounded-md top-1/10 bg-black/80 p-1 border border-gray-700 max-w-[90vw]"
        style={{
          left: `${adjustedX}px`,
          width: `${previewWidth}px`,
          height: "auto",
        }}
      >
        <img
          src={url}
          alt="Video thumbnail"
          className="w-full h-auto object-contain rounded"
        />
      </div>
    );
  },
);

const BooleanTemplate = memo(
  ({ rowData, field }: { rowData: VideoT; field: keyof VideoT }) => {
    const value =
      field == "downloaded"
        ? rowData["downloadStatus"] == "completed"
        : rowData[field];
    return (
      <Tag
        pt={{ value: { style: { lineHeight: "1" } } }}
        data-pr-tooltip={value ? "" : "Not " + field}
        data-pr-position="top"
        value={field[0].toUpperCase()}
        severity={value ? "success" : "danger"}
        className="text-black text-[9px] sm:text-[10px] font-mono tracking-wider px-1 py-0.5"
      />
    );
  },
);

const TagsCell = memo(
  ({
    rowData,
    onTagDoubleClick,
  }: {
    rowData: VideoT;
    onTagDoubleClick: (video: VideoT) => void;
  }) => {
    const hoverCtx = useContext(HoverContext);
    const handleMouseEnter = (event: React.MouseEvent) => {
      if (!hoverCtx) return;
      const rect = event.currentTarget.getBoundingClientRect();
      hoverCtx.setHoveredThumbnail({
        url: `${import.meta.env.VITE_FILE_BASE_URL || "http://localhost:8000/api/files/"}${rowData.id}_thumbnail?token=${getAuthToken() || ""}`,
        x: rect.right + 60,
        y: rect.top,
      });
    };
    const handleMouseLeave = () => {
      if (hoverCtx) hoverCtx.setHoveredThumbnail(null);
    };
    return (
      <div
        className="flex gap-2 cursor-pointer select-none"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onDoubleClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onTagDoubleClick(rowData);
        }}
      >
        <BooleanTemplate rowData={rowData} field="watched" />
        <BooleanTemplate rowData={rowData} field="downloaded" />
      </div>
    );
  },
);

const UrlBody = memo(({ rowData }: { rowData: VideoT }) => {
  return (
    <div className="flex items-center gap-1">
      <Button
        onClick={(e) => {
          e.preventDefault();
          window.open(rowData.url, "_blank");
        }}
        className="p-1 p-button-sm shrink-0"
        severity="info"
        tooltip="Open Link"
        tooltipOptions={{ position: "top" }}
      >
        <Icon icon="tabler:external-link" className="text-base" />
      </Button>
      <CopyUrlButton rowData={rowData} />
    </div>
  );
});

function PreviewPortalContainer() {
  const context = useContext(HoverContext);
  const [previewState, setPreviewState] = useState<{
    url: string;
    x: number;
    y: number;
  } | null>(null);
  useEffect(() => {
    if (context) {
      (context as any)._registerSetter(setPreviewState);
    }
  }, [context]);
  if (!previewState) return null;
  return <ThumbnailPreview hoveredThumbnail={previewState} />;
}

function TableGrid({
  onTagDoubleClick,
}: {
  onTagDoubleClick: (video: VideoT) => void;
}) {
  const videos = useVideoStore((state) => state.videos);
  const playlists = useVideoStore((state) => state.playlists);
  const activePlaylistId = useVideoStore((state) => state.activePlaylistId);
  const globalFilter = useVideoStore((state) => state.globalFilter);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, []);

  const activePlaylist = useMemo(
    () => playlists.find((p) => p.id === activePlaylistId),
    [playlists, activePlaylistId],
  );

  const videosData = useMemo(() => {
    let list = Object.values(videos).filter(Boolean);
    if (activePlaylist) {
      list = list.filter((v) => activePlaylist.video_ids.includes(v.id));
    }
    return list;
  }, [videos, activePlaylist]);
  const renderTextInputFilter = useCallback((placeholder: string) => {
    return (options: any) => (
      <InputText
        value={options.value || ""}
        onChange={(e) => options.filterApplyCallback(e.target.value)}
        placeholder={placeholder}
        className="p-inputtext-sm py-0.5 px-1.5 text-xs w-full"
      />
    );
  }, []);
  return (
    <div className="w-full">
      <PlaylistBanner />
      <DataTable
        value={videosData}
        loading={loading}
      size="small"
      showGridlines
      stripedRows
      resizableColumns
      reorderableColumns
      paginator
      rows={10}
      rowsPerPageOptions={[5, 10, 20]}
      globalFilter={globalFilter}
      removableSort
      sortMode="multiple"
      filterDisplay="row"
      scrollable
      emptyMessage="No Videos, add using above form"
      pt={{
        root: { className: "text-xs rounded-lg w-full overflow-x-auto" },
      }}
    >
      <Column
        field="url"
        header="URL"
        body={(rowData: VideoT) => <UrlBody rowData={rowData} />}
      />
      <Column
        header="Op"
        body={(rowData) => TableRowOptionMenu(rowData)}
        pt={{ bodyCell: { className: "p-1.5 sm:p-2 overflow-visible" } }}
      />
      <Column
        header="Status / ID"
        style={{ width: "200px", minWidth: "170px", maxWidth: "210px" }}
        body={(rowData) => <ProgressBarOrID rowData={rowData} />}
      />
      <Column
        field="fullTitle"
        header="Name"
        sortable
        filter
        filterPlaceholder="Search by name"
        showFilterMenu={false}
        filterMatchMode={FilterMatchMode.CONTAINS}
        filterElement={renderTextInputFilter("Search by name")}
      />
      <Column
        field="size"
        header="Size"
        sortable
        showFilterMenu={false}
        filter
        filterMatchMode={FilterMatchMode.CONTAINS}
        filterElement={renderTextInputFilter("e.g. 20MiB")}
      />
      <Column
        field="resolution"
        header="Resolution"
        sortable
        filter
        filterPlaceholder="e.g. 720p"
        showFilterMenu={false}
        filterMatchMode={FilterMatchMode.CONTAINS}
        filterElement={renderTextInputFilter("e.g. 720")}
      />
      <Column
        header="Tags"
        body={(rowData) => (
          <TagsCell rowData={rowData} onTagDoubleClick={onTagDoubleClick} />
        )}
      />
    </DataTable>
    </div>
  );
}

function CopyUrlButton({ rowData }: { rowData: VideoT }): JSX.Element {
  const [copied, setCopied] = useState<boolean>(false);
  const handleCopy = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ): Promise<void> => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(rowData.url);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 1000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };
  return (
    <Button
      onClick={handleCopy}
      className="p-1 p-button-sm shrink-0"
      tooltip={copied ? "Copied!" : "Copy URL"}
      tooltipOptions={{ position: "top" }}
    >
      <Icon
        icon={copied ? "tabler:check" : "tabler:copy"}
        className={`text-base ${copied ? "text-emerald-400" : ""}`}
      />
    </Button>
  );
}

function TableView() {
  const [visible, setVisible] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoT>();
  const [contextValue] = useState(() => {
    let registerSetter: (
      s: {
        url: string;
        x: number;
        y: number;
      } | null,
    ) => void = () => { };
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
