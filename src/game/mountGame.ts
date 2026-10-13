import Phaser from 'phaser';
import { isPanelOpen, openPanel } from '../dialog.ts';
import { bindHold, queueInteract, queueJump } from './controls.ts';
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
      type: Phaser.CANVAS,
      parent: viewport,
      width: VIEW_W,
      height: VIEW_H,
      backgroundColor: '#e7f3f8',
      pixelArt: true,
      banner: false,
      audio: { noAudio: true },
      render: {
        pixelArt: true,
        antialias: false,
        roundPixels: true,
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 450 },
          debug: false,
        },
      },
      scale: {
        mode: Phaser.Scale.NONE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        zoom: 1,
      },
      scene,
    });
  } catch (error) {
    started = false;
    status.textContent =
      error instanceof Error
        ? error.message
        : 'The walk could not start.';
    return;
  }

  viewport.tabIndex = 0;
  let pointerInside = false;
  const armKeys = () => {
    pointerInside = true;
    viewport.focus();
  };
  viewport.addEventListener('pointerdown', armKeys);
  viewport.addEventListener('pointerenter', armKeys);
  viewport.addEventListener('pointerleave', () => {
    pointerInside = false;
  });
  window.addEventListener('keydown', (event) => {
    if (isPanelOpen()) return;
    const focused = document.activeElement === viewport || viewport.contains(document.activeElement);
    if (!focused && !pointerInside) return;
    if (event.key === ' ' || event.key === 'ArrowUp' || event.key === 'w' || event.key === 'W') {
      event.preventDefault();
      queueJump();
    }
    if (event.key === 'e' || event.key === 'E' || event.key === 'Enter') {
      event.preventDefault();
      queueInteract();
    }
  });

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
  jump?.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    queueJump();
  });
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

  let fitting = false;
  const fitCrisp = () => {
    if (fitting) return;
    const width = viewport.clientWidth;
    const height = viewport.clientHeight;
    if (width < 16 || height < 16) return;
    fitting = true;
    const zoom = Math.min(Math.floor(width / VIEW_W), Math.floor(height / VIEW_H));
    const scale = game.scale;
    if (zoom >= 1) {
      const changed = scale.scaleMode !== Phaser.Scale.NONE || scale.zoom !== zoom;
      scale.scaleMode = Phaser.Scale.NONE;
      if (changed) scale.setZoom(zoom);
    } else if (scale.scaleMode !== Phaser.Scale.FIT || scale.zoom !== 1) {
      scale.scaleMode = Phaser.Scale.FIT;
      scale.setZoom(1);
    } else {
      scale.refresh();
    }
    game.canvas.style.imageRendering = 'pixelated';
    fitting = false;
  };
  new ResizeObserver(fitCrisp).observe(viewport);
  game.events.once(Phaser.Core.Events.READY, () => {
    viewport.classList.add('is-ready');
    status.textContent = '';
    fitCrisp();
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
