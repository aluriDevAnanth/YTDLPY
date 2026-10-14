import { Icon } from "@iconify/react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import React from "react";
import { pt } from "src/pt";

export interface CreatePlaylistDialogProps {
  visible: boolean;
  onHide: () => void;
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (desc: string) => void;
  loading: boolean;
  onSubmit: () => void;
}

export const CreatePlaylistDialog: React.FC<CreatePlaylistDialogProps> = ({
  visible,
  onHide,
  name,
  setName,
  description,
  setDescription,
  loading,
  onSubmit,
}) => {
  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      pt={{
        ...pt.dialog,
        root: { className: "" },
      }}
      header="Create Playlist"
      className="h-[30vh] w-[75vw]"
    >
      <div className="flex flex-1 flex-col pt-5 gap-3 bg-transparent rounded-2xl shadow-sm mb-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FloatLabel>
            <InputText
              value={name}
              id="playlisttitle"
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs sm:text-sm bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-800 focus:border-cyan-500 rounded-xl"
            />
            <label htmlFor="playlisttitle">Playlist Title</label>
          </FloatLabel>
          <FloatLabel>
            <InputText
              value={description}
              id="playlistdesc"
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs sm:text-sm bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-800 focus:border-cyan-500 rounded-xl"
            />
            <label htmlFor="playlistdesc">Playlist Description</label>
          </FloatLabel>
        </div>
      </div>
      <div className="flex shrink-0 justify-end my-2">
        <Button
          label="Create Playlist"
          severity="success"
          size="small"
          onClick={onSubmit}
          disabled={!name.trim() || loading}
          icon={<Icon icon="tabler:plus" className="mr-1 text-base" />}
          className="self-end text-xs font-bold px-5 py-2"
        />
      </div>
    </Dialog>
  );
};

export default CreatePlaylistDialog;
