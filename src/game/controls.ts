export const held = {
  left: false,
  right: false,
  jump: false,
};

let interactQueued = false;

export function queueInteract(): void {
  interactQueued = true;
}

export function consumeInteract(): boolean {
  const queued = interactQueued;
  interactQueued = false;
  return queued;
}

export function bindHold(button: HTMLButtonElement, key: 'left' | 'right' | 'jump'): void {
  const press = (event: PointerEvent) => {
    event.preventDefault();
    held[key] = true;
    button.setAttribute('aria-pressed', 'true');
  };
  const release = () => {
    held[key] = false;
    button.setAttribute('aria-pressed', 'false');
  };
  button.addEventListener('pointerdown', press);
  button.addEventListener('pointerup', release);
  button.addEventListener('pointercancel', release);
  button.addEventListener('pointerleave', release);
  button.addEventListener('contextmenu', (event) => event.preventDefault());
}
