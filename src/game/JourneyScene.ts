import Phaser from 'phaser';
import { consumeInteract, consumeJump, held } from './controls.ts';
import { drawIcons, drawPlayer, drawWorld, paintTexture } from './art.ts';
import {
  GROUND_Y,
  markers,
  platforms,
  SPAWN_X,
  VIEW_W,
  WORLD_H,
  WORLD_W,
} from './level.ts';

export type JourneyHooks = {
  onCheckpoint: (id: string) => void;
  isLocked: () => boolean;
};

const CAPTURED_KEYS = ['SPACE', 'UP', 'LEFT', 'RIGHT', 'W', 'A', 'D', 'E', 'ENTER'];

export class JourneyScene extends Phaser.Scene {
  private readonly hooks: JourneyHooks;
  private player!: Phaser.Physics.Arcade.Sprite;
  private prompt!: Phaser.GameObjects.Text;
  private clouds!: Phaser.GameObjects.TileSprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keyE!: Phaser.Input.Keyboard.Key;
  private keyEnter!: Phaser.Input.Keyboard.Key;
  private keySpace!: Phaser.Input.Keyboard.Key;
  private nearest: string | null = null;
  private touchJumpHeld = false;
  private groundedAt = 0;
  private showJumpUntil = 0;
  private capturing = false;
  private manuallyPaused = false;
  private reduceMotion = false;

  constructor(hooks: JourneyHooks) {
    super('journey');
    this.hooks = hooks;
  }

  create(): void {
    this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    paintTexture(this, 'world', WORLD_W, WORLD_H, drawWorld);
    const world = this.add.image(0, 0, 'world').setOrigin(0, 0);
    world.setDepth(0);

    paintTexture(this, 'clouds', 140, 36, (ctx) => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(8, 16, 28, 8);
      ctx.fillRect(14, 10, 16, 8);
      ctx.fillRect(78, 20, 34, 8);
      ctx.fillRect(88, 14, 16, 8);
    });
    this.clouds = this.add.tileSprite(0, 12, VIEW_W, 36, 'clouds').setOrigin(0, 0).setScrollFactor(0).setDepth(1);

    drawPlayer(this);
    drawIcons(this);

    this.player = this.physics.add.sprite(SPAWN_X, GROUND_Y, 'idle0').setOrigin(0.5, 1).setDepth(5);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setSize(16, 36);
    body.setOffset(8, 12);
    body.setCollideWorldBounds(true);
    this.player.anims.play('idle');

