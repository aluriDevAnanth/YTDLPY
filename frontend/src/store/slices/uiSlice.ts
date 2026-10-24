import type { StateCreator } from "zustand";
import type { AppState, UiSliceState } from "../types";

export const createUiSlice: StateCreator<
  AppState,
  [["zustand/immer", never], ["zustand/devtools", never], ["zustand/persist", unknown]],
  [],
  UiSliceState
> = (set) => ({
  activePage: "downloads",
  isAdminOpen: false,
  isSettingsOpen: false,
  isStorageManagerOpen: false,
  isAddDownloadOpen: false,
  isShortcutsHelpOpen: false,
  globalFilter: "",
  viewMode: "grid",
  startupp: null,

  setActivePage: (page) =>
    set((state) => {
      state.activePage = page;
    }),

  setAdminOpen: (open) =>
    set((state) => {
      state.isAdminOpen = open;
    }),

  setSettingsOpen: (open) =>
    set((state) => {
      state.isSettingsOpen = open;
    }),

  setStorageManagerOpen: (open) =>
    set((state) => {
      state.isStorageManagerOpen = open;
    }),

  setAddDownloadOpen: (open) =>
    set((state) => {
      state.isAddDownloadOpen = open;
    }),

  setShortcutsHelpOpen: (open) =>
    set((state) => {
      state.isShortcutsHelpOpen = open;
    }),

  setGlobalFilter: (filter) =>
    set((state) => {
      state.globalFilter = filter;
    }),

  setViewMode: (mode) =>
    set((state) => {
      state.viewMode = mode;
    }),

  setStartupSSE: (data) =>
    set((state) => {
      state.startupp = data;
    }),
});
