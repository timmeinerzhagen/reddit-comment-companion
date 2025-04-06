export function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() / 1000) - timestamp)
  
  const intervals = {
    y: 31536000,
    mn: 2592000,
    w: 604800,
    d: 86400,
    h: 3600,
    m: 60
  }

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit)
    if (interval >= 1) {
      return `${interval}${unit} ago`
    }
  }

  return 'just now'
}
