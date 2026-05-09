export const getDirectDriveLink = (url: string, type: 'image' | 'video' | 'audio' = 'image') => {
  if (!url) return url;
  if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
    const idMatch = url.match(/\/file\/d\/([^/\s?]+)/) || 
                    url.match(/id=([^&/\s]+)/) ||
                    url.match(/\/d\/([^/\s?]+)/);
    if (idMatch) {
      const id = idMatch[1];
      if (type === 'video' || type === 'audio') {
        return `https://docs.google.com/uc?export=download&id=${id}`;
      }
      return `https://lh3.googleusercontent.com/d/${id}`;
    }
  }
  return url;
};

export const getDriveThumbnail = (url: string) => {
  if (!url) return url;
  if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
    const idMatch = url.match(/\/file\/d\/([^/\s?]+)/) || 
                    url.match(/id=([^&/\s]+)/) ||
                    url.match(/\/d\/([^/\s?]+)/);
    if (idMatch) return `https://lh3.googleusercontent.com/d/${idMatch[1]}=w800`;
  }
  return url;
};

export const isDriveMedia = (url: string) => {
  return url.includes('drive.google.com') || url.includes('docs.google.com') || url.includes('googleusercontent.com');
};
