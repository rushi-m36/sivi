// YouTube client-side helper utilities and client-specific definitions

export function formatVideoDuration(durationStr: string): string {
  // ISO 8601 duration parser placeholder (e.g. PT1H2M10S -> 1:02:10)
  if (!durationStr) return '00:00';
  
  const matches = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!matches) return '00:00';
  
  const hours = parseInt(matches[1] || '0', 10);
  const minutes = parseInt(matches[2] || '0', 10);
  const seconds = parseInt(matches[3] || '0', 10);
  
  const parts: string[] = [];
  if (hours > 0) {
    parts.push(hours.toString());
    parts.push(minutes.toString().padStart(2, '0'));
  } else {
    parts.push(minutes.toString());
  }
  parts.push(seconds.toString().padStart(2, '0'));
  
  return parts.join(':');
}

export function formatViewCount(countStr: string): string {
  const count = parseInt(countStr, 10);
  if (isNaN(count)) return '0 views';
  
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M views`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K views`;
  }
  return `${count} views`;
}
