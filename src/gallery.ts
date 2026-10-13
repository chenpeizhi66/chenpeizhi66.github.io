import { captionsFromPayload, classifyGalleryEntries, gallerySource, type GalleryFile } from './content/gallery.ts';
import { profile } from './content/profile.ts';
import './styles.css';

const home = import.meta.env.BASE_URL;

function contentsUrl(path: string): string {
  const { owner, repo, branch } = gallerySource;
  return `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
}

async function readJson(url: string): Promise<unknown> {
  const response = await fetch(url, {
    cache: 'no-store',
    headers: { Accept: 'application/vnd.github+json' },
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(String(response.status));
  return response.json();
}

function note(text: string): HTMLParagraphElement {
  const paragraph = document.createElement('p');
  paragraph.className = 'gallery-note';
  paragraph.textContent = text;
  return paragraph;
}

function renderGallery(host: HTMLElement, files: GalleryFile[], captions: Record<string, string>): void {
  host.replaceChildren();
  const pictures = files.filter((file) => file.kind === 'image' || file.kind === 'video');
  const others = files.filter((file) => file.kind === 'other');

  if (pictures.length === 0 && others.length === 0) {
    host.append(note('No photographs yet.'));
    return;
  }

  if (pictures.length > 0) {
    const grid = document.createElement('div');
    grid.className = 'gallery-grid';
    const images = pictures.filter((file) => file.kind === 'image');
    for (const file of pictures) {
      const caption = captions[file.name] ?? '';
      if (file.kind === 'video') {
        const figure = document.createElement('figure');
        figure.className = 'gallery-cell';
        const video = document.createElement('video');
        video.className = 'gallery-video';
        video.controls = true;
        video.preload = 'metadata';
        video.src = file.url;
        figure.append(video);
        if (caption) {
          const title = document.createElement('figcaption');
          title.className = 'shot-title';
          title.textContent = caption;
          figure.append(title);
        }
        grid.append(figure);
        continue;
      }
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'shot';
      const image = document.createElement('img');
      image.src = file.url;
      image.alt = caption || 'Photograph';
      image.decoding = 'async';
      button.append(image);
      if (caption) {
        const title = document.createElement('span');
        title.className = 'shot-title';
        title.textContent = caption;
        button.append(title);
      }
      button.addEventListener('click', () => openViewer(images, images.indexOf(file), captions));
      grid.append(button);
    }
    host.append(grid);
  }

  if (others.length > 0) {
    const block = document.createElement('div');
    block.className = 'other-list';
    const heading = document.createElement('h2');
    heading.textContent = 'Other';
    const list = document.createElement('ul');
    list.className = 'links';
    for (const file of others) {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = file.url;
      link.textContent = captions[file.name] ?? file.name;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      item.append(link);
      list.append(item);
    }
    block.append(heading, list);
    host.append(block);
  }
}

const viewer = document.createElement('dialog');
viewer.className = 'viewer';
viewer.innerHTML = `
  <figure>
    <img id="viewer-image" alt="" />
    <figcaption id="viewer-caption"></figcaption>
  </figure>
  <div class="viewer-bar">
    <button type="button" id="viewer-prev">Previous</button>
    <button type="button" id="viewer-next">Next</button>
    <button type="button" id="viewer-close">Close</button>
  </div>
`;
document.body.append(viewer);

const viewerImage = viewer.querySelector<HTMLImageElement>('#viewer-image');
const viewerCaption = viewer.querySelector<HTMLElement>('#viewer-caption');
const viewerPrev = viewer.querySelector<HTMLButtonElement>('#viewer-prev');
const viewerNext = viewer.querySelector<HTMLButtonElement>('#viewer-next');
const viewerClose = viewer.querySelector<HTMLButtonElement>('#viewer-close');

let viewerFiles: GalleryFile[] = [];
let viewerIndex = 0;
let viewerCaptions: Record<string, string> = {};

function showViewer(): void {
  const file = viewerFiles[viewerIndex];
  if (!file || !viewerImage || !viewerCaption || !viewerPrev || !viewerNext) return;
  const caption = viewerCaptions[file.name] ?? '';
  viewerImage.src = file.url;
  viewerImage.alt = caption || 'Photograph';
  viewerCaption.textContent = caption;
  const single = viewerFiles.length < 2;
  viewerPrev.hidden = single;
  viewerNext.hidden = single;
  viewerPrev.disabled = viewerIndex === 0;
  viewerNext.disabled = viewerIndex === viewerFiles.length - 1;
}

function openViewer(files: GalleryFile[], index: number, captions: Record<string, string>): void {
  if (index < 0) return;
  viewerFiles = files;
  viewerIndex = index;
  viewerCaptions = captions;
  showViewer();
  if (!viewer.open) viewer.showModal();
  viewerClose?.focus();
}

viewerPrev?.addEventListener('click', () => {
  viewerIndex = Math.max(0, viewerIndex - 1);
  showViewer();
});
viewerNext?.addEventListener('click', () => {
  viewerIndex = Math.min(viewerFiles.length - 1, viewerIndex + 1);
  showViewer();
});
viewerClose?.addEventListener('click', () => viewer.close());
viewer.addEventListener('click', (event) => {
  if (event.target === viewer) viewer.close();
});
viewer.addEventListener('close', () => {
  if (viewerImage) viewerImage.removeAttribute('src');
});
viewer.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    viewerIndex = Math.max(0, viewerIndex - 1);
    showViewer();
  }
  if (event.key === 'ArrowRight') {
    event.preventDefault();
    viewerIndex = Math.min(viewerFiles.length - 1, viewerIndex + 1);
    showViewer();
  }
});

function renderPage(root: HTMLElement): void {
  root.innerHTML = `
    <a class="skip" href="#gallery">Skip to content</a>
    <header class="site-header">
      <div class="wrap header-inner">
        <a class="brand" href="${home}">${profile.name}</a>
        <span class="gallery-link" aria-current="page">Gallery</span>
      </div>
    </header>
    <main id="gallery">
      <div class="wrap">
        <h1>Gallery</h1>
        <div id="gallery-list" aria-live="polite"></div>
      </div>
    </main>
  `;
  document.body.classList.add('gallery-page');
}

async function loadGallery(host: HTMLElement): Promise<void> {
  host.replaceChildren(note('Loading photographs…'));
  try {
    const [entries, captionPayload] = await Promise.all([
      readJson(contentsUrl(gallerySource.folder)),
      readJson(contentsUrl(`${gallerySource.folder}/captions.json`)),
    ]);
    const files = classifyGalleryEntries(entries ?? []);
    const captions = captionPayload ? captionsFromPayload(captionPayload) : {};
    renderGallery(host, files, captions);
  } catch {
    host.replaceChildren(note('The photographs could not be loaded.'));
  }
}

const app = document.querySelector<HTMLElement>('#app');
if (!app) throw new Error('Missing #app');
renderPage(app);
const list = document.querySelector<HTMLElement>('#gallery-list');
if (list) void loadGallery(list);
