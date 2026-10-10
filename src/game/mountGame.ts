import Phaser from 'phaser';
import { isPanelOpen, openPanel } from '../dialog.ts';
import { bindHold, queueInteract } from './controls.ts';
import { JourneyScene } from './JourneyScene.ts';
import { VIEW_H, VIEW_W } from './level.ts';

let started = false;

export function mountGame(): void {
  if (started) return;
  const viewport = document.querySelector<HTMLElement>('#game-viewport');
  const status = document.querySelector<HTMLElement>('#game-status');
  if (!viewport || !status) return;
  started = true;
  status.textContent = 'Loading the walk…';

  const scene = new JourneyScene({
    onCheckpoint: (id) => openPanel(id),
    isLocked: () => isPanelOpen() || pauseOverlayOpen(),
  });

  let game: Phaser.Game;
  try {
    game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: viewport,
      width: VIEW_W,
      height: VIEW_H,
      backgroundColor: '#e7f3f8',
      pixelArt: true,
      banner: false,
      audio: { noAudio: true },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 860 },
          debug: false,
        },
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene,
    });
  } catch (error) {
    started = false;
    status.textContent =
      error instanceof Error
        ? `${error.message} You can still open each chapter below.`
        : 'The walk could not start. You can still open each chapter below.';
    return;
  }

  viewport.tabIndex = 0;
  viewport.addEventListener('pointerdown', () => viewport.focus());

  const pauseOverlay = document.querySelector<HTMLElement>('#pause-overlay');
  const showPause = (paused: boolean) => {
    if (!pauseOverlay) return;
    pauseOverlay.hidden = !paused;
    scene.setPaused(paused);
    if (paused) pauseOverlay.querySelector<HTMLButtonElement>('#resume-button')?.focus();
    else viewport.focus();
  };

  document.querySelector('#pause-button')?.addEventListener('click', () => showPause(true));
  document.querySelector('#resume-button')?.addEventListener('click', () => showPause(false));
  document.querySelector('#restart-button')?.addEventListener('click', () => {
    showPause(false);
    scene.restartWalk();
  });

  window.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || isPanelOpen()) return;
    if (!viewport.matches(':focus-within') && pauseOverlay?.hidden !== false) return;
    event.preventDefault();
    showPause(pauseOverlay?.hidden !== false);
  });

  const left = document.querySelector<HTMLButtonElement>('[data-control="left"]');
  const right = document.querySelector<HTMLButtonElement>('[data-control="right"]');
  const jump = document.querySelector<HTMLButtonElement>('[data-control="jump"]');
  const read = document.querySelector<HTMLButtonElement>('[data-control="read"]');
  if (left) bindHold(left, 'left');
  if (right) bindHold(right, 'right');
  if (jump) bindHold(jump, 'jump');
  read?.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    queueInteract();
  });

  const watcher = new IntersectionObserver((entries) => {
    const visible = entries.some((entry) => entry.isIntersecting);
    if (!visible) {
      scene.setPaused(true);
      return;
    }
    if (pauseOverlay?.hidden !== false) scene.setPaused(false);
  });
  const section = document.querySelector('#journey');
  if (section) watcher.observe(section);

  game.events.once(Phaser.Core.Events.READY, () => {
    viewport.classList.add('is-ready');
    status.textContent = 'Click the scene, then use the keyboard. On a phone, use the buttons underneath.';
  });

  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      game.destroy(true);
      started = false;
    });
  }
}

function pauseOverlayOpen(): boolean {
  const overlay = document.querySelector<HTMLElement>('#pause-overlay');
  return overlay !== null && !overlay.hidden;
}
