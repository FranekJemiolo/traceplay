export interface TrainingHashState {
  mode: 'train' | 'studio';
  diff: 'easy' | 'hard';
  idx: number;
  score: number;
  stars: number;
}

export function encodeHashState(state: TrainingHashState): string {
  try {
    const json = JSON.stringify(state);
    const utf8 = encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    );
    return btoa(utf8);
  } catch (e) {
    return '';
  }
}

export function decodeHashState(hashStr: string): TrainingHashState | null {
  try {
    let raw = hashStr.startsWith('#') ? hashStr.slice(1) : hashStr;
    if (raw.startsWith('state=')) raw = raw.slice(6);
    if (!raw) return null;
    const decoded = decodeURIComponent(
      Array.prototype.map
        .call(atob(raw), (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(decoded);
    if (parsed && typeof parsed === 'object') {
      return {
        mode: parsed.mode === 'train' ? 'train' : 'studio',
        diff: parsed.diff === 'hard' ? 'hard' : 'easy',
        idx: typeof parsed.idx === 'number' ? parsed.idx : 0,
        score: typeof parsed.score === 'number' ? parsed.score : 0,
        stars: typeof parsed.stars === 'number' ? parsed.stars : 0,
      };
    }
  } catch (e) {
    // invalid base64 hash
  }
  return null;
}