    const solids: Phaser.GameObjects.Rectangle[] = [];
    for (const platform of platforms) {
      const block = this.add.rectangle(
        platform.x + platform.w / 2,
        platform.y + platform.h / 2,
        platform.w,
        platform.h,
        0x000000,
        0,
      );
      this.physics.add.existing(block, true);
      const solid = block.body as Phaser.Physics.Arcade.StaticBody;
      solid.updateFromGameObject();
      solids.push(block);
    }
    this.physics.add.collider(this.player, solids);
    this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H);

    for (const marker of markers) {
      this.add.image(marker.x, GROUND_Y, `icon-${marker.icon}`).setOrigin(0.5, 1).setDepth(6);
      this.add
        .text(marker.x, GROUND_Y - 40, marker.label, {
          fontFamily: 'ui-monospace, monospace',
          fontSize: '8px',
          color: '#1c1c1c',
          backgroundColor: '#ffffff',
          padding: { x: 2, y: 1 },
        })
        .setOrigin(0.5, 1)
        .setDepth(7);
      const zone = this.add.zone(marker.x, GROUND_Y - 20, 72, 56);
      zone.setInteractive({ useHandCursor: true });
      zone.on('pointerdown', () => this.hooks.onCheckpoint(marker.id));
    }

    this.prompt = this.add
      .text(0, 0, 'Press E', {
        fontFamily: 'ui-monospace, monospace',
        fontSize: '8px',
        color: '#ffffff',
        backgroundColor: '#1c1c1c',
        padding: { x: 3, y: 2 },
      })
      .setOrigin(0.5, 1)
      .setDepth(8)
      .setVisible(false);

    this.add
      .text(SPAWN_X, 96, 'Walk right', {
        fontFamily: 'ui-monospace, monospace',
        fontSize: '8px',
        color: '#1c1c1c',
        backgroundColor: '#ffffff',
        padding: { x: 2, y: 1 },
      })
      .setOrigin(0, 0)
      .setDepth(4);

    const keyboard = this.input.keyboard;
    if (!keyboard) {
      throw new Error('Keyboard input is unavailable.');
    }
    this.cursors = keyboard.createCursorKeys();
    this.keyA = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyW = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyE = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.keyEnter = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.keySpace = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    keyboard.disableGlobalCapture();

    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);
    this.cameras.main.startFollow(this.player, true, this.reduceMotion ? 1 : 0.12, 1);
    this.cameras.main.setDeadzone(60, WORLD_H);
    this.cameras.main.roundPixels = true;
  }

  restartWalk(): void {
    if (!this.player) return;
    this.manuallyPaused = false;
    this.physics.world.resume();
    this.player.setPosition(SPAWN_X, GROUND_Y);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    this.cameras.main.scrollX = 0;
  }

  setPaused(paused: boolean): void {
    this.manuallyPaused = paused;
  }

  private viewportFocused(): boolean {
    const viewport = document.getElementById('game-viewport');
    const active = document.activeElement;
    return viewport !== null && (active === viewport || viewport.contains(active));
  }

  private setCapture(on: boolean): void {
    if (on === this.capturing) return;
    const keyboard = this.input.keyboard;
    if (!keyboard) return;
    if (on) keyboard.addCapture(CAPTURED_KEYS);
    else keyboard.removeCapture(CAPTURED_KEYS);
    this.capturing = on;
  }

  update(): void {
    const locked = this.hooks.isLocked() || this.manuallyPaused;
    if (locked) {
      this.physics.world.pause();
      this.player.anims.pause();
      this.setCapture(false);
      return;
    }
    this.physics.world.resume();

    const keyboardOn = this.viewportFocused();
    this.setCapture(keyboardOn);

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const left = held.left || (keyboardOn && (this.cursors.left.isDown || this.keyA.isDown));
    const right = held.right || (keyboardOn && (this.cursors.right.isDown || this.keyD.isDown));
    const onGround = body.blocked.down || body.touching.down;
    if (onGround) this.groundedAt = this.time.now;
    const canJump = this.time.now - this.groundedAt < 100;

    if (left && !right) body.setVelocityX(-110);
    else if (right && !left) body.setVelocityX(110);
    else body.setVelocityX(0);

    if (left && !right) this.player.setFlipX(true);
    if (right && !left) this.player.setFlipX(false);

    const keyboardJump =
      keyboardOn &&
      (Phaser.Input.Keyboard.JustDown(this.keySpace) ||
        Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
        Phaser.Input.Keyboard.JustDown(this.keyW));
    const touchJump = held.jump && !this.touchJumpHeld;
    this.touchJumpHeld = held.jump;
    const queuedJump = consumeJump();
    if ((keyboardJump || touchJump || queuedJump) && canJump) {
      this.groundedAt = 0;
      this.showJumpUntil = this.time.now + 700;
      body.y -= 14;
      body.setVelocityY(-300);
    }

    const speed = Math.abs(body.velocity.x);
    if (!onGround) this.player.anims.play('jump', true);
    else if (speed > 8) this.player.anims.play('walk', true);
    else this.player.anims.play('idle', true);
    if (this.player.anims.isPaused) this.player.anims.resume();

    this.nearest = null;
    let best = 120;
    for (const marker of markers) {
      const distance = Math.abs(this.player.x - marker.x);
      if (distance < best && this.player.y > GROUND_Y - 110) {
        best = distance;
        this.nearest = marker.id;
      }
    }

    const hint = document.getElementById('interact-hint');
    if (this.nearest) {
      const marker = markers.find((item) => item.id === this.nearest);
      if (marker) {
        this.prompt.setPosition(marker.x, GROUND_Y - 52).setVisible(true);
        if (hint) hint.textContent = `${marker.label}. Press E, Enter, or Read.`;
      }
    } else {
      this.prompt.setVisible(false);
      if (hint) hint.textContent = this.time.now < this.showJumpUntil ? 'Jump' : '';
    }

    const interact =
      consumeInteract() ||
      (keyboardOn &&
        (Phaser.Input.Keyboard.JustDown(this.keyE) || Phaser.Input.Keyboard.JustDown(this.keyEnter)));
    if (interact && this.nearest) this.hooks.onCheckpoint(this.nearest);

    this.clouds.tilePositionX = this.cameras.main.scrollX * (this.reduceMotion ? 0 : 0.25);
  }
}
