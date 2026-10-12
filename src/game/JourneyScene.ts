import Phaser from 'phaser';
import { consumeInteract, consumeJump, held } from './controls.ts';
import { drawIcons, drawLabel, drawPlayer, paintTexture } from './art.ts';
import { drawWorld, gulls, life, paintCreatures, placeFor, placeLabels } from './cityscape.ts';
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
  private prompt!: Phaser.GameObjects.Image;
  private walkHint!: Phaser.GameObjects.Image;
  private clouds!: Phaser.GameObjects.TileSprite;
  private farClouds!: Phaser.GameObjects.TileSprite;
  private cloudDrift = 0;
  private place!: Phaser.GameObjects.Image;
  private placeId = 'dalian';
  private flag!: Phaser.GameObjects.Image;
  private car!: Phaser.GameObjects.Image;
  private drops: Phaser.GameObjects.Image[] = [];
  private birds: { sprite: Phaser.GameObjects.Image; speed: number; base: number; phase: number }[] = [];
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
    for (const offset of [-WORLD_W, 0, WORLD_W]) {
      this.add.image(offset, 0, 'world').setOrigin(0, 0).setDepth(0);
    }

    paintTexture(this, 'clouds', 140, 36, (ctx) => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(8, 16, 28, 8);
      ctx.fillRect(14, 10, 16, 8);
      ctx.fillRect(78, 20, 34, 8);
      ctx.fillRect(88, 14, 16, 8);
    });
    this.clouds = this.add.tileSprite(0, 12, VIEW_W, 36, 'clouds').setOrigin(0, 0).setScrollFactor(0).setDepth(1);
    paintTexture(this, 'clouds-far', 180, 24, (ctx) => {
      ctx.fillStyle = '#f5fbfe';
      ctx.fillRect(12, 10, 46, 8);
      ctx.fillRect(24, 4, 24, 8);
      ctx.fillRect(112, 12, 50, 8);
      ctx.fillRect(126, 6, 22, 8);
    });
    this.farClouds = this.add.tileSprite(0, 40, VIEW_W, 24, 'clouds-far').setOrigin(0, 0).setScrollFactor(0).setDepth(1);

    paintCreatures(this);
    this.flag = this.add.image(life.flag.x + 1, life.flag.y, 'flag-0').setOrigin(0, 0).setDepth(4);
    this.car = this.add.image(life.incline.x0, life.incline.y0, 'incline-car').setOrigin(0, 0.5).setDepth(4);
    this.birds = gulls.map((gull) => ({
      sprite: this.add.image(gull.x, gull.y, 'gull-0').setDepth(4),
      speed: gull.speed,
      base: gull.y,
      phase: gull.phase,
    }));
    this.drops = Array.from({ length: 6 }, (_, index) =>
      this.add.image(life.fountain.x + (index % 3) * 4, life.fountain.y + index * 3, 'drop').setDepth(4),
    );

    drawPlayer(this);
    drawIcons(this);

    this.player = this.physics.add.sprite(SPAWN_X, GROUND_Y, 'idle0').setOrigin(0.5, 1).setDepth(5);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setSize(16, 36);
    body.setOffset(8, 12);
    body.setCollideWorldBounds(true);
    this.physics.world.setBounds(-WORLD_W, 0, WORLD_W * 3, WORLD_H);
    this.physics.world.setBoundsCollision(false, false, true, false);
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
    for (const marker of markers) {
      drawLabel(this, `label-${marker.id}`, marker.label, '#1c1c1c', '#ffffff');
      this.add.image(marker.x, GROUND_Y, `icon-${marker.icon}`).setOrigin(0.5, 1).setDepth(6);
      this.add.image(marker.x, GROUND_Y - 44, `label-${marker.id}`).setOrigin(0.5, 1).setDepth(7);
      const zone = this.add.zone(marker.x, GROUND_Y - 20, 72, 56);
      zone.setInteractive({ useHandCursor: true });
      zone.on('pointerdown', () => this.hooks.onCheckpoint(marker.id));
    }

    drawLabel(this, 'label-press', 'PRESS E', '#ffffff', '#1c1c1c');
    this.prompt = this.add.image(0, 0, 'label-press').setOrigin(0.5, 1).setDepth(8).setVisible(false);
    drawLabel(this, 'label-walk', 'WALK', '#1c1c1c', '#ffffff');
    this.walkHint = this.add.image(SPAWN_X, 78, 'label-walk').setOrigin(0, 0).setDepth(4);
    for (const place of placeLabels) {
      drawLabel(this, `place-${place.id}`, place.text, '#1c1c1c', '#ffffff', 3);
    }
    const opening = placeFor(SPAWN_X);
    this.placeId = opening.id;
    this.place = this.add.image(VIEW_W / 2, 8, `place-${opening.id}`).setOrigin(0.5, 0).setScrollFactor(0).setDepth(30);

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

    this.cameras.main.setBounds(-WORLD_W, 0, WORLD_W * 3, WORLD_H);
    this.cameras.main.startFollow(this.player, true, this.reduceMotion ? 1 : 0.12, 1);
    this.cameras.main.setDeadzone(60, WORLD_H);
    this.cameras.main.roundPixels = true;
  }

  restartWalk(): void {
    if (!this.player) return;
    this.manuallyPaused = false;
    this.physics.world.resume();
    this.player.setPosition(SPAWN_X, GROUND_Y);
    this.walkHint.setVisible(true);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    this.cloudDrift = 0;
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

  update(_time: number, delta: number): void {
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

    if (left && !right) body.setVelocityX(-120);
    else if (right && !left) body.setVelocityX(120);
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

    this.wrapWorld();
    this.driftLife(delta);
    if (Math.abs(this.player.x - SPAWN_X) > 80) this.walkHint.setVisible(false);

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
        this.prompt.setPosition(marker.x, GROUND_Y - 86).setVisible(true);
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

    const scrolled = this.cameras.main.scrollX + this.cloudDrift;
    const drift = this.reduceMotion ? 0 : 1;
    this.clouds.tilePositionX = scrolled * 0.22 * drift;
    this.farClouds.tilePositionX = scrolled * 0.1 * drift;
  }

  private driftLife(delta: number): void {
    const place = placeFor(this.player.x);
    if (place.id !== this.placeId) {
      this.placeId = place.id;
      this.place.setTexture(`place-${place.id}`);
    }

    const seconds = delta / 1000;
    const flapping = Math.floor(this.time.now / 180) % 2 === 0;
    for (const bird of this.birds) {
      bird.sprite.x += bird.speed * seconds;
      if (bird.sprite.x > WORLD_W) bird.sprite.x -= WORLD_W;
      bird.sprite.y = bird.base + Math.sin(this.time.now / 420 + bird.phase) * 5;
      bird.sprite.setTexture(flapping ? 'gull-0' : 'gull-1');
    }

    this.flag.setTexture(Math.floor(this.time.now / 160) % 2 === 0 ? 'flag-0' : 'flag-1');

    const span = 8;
    const ping = (this.time.now / 1000) % (span * 2);
    const along = ping <= span ? ping / span : (span * 2 - ping) / span;
    this.car.setPosition(
      life.incline.x0 + (life.incline.x1 - life.incline.x0) * along,
      life.incline.y0 + (life.incline.y1 - life.incline.y0) * along,
    );

    for (const [index, drop] of this.drops.entries()) {
      drop.y -= 28 * seconds;
      drop.x += Math.sin(this.time.now / 200 + index) * 0.15;
      if (drop.y < life.fountain.y - 26) {
        drop.y = life.fountain.y;
        drop.x = life.fountain.x + (index % 3) * 4;
      }
    }
  }

  private wrapWorld(): void {
    const shift = this.player.x >= WORLD_W ? -WORLD_W : this.player.x < 0 ? WORLD_W : 0;
    if (shift === 0) return;
    this.player.x += shift;
    this.cameras.main.scrollX += shift;
    this.cloudDrift -= shift;
  }
}
