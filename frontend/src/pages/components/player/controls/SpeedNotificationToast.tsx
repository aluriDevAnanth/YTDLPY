interface SpeedNotificationToastProps {
  show: boolean;
  playbackRate?: number;
}

export function SpeedNotificationToast({
  show,
  playbackRate,
}: SpeedNotificationToastProps) {
  if (!show) return null;

  return (
    <div className="absolute top-12 left-1/2 transform -translate-x-1/2 z-40 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full pointer-events-none tracking-wider font-medium animate-pulse">
      🚀 {playbackRate}X SPEED
    </div>
  );
}

export default SpeedNotificationToast;
