import { profile } from './content/profile.ts';
import { listedProjects } from './content/projects.ts';
import { industry, research } from './content/resume.ts';
import { places, separatePins } from './content/places.ts';

function esc(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function safeUrl(url: string): string {
  if (/^(https:\/\/|mailto:)/.test(url)) return esc(url);
  if (url.startsWith('/') && !url.includes('..')) return esc(`${import.meta.env.BASE_URL}${url.slice(1)}`);
  return '#';
}

function externalAttrs(url: string): string {
  return url.startsWith('https://') ? ' target="_blank" rel="noopener noreferrer"' : '';
}

export function renderPage(root: HTMLElement): void {
  const base = import.meta.env.BASE_URL;

  const projectCard = (project: {
    title: string;
    meta: string;
    summary: string;
    technologies: string[];
    url?: string;
  }) => `
        <article class="card">
          <h3>${esc(project.title)}</h3>
          ${project.meta ? `<p class="meta">${esc(project.meta)}</p>` : ''}
          <p>${esc(project.summary)}</p>
          <p class="tech">${esc(project.technologies.join(' · '))}</p>
          ${
            project.url
              ? `<a href="${safeUrl(project.url)}"${externalAttrs(project.url)}>Repository</a>`
              : ''
          }
        </article>`;

  const cards = listedProjects
    .map((project) =>
      projectCard({
        title: project.title,
        meta: [project.year, project.context].filter(Boolean).join(' · '),
        summary: project.summary,
        technologies: project.technologies,
        url: project.url,
      }),
    )
    .join('');

  const experienceCards = (items: typeof research) =>
    items
      .map((item) =>
        projectCard({
          title: item.title,
          meta: item.meta,
          summary: item.summary,
          technologies: item.technologies,
          url: item.url,
        }),
      )
      .join('');

  const pins = separatePins(places)
    .map(({ place, left, top }) => {
      return `
        <button
          type="button"
          class="pin"
          style="left:${left.toFixed(3)}%;top:${top.toFixed(3)}%"
          aria-label="${esc(place.name)}"
        >
          <span class="pin-name">${esc(place.name)}</span>
        </button>`;
    })
    .join('');

  const contact = profile.links
    .map(
      (link) => `<li><a href="${safeUrl(link.url)}"${externalAttrs(link.url)}>${esc(link.label)}</a></li>`,
    )
    .join('');

  root.innerHTML = `
    <a class="skip" href="#about">Skip to content</a>
    <header class="site-header">
      <div class="wrap header-inner">
        <a class="brand" href="#top">${esc(profile.name)}</a>
        <nav aria-label="Sections">
          <a href="#about">About</a>
          <a href="#experience">Experience</a>
          <a href="#projects">Projects</a>
          <a href="#journey">Journey</a>
          <a href="#map">Map</a>
        </nav>
        <a class="gallery-link" href="${safeUrl('/gallery/')}">Gallery</a>
      </div>
    </header>
    <main id="top">
      <div class="wrap">
        <section class="hero">
          <p class="name-zh">${esc(profile.nameZh)} · ${esc(profile.pronouns)}</p>
          <h1>${esc(profile.name)}</h1>
          <p class="headline">${esc(profile.headline)}</p>
          <ul class="links">${contact}</ul>
        </section>

        <section id="about">
          <h2>About</h2>
          ${profile.paragraphs.map((paragraph) => `<p>${esc(paragraph)}</p>`).join('')}
        </section>

        <section id="experience">
          <h2>Experience</h2>
          <div class="experience-block">
            <h3>Research</h3>
            <div class="cards">${experienceCards(research)}</div>
          </div>
          <div class="experience-block">
            <h3>Industry</h3>
            <div class="cards">${experienceCards(industry)}</div>
          </div>
        </section>

        <section id="projects">
          <h2>Projects</h2>
          <div class="cards">${cards}</div>
        </section>

        <section id="journey">
          <h2>A Little Story</h2>
          <div class="game-shell">
            <div class="game-toolbar">
              <p>A or D to move. E to interact.</p>
              <div class="toolbar-actions">
                <button type="button" id="pause-button">Pause</button>
                <button type="button" id="restart-button">Restart</button>
              </div>
            </div>
            <p id="game-status" role="status"></p>
            <div class="stage">
              <div id="game-viewport" class="game-viewport" tabindex="0" aria-label="A little story. A or D to move. E to interact."></div>
              <div id="pause-overlay" class="pause-overlay" hidden>
                <p>Paused</p>
                <button type="button" id="resume-button">Resume</button>
              </div>
            </div>
            <p id="interact-hint" class="interact-hint" role="status"></p>
            <div class="touch-controls" aria-label="Touch controls">
              <button type="button" data-control="left" aria-pressed="false">Left</button>
              <button type="button" data-control="right" aria-pressed="false">Right</button>
              <button type="button" data-control="jump" aria-pressed="false">Jump</button>
              <button type="button" data-control="read">Read</button>
            </div>
          </div>
        </section>

        <section id="map">
          <h2>Places</h2>
          <p>Cities I have visited. Rest the pointer on a red dot to see the name. The count below is how many people have opened this page.</p>
          <div class="map-frame">
            <img src="${esc(base)}assets/world.svg" alt="World map of cities visited" width="960" height="480" />
            <div class="pins">${pins}</div>
          </div>
          <div id="visitors" class="visitors" aria-live="polite">
            <p>Checking how many people have opened this page…</p>
          </div>
        </section>
      </div>
    </main>
    <footer class="site-footer">
      <div class="wrap">
        <p>${esc(profile.name)} · <a href="mailto:${esc(profile.email)}">${esc(profile.email)}</a></p>
      </div>
    </footer>
  `;

}
