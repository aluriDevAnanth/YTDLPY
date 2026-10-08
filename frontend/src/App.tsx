import { clsx } from "clsx";
import { Toast } from "primereact/toast";
import { useEffect, useRef } from "react";
import { Route, Routes } from "react-router";
import { useAuthStore } from "./context/authStore";
import { useStartupSSEStore } from "./context/SSEStore";
import { useKeyboardShortcuts } from "./context/useKeyboardShortcuts";
import Home from "./pages/Home";
import Login from "./pages/Login";
import PlaylistDetail from "./pages/PlaylistDetail";
import PlaylistStudio from "./pages/PlaylistStudio";
import ToastTesting from "./pages/ToastTesting";
import WatchLater from "./pages/WatchLater";
import AdminDashboard from "./pages/components/AdminDashboard";
import Header from "./pages/components/Header";
import ProtectedAdminRoute from "./pages/components/ProtectedRoute";
import SocketHandler from "./pages/components/SocketHandler";

import BackendStartupOverlay from "./pages/components/startup/BackendStartupOverlay";

function App() {
  useKeyboardShortcuts();
  const toastMain = useRef<Toast>(null);
  const { token, user, fetchMe } = useAuthStore();
  const startupp = useStartupSSEStore(
    (state) => state.sse?.["startupp"]?.["startupp"],
  );
  const isLoading = startupp?.typee;

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return (
    <>
      <Login />
      <BackendStartupOverlay />
      <div
        className={clsx(
          "transition-opacity duration-400 ease-in-out w-full min-h-screen p-1.5 sm:p-2 md:p-2 flex flex-col",
          isLoading !== "success" || !token || !user
            ? "pointer-events-none opacity-0"
            : "opacity-100",
        )}
      >
        <Toast ref={toastMain} />
        <SocketHandler toastRef={toastMain} />
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/playlists" element={<PlaylistStudio />} />
          <Route path="/watch_later" element={<WatchLater />} />
          <Route path="/playlist/:public_id" element={<PlaylistDetail />} />
          <Route path="/:public_id" element={<PlaylistDetail />} />
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />
          <Route path="/toast-studio" element={<ToastTesting />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
