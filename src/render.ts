import { education, profile, work } from './content/profile.ts';
import { projects } from './content/projects.ts';
import { panels } from './content/panels.ts';
import { pinPercent, places } from './content/places.ts';
import { openPanel } from './dialog.ts';

function esc(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function safeUrl(url: string): string {
  return /^(https:\/\/|mailto:)/.test(url) ? esc(url) : '#';
}

function externalAttrs(url: string): string {
  return url.startsWith('https://') ? ' target="_blank" rel="noopener noreferrer"' : '';
}

export function renderPage(root: HTMLElement): void {
  const base = import.meta.env.BASE_URL;
  const facts = (items: typeof education) =>
    items
      .map(
        (item) => `
          <li>
            <p class="when">${esc(item.when)}</p>
            <h3>${esc(item.title)}</h3>
            <p class="where">${esc(item.place)}</p>
            <p>${esc(item.summary)}</p>
          </li>`,
      )
      .join('');

  const cards = projects
    .map((project) => {
      const meta = [project.year, project.context].filter(Boolean).join(' · ');
      return `
        <article class="card">
          <h3>${esc(project.title)}</h3>
          <p class="meta">${esc(meta)}</p>
          <p>${esc(project.summary)}</p>
          <p class="tech">${esc(project.technologies.join(' · '))}</p>
          <a href="${safeUrl(project.url)}"${externalAttrs(project.url)}>Repository</a>
        </article>`;
    })
    .join('');

  const pins = places
    .map((place) => {
      const point = pinPercent(place);
      const flip = point.left > 70 ? ' flip' : '';
      return `
        <button
          type="button"
          class="pin${flip}"
          style="left:${point.left.toFixed(3)}%;top:${point.top.toFixed(3)}%"
          data-place="${esc(place.id)}"
          aria-label="${esc(`${place.name}. ${place.note}`)}"
        >
          <span class="dot" aria-hidden="true"></span>
          <span class="pin-name">${esc(place.name)}</span>
        </button>`;
    })
    .join('');

  const placeList = places
    .map(
      (place) => `
        <li id="place-${esc(place.id)}">
          <strong>${esc(place.name)}</strong>
          <span>${esc(place.note)}</span>
        </li>`,
    )
    .join('');

  const chapters = panels
    .map(
      (panel) => `
        <li>
          <button type="button" data-panel="${esc(panel.id)}">${esc(panel.title)}</button>
        </li>`,
    )
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
          <a href="#projects">Projects</a>
          <a href="#journey">Journey</a>
          <a href="#map">Map</a>
        </nav>
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
          <h3>Education</h3>
          <ul class="facts">${facts(education)}</ul>
          <h3>Work</h3>
          <ul class="facts">${facts(work)}</ul>
          <h3>Skills</h3>
          <p class="skills">${esc(profile.skills.join(', '))}.</p>
        </section>

        <section id="projects">
          <h2>Projects</h2>
          <p>Original repositories. Forks and course mirrors are left off this list.</p>
          <div class="cards">${cards}</div>
        </section>

        <section id="journey">
          <h2>A short walk</h2>
          <p>
            The same story, as a small pixel scene. Walk to a marker and press E.
            The chapters under the scene open the same notes if you would rather not play.
          </p>
          <div class="game-shell">
            <div class="game-toolbar">
              <p>A or D, or the arrow keys, to move. Space, W, or up to jump. E or Enter to read. Esc to pause.</p>
              <div class="toolbar-actions">
                <button type="button" id="pause-button">Pause</button>
                <button type="button" id="restart-button">Restart</button>
              </div>
            </div>
            <p id="game-status" role="status">The walk loads when you reach this part of the page.</p>
            <div class="stage">
              <div id="game-viewport" class="game-viewport" tabindex="0" aria-label="Pixel walk through Peizhi Chen's experience"></div>
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
          <h3>Chapters</h3>
          <ul class="chapters">${chapters}</ul>
        </section>

        <section id="map">
          <h2>Places</h2>
          <p>Where I studied. The count below is how many people have opened this page.</p>
          <div class="map-frame">
            <img src="${esc(base)}assets/world.svg" alt="World map" width="960" height="480" />
            <div class="pins">${pins}</div>
          </div>
          <ul class="places">${placeList}</ul>
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

  root.querySelectorAll<HTMLButtonElement>('[data-panel]').forEach((button) => {
    button.addEventListener('click', () => openPanel(button.dataset.panel ?? ''));
  });

  root.querySelectorAll<HTMLButtonElement>('[data-place]').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.dataset.place;
      root.querySelectorAll('.places li').forEach((item) => item.classList.remove('is-current'));
      const item = id ? document.getElementById(`place-${id}`) : null;
      item?.classList.add('is-current');
      item?.scrollIntoView({ block: 'nearest' });
    });
  });
}
