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
  
  // Clean double slashes
  let cleanPath = path.replace(/\/+/g, '/');
  
  // Check if it already has the leading slash
  if (cleanPath.startsWith('/')) {
    if (cleanPath.startsWith('/uploads/uploads/')) {
      cleanPath = cleanPath.substring(8); // Strip one /uploads (leaving /uploads/...)
    }
    return cleanPath;
  }
  
  if (cleanPath.startsWith('uploads/uploads/')) {
    cleanPath = cleanPath.substring(8); // Strip one uploads/
  }
  
  if (cleanPath.startsWith('uploads/') || cleanPath.startsWith('assets/')) {
    return `/${cleanPath}`;
  }
  
  return `/uploads/${cleanPath}`;
};

