export interface AdminStats {
  total_users: number;
  total_videos: number;
  completed_downloads: number;
  total_storage_bytes: number;
  formatted_storage: string;
}

export const roleOptions = [
  { label: "User", value: "user" },
  { label: "Administrator", value: "admin" },
];
