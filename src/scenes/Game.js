/// <reference path="../../typings/phaser.d.ts" />
import Phaser from 'phaser';
import Hero from '../entities/Hero';
class Game extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) { }

  preload() {
    this.load.tilemapTiledJSON('level-1', 'assets/levels/kakaparrot.json');
    this.load.spritesheet('world-2-sheet', 'assets/world-3.png', {
      frameWidth: 32,
      frameHeight: 32,
      margin: 1,
      spacing: 2,
    });
    this.load.spritesheet('baboon-run-sheet', 'assets/baboon.png', {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet('hero-idle-sheet', 'assets/platform_gfx/platform_gfx/hero/idle.png', {
      frameWidth: 32,
      frameHeight: 64,
    });
    this.load.spritesheet('hero-run-sheet', 'assets/platform_gfx/platform_gfx/hero/run.png', {
      frameWidth: 32,
      frameHeight: 64
    });

    this.load.spritesheet('hero-pivot-sheet', 'assets/platform_gfx/platform_gfx/hero/pivot.png', {
      frameWidth: 32,
      frameHeight: 64,
    });

    this.load.spritesheet('hero-jump-sheet', 'assets/platform_gfx/platform_gfx/hero/jump.png', {
      frameWidth: 32,
      frameHeight: 64,
    });

    this.load.spritesheet('hero-flip-sheet', 'assets/platform_gfx/platform_gfx/hero/spinjump.png', {
      frameWidth: 32,
      frameHeight: 64,
    });

    this.load.spritesheet('hero-fall-sheet', 'assets/platform_gfx/platform_gfx/hero/fall.png', {
      frameWidth: 32,
      frameHeight: 64,
    });

    this.load.spritesheet('hero-die-sheet', 'assets/platform_gfx/platform_gfx/hero/bonk.png', {
      frameWidth: 32,
      frameHeight: 64,
    });
  }

  create(data) {
    // this.add.image(400 , 300, 'logo');
    this.w_key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.d_key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.a_key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.space_key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.anims.create({
      key: 'hero-running',
      frames: this.anims.generateFrameNumbers('hero-run-sheet'),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'hero-idle',
      frames: this.anims.generateFrameNumbers('hero-idle-sheet'),
    });
    this.anims.create({
      key: 'hero-pivoting',
      frames: this.anims.generateFrameNumbers('hero-pivot-sheet'),
    });

    this.anims.create({
      key: 'hero-jumping',
      frames: this.anims.generateFrameNumbers('hero-jump-sheet'),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'hero-flipping',
      frames: this.anims.generateFrameNumbers('hero-flip-sheet'),
      frameRate: 30,
      repeat: 0,
    });

    this.anims.create({
      key: 'hero-falling',
      frames: this.anims.generateFrameNumbers('hero-fall-sheet'),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: 'hero-dead',
      frames: this.anims.generateFrameNumbers('hero-die-sheet'),
    });
    this.anims.create({
      key: 'bador-chasing',
      frames: this.anims.generateFrameNumbers('baboon-run-sheet'),
    });

    this.score = 0;
    this.scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' })

    this.addMap();

    this.addHero();

    this.addParrots();

    this.addBador();

    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

  }

  addHero() {
    this.hero = new Hero(this, this.spawnPos.x, this.spawnPos.y);
    this.cameras.main.startFollow(this.hero);

    const groundCollider = this.physics.add.collider(this.hero, this.map.getLayer('Ground').tilemapLayer);


    const spikesCollider = this.physics.add.overlap(this.hero, this.spikeGroup, () => {
      this.hero.kill();
    });
    this.hero.on('died', () => {
      groundCollider.destroy();
      spikesCollider.destroy();
      this.hero.body.setCollideWorldBounds(false);
      this.cameras.main.stopFollow();
    });

  }


  addMap() {
    this.map = this.make.tilemap({ key: 'level-1' });
    this.parrots = this.add.group({

    });
    const groundTiles = this.map.addTilesetImage('world-2', 'world-2-sheet');

    const groundLayer = this.map.createStaticLayer('Ground', groundTiles);
    this.map.createStaticLayer('water', groundTiles);

    groundLayer.setCollision([1, 2, 5], true);

    this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.physics.world.setBoundsCollision(true, true, false, true);
    this.spikeGroup = this.physics.add.group({ immovable: true, allowGravity: false });
    this.parrotGroup = this.physics.add.group({ immovable: true, allowGravity: false });
    this.badorGroup = this.physics.add.group({ immovable: true, allowGravity: false });
    this.map.getObjectLayer('Objects').objects.forEach(object => {
      if (object.name === 'Start') {
        this.spawnPos = { x: object.x, y: object.y };
      }
      if (object.gid === 4) {
        const spike = this.spikeGroup.create(object.x, object.y, 'world-2-sheet', object.gid - 1);
        spike.setOrigin(0, 1.8);
        //spike.setOrigin()
        // spike.setSize(object.width - 10, object.height - 10);
        // spike.setOffset(5, 10);
      }
    });
    //   const debugGraphics = this.add.graphics();
    // groundLayer.renderDebug(debugGraphics);
  }

  addParrots() {
    this.map.getObjectLayer('Objects').objects.forEach(object => {

      if (object.type === 'parrot') {
        const parrot = this.parrotGroup.create(object.x, object.y, 'world-2-sheet', object.gid - 1);
        parrot.id = Phaser.Math.Between(1, 100);
        parrot.show = true;
        parrot.setOrigin(0, 1);
        this.reCreateParrots(parrot);
        this.parrots.add(parrot);
        //spike.setOrigin()
        // spike.setSize(object.width - 10, object.height - 10);
        // spike.setOffset(5, 10);
      }
    });
  }

  reCreateParrots(parrot) {
    parrot.visible = true;
    this.physics.add.overlap(this.hero, parrot, (hero, parrot) => {
      if (parrot.visible && !this.hero.isDead()) {
        this.score += 10;
        this.scoreText.text = 'Score: ' + this.score;
        parrot.show = false;
        parrot.visible = false;
      }

    });
  }

  addBador() {
    this.map.getObjectLayer('Objects').objects.forEach(object => {

      if (object.name === 'bador') {
        this.spawnBadorPos = { x: object.x, y: object.y };
        const bador = this.badorGroup.create(object.x, object.y, 'baboon-run-sheet', 0);
        this.bador = bador;
        this.reCreateBador(bador);
      }
    });
  }

  reCreateBador(bador) {

    this.physics.add.overlap(this.hero, bador, (hero, bador) => {
      this.hero.kill();
    });
    this.physics.moveTo(bador, this.spawnBadorPos.x, this.spawnBadorPos.y, 300, 1);

  }

  update(time, delta) {
    const cameraBottom = this.cameras.main.getWorldPoint(0, this.cameras.main.height).y;

    if (this.hero.isDead() && this.hero.getBounds().top > cameraBottom + 100) {
      this.score = 0;
      this.scoreText.text = 'Score: ' + this.score;
      this.hero.destroy();
      this.addHero();
      this.parrotGroup.children.iterate(parrot => {
        this.reCreateParrots(parrot);
      });
      this.reCreateBador(this.bador);
    } else if (!this.hero.isDead()) {
      this.physics.moveToObject(this.badorGroup.getFirstAlive(), this.hero, 140);
    }
  }
}

export default Game;