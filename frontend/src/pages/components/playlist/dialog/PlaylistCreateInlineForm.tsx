import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import React from "react";

export interface PlaylistCreateInlineFormProps {
  newPlaylistName: string;
  setNewPlaylistName: (val: string) => void;
  loading: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}

export const PlaylistCreateInlineForm: React.FC<PlaylistCreateInlineFormProps> = ({
  newPlaylistName,
  setNewPlaylistName,
  loading,
  onCancel,
  onSubmit,
}) => {
  return (
    <div className="flex flex-col gap-2 pt-2 border-t border-gray-200 dark:border-gray-800">
      <InputText
        value={newPlaylistName}
        onChange={(e) => setNewPlaylistName(e.target.value)}
        placeholder="Playlist name..."
        className="w-full text-sm"
        autoFocus
        onKeyDown={(e) => e.key === "Enter" && onSubmit()}
      />
      <div className="flex justify-end gap-2">
        <Button
          label="Cancel"
          severity="secondary"
          text
          size="small"
          onClick={onCancel}
        />
        <Button
          label="Create & Add"
          severity="success"
          size="small"
          onClick={onSubmit}
          disabled={!newPlaylistName.trim() || loading}
        />
      </div>
    </div>
  );
};

export default PlaylistCreateInlineForm;
