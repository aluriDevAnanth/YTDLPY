import { createJSONStorage } from "zustand/middleware";

export const API_BASE = import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";

export const getAuthStorageMode = (): "session" | "local" => {
  return (
    (sessionStorage.getItem("auth_storage_mode") as "session" | "local") ||
    (localStorage.getItem("auth_storage_mode") as "session" | "local") ||
    "local"
  );
};

export const setAuthStorageMode = (mode: "session" | "local") => {
  sessionStorage.setItem("auth_storage_mode", mode);
  localStorage.setItem("auth_storage_mode", mode);
};

export const getAuthToken = (): string | null => {
  const mode = getAuthStorageMode();
  if (mode === "session") {
    return sessionStorage.getItem("token");
  } else {
    return localStorage.getItem("token");
  }
};

export const setAuthToken = (token: string, mode?: "session" | "local") => {
  const targetMode = mode || getAuthStorageMode();
  setAuthStorageMode(targetMode);
  if (targetMode === "session") {
    sessionStorage.setItem("token", token);
    localStorage.removeItem("token");
  } else {
    localStorage.setItem("token", token);
    sessionStorage.removeItem("token");
  }
};

export const removeAuthToken = () => {
  sessionStorage.removeItem("token");
  localStorage.removeItem("token");
};

export const dynamicStorage = createJSONStorage(() => ({
  getItem: (name: string) => {
    const mode = getAuthStorageMode();
    if (mode === "session") {
      return sessionStorage.getItem(name);
    }
    return localStorage.getItem(name);
  },
  setItem: (name: string, value: string) => {
    const mode = getAuthStorageMode();
    if (mode === "session") {
      sessionStorage.setItem(name, value);
      localStorage.removeItem(name);
    } else {
      localStorage.setItem(name, value);
      sessionStorage.removeItem(name);
    }
  },
  removeItem: (name: string) => {
    sessionStorage.removeItem(name);
    localStorage.removeItem(name);
  },
}));
