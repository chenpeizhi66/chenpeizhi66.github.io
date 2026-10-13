export const gallerySource = {
  owner: 'chenpeizhi66',
  repo: 'gallery',
  branch: 'main',
  folder: 'photos',
};

const IMAGE = /\.(avif|gif|jpe?g|png|webp)$/i;
const VIDEO = /\.(mp4|webm|mov)$/i;
const IGNORED = /^(readme\.md|captions\.json|\.gitkeep)$/i;

export type GalleryKind = 'image' | 'video' | 'other';

export type GalleryFile = {
  name: string;
  url: string;
  kind: GalleryKind;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function allowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return false;
    const { owner, repo } = gallerySource;
    if (parsed.hostname === 'raw.githubusercontent.com') {
      return parsed.pathname.startsWith(`/${owner}/${repo}/`);
    }
    if (parsed.hostname === 'media.githubusercontent.com') {
      return parsed.pathname.startsWith(`/media/${owner}/${repo}/`);
    }
    if (parsed.hostname === 'github.com') {
      return parsed.pathname.startsWith(`/${owner}/${repo}/`);
    }
    return false;
  } catch {
    return false;
  }
}

function kindFor(name: string): GalleryKind | null {
  if (IGNORED.test(name) || name.startsWith('.')) return null;
  if (IMAGE.test(name)) return 'image';
  if (VIDEO.test(name)) return 'video';
  return 'other';
}

export function classifyGalleryEntries(entries: unknown): GalleryFile[] {
  if (!Array.isArray(entries)) return [];
  const files: GalleryFile[] = [];
  for (const entry of entries) {
    if (!isRecord(entry) || entry.type !== 'file') continue;
    if (typeof entry.name !== 'string') continue;
    const kind = kindFor(entry.name);
    const url = typeof entry.download_url === 'string' ? entry.download_url : '';
    if (!kind || !allowedUrl(url)) continue;
    files.push({ name: entry.name, url, kind });
  }
  files.sort((a, b) => b.name.localeCompare(a.name, 'en'));
  return files;
}

export function captionsFromPayload(payload: unknown): Record<string, string> {
  if (!isRecord(payload) || payload.encoding !== 'base64' || typeof payload.content !== 'string') return {};
  try {
    const bytes = Uint8Array.from(atob(payload.content.replace(/\s/g, '')), (char) => char.charCodeAt(0));
    const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (!isRecord(parsed)) return {};
    const captions: Record<string, string> = {};
    for (const [name, value] of Object.entries(parsed)) {
      if (typeof value === 'string' && value.trim()) captions[name] = value.trim();
    }
    return captions;
  } catch {
    return {};
  }
}
