import { getPanel } from './content/panels.ts';

const dialog = document.createElement('dialog');
dialog.className = 'panel';
dialog.innerHTML = `
  <article>
    <p class="eyebrow" id="panel-category"></p>
    <h2 id="panel-title"></h2>
    <p class="dates" id="panel-dates"></p>
    <p id="panel-summary"></p>
    <div id="panel-details"></div>
    <p class="tech" id="panel-tech"></p>
    <p class="panel-links" id="panel-links"></p>
    <button type="button" class="panel-close">Close</button>
  </article>
`;
dialog.setAttribute('aria-labelledby', 'panel-title');

const category = dialog.querySelector<HTMLElement>('#panel-category');
const title = dialog.querySelector<HTMLElement>('#panel-title');
const dates = dialog.querySelector<HTMLElement>('#panel-dates');
const summary = dialog.querySelector<HTMLElement>('#panel-summary');
const details = dialog.querySelector<HTMLElement>('#panel-details');
const tech = dialog.querySelector<HTMLElement>('#panel-tech');
const links = dialog.querySelector<HTMLElement>('#panel-links');
const closeButton = dialog.querySelector<HTMLButtonElement>('.panel-close');

let returnFocus: HTMLElement | null = null;

closeButton?.addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});
dialog.addEventListener('close', () => {
  returnFocus?.focus();
  returnFocus = null;
});

document.body.append(dialog);

export function isPanelOpen(): boolean {
  return dialog.open;
}

export function openPanel(id: string): void {
  const panel = getPanel(id);
  if (!panel || !category || !title || !dates || !summary || !details || !tech || !links) return;

  category.textContent = panel.category;
  title.textContent = panel.title;
  dates.textContent = panel.dates ?? '';
  dates.hidden = !panel.dates;
  summary.textContent = panel.summary;

  details.replaceChildren(
    ...panel.details.map((paragraph) => {
      const element = document.createElement('p');
      element.textContent = paragraph;
      return element;
    }),
  );

  tech.textContent = panel.technologies?.length ? panel.technologies.join(' · ') : '';
  tech.hidden = !panel.technologies?.length;

  links.replaceChildren(
    ...panel.links.map((link) => {
      const anchor = document.createElement('a');
      anchor.href = link.url;
      anchor.textContent = link.label;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      return anchor;
    }),
  );
  links.hidden = panel.links.length === 0;

  returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  if (!dialog.open) dialog.showModal();
  closeButton?.focus();
}
