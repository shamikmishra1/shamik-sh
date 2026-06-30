const API_URL = 'https://api.shamikmishra.com';

export function trackPageView(page: string) {
  fetch(`${API_URL}/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ page }),
  }).catch(() => {});
}

export function trackCommand(command: string) {
  fetch(`${API_URL}/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ page: 'terminal', command }),
  }).catch(() => {});
}

interface NowPlayingResponse {
  playing: boolean;
  track?: string;
  artist?: string;
  album?: string;
}

export async function fetchNowPlaying(): Promise<string> {
  try {
    const response = await fetch(`${API_URL}/music`);
    if (!response.ok) {
      return `Error: ${response.status} ${response.statusText}`;
    }
    const data: NowPlayingResponse = await response.json();

    if (!data.track) {
      return 'Nothing playing right now.';
    }

    const status = data.playing ? '♪ Now playing' : '♪ Last played';
    return `${status}:
  ${data.track}
  by ${data.artist}${data.album ? `\n  from ${data.album}` : ''}`;
  } catch (e) {
    console.error('Music fetch error:', e);
    return 'Could not fetch music data.';
  }
}

interface Book {
  title: string;
  author: string;
  coverUrl?: string;
  status: string;
}

interface ReadingResponse {
  currentlyReading: Book[];
  recentlyRead: Book[];
}

export async function fetchReading(): Promise<string> {
  try {
    const response = await fetch(`${API_URL}/reading`);
    const data: ReadingResponse = await response.json();

    let result = '';

    if (data.currentlyReading.length > 0) {
      result += '📖 Currently reading:\n';
      data.currentlyReading.forEach(book => {
        result += `  ${book.title}\n  by ${book.author}\n\n`;
      });
    }

    if (data.recentlyRead.length > 0) {
      result += '✓ Recently finished:\n';
      data.recentlyRead.forEach(book => {
        result += `  ${book.title}\n  by ${book.author}\n\n`;
      });
    }

    return result.trim() || 'No reading data available.';
  } catch {
    return 'Could not fetch reading data.';
  }
}
