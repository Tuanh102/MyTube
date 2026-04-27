export const formatDuration = (seconds: number) => {
  if (!seconds) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const getUploadUrl = (path?: string, defaultPath: string = '/assets/img/default-thumb.jpg') => {
  if (!path) return defaultPath;
  if (path.startsWith('http')) return path;
  if (path.startsWith('/')) return path;
  return `/uploads/${path}`;
};

