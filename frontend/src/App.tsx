import { clsx } from "clsx";
import { Toast } from "primereact/toast";
import { useEffect, useRef } from "react";
import { Route, Routes } from "react-router";
import { useStartupSSEStore } from "./context/SSEStore";
import { useAuthStore } from "./context/authStore";
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

function App() {
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
      {isLoading === "ongoing" && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 text-white">
          <div className="w-full max-w-md bg-[#18181b] border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative flex items-center justify-center h-10 w-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-400/30 border-t-blue-400"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-base text-zinc-100">
                    {startupp?.progress
                      ? "FFmpeg Binary Download"
                      : "Initializing Backend"}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {startupp?.message || "Connecting to services..."}
                  </p>
                </div>
              </div>
              {startupp?.progress?.percent !== undefined && (
                <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold rounded-full shrink-0">
                  {startupp.progress.percent.toFixed(1)}%
                </div>
              )}
            </div>

            {startupp?.progress && (
              <div className="space-y-4">
                <div className="w-full bg-zinc-800/80 rounded-full h-2.5 overflow-hidden p-0.5 border border-zinc-700/50">
                  <div
                    className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 h-full rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(0, startupp.progress.percent ?? 0),
                      )}%`,
                    }}
                  ></div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-xl p-3 flex flex-col justify-between">
                    <span className="text-zinc-400 font-medium flex items-center gap-1.5">
                      <svg
                        className="w-3.5 h-3.5 text-blue-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      Network Speed
                    </span>
                    <span className="text-sm font-semibold text-zinc-100 mt-1">
                      {startupp.progress.speed || "0 B/s"}
                    </span>
                  </div>

                  <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-xl p-3 flex flex-col justify-between">
                    <span className="text-zinc-400 font-medium flex items-center gap-1.5">
                      <svg
                        className="w-3.5 h-3.5 text-indigo-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                        />
                      </svg>
                      Progress Rate
                    </span>
                    <span className="text-sm font-semibold text-zinc-100 mt-1">
                      {startupp.progress.percentPerSec || "0%/s"}
                    </span>
                  </div>

                  <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-xl p-3 flex flex-col justify-between">
                    <span className="text-zinc-400 font-medium flex items-center gap-1.5">
                      <svg
                        className="w-3.5 h-3.5 text-purple-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      ETA
                    </span>
                    <span className="text-sm font-semibold text-zinc-100 mt-1">
                      {startupp.progress.eta || "N/A"}
                    </span>
                  </div>

                  <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-xl p-3 flex flex-col justify-between">
                    <span className="text-zinc-400 font-medium flex items-center gap-1.5">
                      <svg
                        className="w-3.5 h-3.5 text-emerald-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      Downloaded
                    </span>
                    <span className="text-xs font-semibold text-zinc-200 mt-1 truncate">
                      {startupp.progress.downloadedSize || "0 B"} /{" "}
                      {startupp.progress.totalSize || "0 B"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {isLoading === "error" && (
        <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#1e1e24] text-white p-6">
          <div className="text-center font-sans max-w-md">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-500">
              <svg
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold tracking-wide text-red-400 mb-2">
              Backend Startup Failed
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              {startupp?.message ||
                "An unexpected error occurred while initializing services."}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-medium rounded-md text-sm transition-colors duration-150"
            >
              Reload Page
            </button>
          </div>
        </div>
      )}
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
