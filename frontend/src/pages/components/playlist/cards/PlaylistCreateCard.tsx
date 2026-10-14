import { Icon } from "@iconify/react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import React from "react";

export interface PlaylistCreateCardProps {
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (desc: string) => void;
  loading: boolean;
  onCreate: () => void;
}

export const PlaylistCreateCard: React.FC<PlaylistCreateCardProps> = ({
  name,
  setName,
  description,
  setDescription,
  loading,
  onCreate,
}) => {
  return (
    <div className="flex flex-col gap-2.5 p-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xs">
      <div className="flex items-center justify-between">
        <span className="font-bold text-xs text-gray-800 dark:text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
          <Icon icon="tabler:plus" className="text-cyan-500 text-base" />
          <span>Create New Playlist</span>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <InputText
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Playlist Title (e.g. Favorites, Music)"
          className="w-full text-xs sm:text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
        />
        <InputText
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className="w-full text-xs sm:text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
        />
      </div>

      <Button
        label="Create Playlist"
        severity="success"
        size="small"
        onClick={onCreate}
        disabled={!name.trim() || loading}
        icon={<Icon icon="tabler:plus" className="mr-1 text-base" />}
        className="self-end mt-0.5 text-xs font-bold px-4 py-1.5 rounded-xl shadow-xs"
      />
    </div>
  );
};

export default PlaylistCreateCard;
