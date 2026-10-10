import './styles.css';
import { renderPage } from './render.ts';
import { loadVisitors } from './visitors.ts';

const app = document.querySelector<HTMLElement>('#app');
if (!app) {
  throw new Error('Missing #app');
}

renderPage(app);

const visitors = document.querySelector<HTMLElement>('#visitors');
if (visitors) void loadVisitors(visitors);

const journey = document.querySelector<HTMLElement>('#journey');
if (journey) {
  const start = () => {
    const status = document.querySelector<HTMLElement>('#game-status');
    if (status) status.textContent = 'Loading the walk…';
    void import('./game/mountGame.ts')
      .then((mod) => mod.mountGame())
      .catch((error: unknown) => {
        if (!status) return;
        status.textContent =
          error instanceof Error
            ? `${error.message} You can still open each chapter below.`
            : 'The walk could not start. You can still open each chapter below.';
      });
  };

  if (!('IntersectionObserver' in window)) {
    start();
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        start();
      },
      { rootMargin: '280px' },
    );
    observer.observe(journey);
  }
}
