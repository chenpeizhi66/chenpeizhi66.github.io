export const held = {
  left: false,
  right: false,
  jump: false,
};

let interactQueued = false;
let jumpQueued = false;

export function queueInteract(): void {
  interactQueued = true;
}

export function queueJump(): void {
  jumpQueued = true;
}

export function consumeJump(): boolean {
  const queued = jumpQueued;
  jumpQueued = false;
  return queued;
}

export function consumeInteract(): boolean {
  const queued = interactQueued;
  interactQueued = false;
  return queued;
}

export function bindHold(button: HTMLButtonElement, key: 'left' | 'right' | 'jump'): void {
  let releaseTimer = 0;
  const press = (event: PointerEvent) => {
    event.preventDefault();
    window.clearTimeout(releaseTimer);
    held[key] = true;
    button.setAttribute('aria-pressed', 'true');
  };
  const release = () => {
    window.clearTimeout(releaseTimer);
    releaseTimer = window.setTimeout(() => {
      held[key] = false;
      button.setAttribute('aria-pressed', 'false');
    }, 180);
  };
  button.addEventListener('pointerdown', press);
  button.addEventListener('pointerup', release);
  button.addEventListener('pointercancel', release);
  button.addEventListener('pointerleave', release);
  button.addEventListener('contextmenu', (event) => event.preventDefault());
}
