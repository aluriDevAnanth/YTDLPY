export function StorageFileCookiesBanner() {
  return (
    <div className="p-3 rounded-lg bg-gray-950/70 border border-gray-800 text-xs text-gray-300 leading-relaxed">
      <span className="font-semibold text-cyan-400">Backend File Mode: </span>
      Reads directly from backend storage path:{" "}
      <span className="font-mono text-cyan-200">storage/cookies.txt</span>
    </div>
  );
}

export default StorageFileCookiesBanner;
