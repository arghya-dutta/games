/// <reference path="../../typings/phaser.d.ts" />
import Phaser from 'phaser';
import StateMachine from 'javascript-state-machine';

class Hero extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'hero-run-sheet', 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5, 1);
    this.anims.play('hero-running');
    this.body.setCollideWorldBounds(true);
    this.body.setSize(12, 40);
    this.body.setOffset(12, 23);
    this.body.setMaxVelocity(250, 450);
    this.body.setDragX(750);
    //this.body.setDragY(750);
    this.w_key = scene.w_key;
    this.d_key = scene.d_key;
    this.a_key = scene.a_key;
    this.space_key = scene.space_key;
    this.input = {};
    this.setUpMovement()
    this.setupAnimations();
  }
  setupAnimations() {
    this.animeState = new StateMachine({
      init: 'idle',
      transitions: [
        { name: 'idle', from: ['falling', 'running', 'pivoting'], to: 'idle' },
        { name: 'run', from: ['falling', 'idle', 'pivoting'], to: 'running' },
        { name: 'pivot', from: ['falling', 'running'], to: 'pivoting' },
        { name: 'jump', from: ['idle', 'running', 'pivoting'], to: 'jumping' },
        { name: 'flip', from: ['jumping', 'falling'], to: 'flipping' },
        { name: 'fall', from: ['idle', 'running', 'pivoting', 'jumping', 'flipping'], to: 'falling' },
        { name: 'die', from: '*', to: 'dead' },
      ],
      methods: {
        onEnterState: (lifecycle) => {
          this.anims.play('hero-' + lifecycle.to);
          console.log(lifecycle);
        }
      },
    });


    this.animePredicates = {
      idle: () => {
        return this.body.onFloor() && this.body.velocity.x === 0;
      },
      run: () => {
        return this.body.onFloor() && Math.sign(this.body.velocity.x) === (this.flipX ? -1 : 1);
      },
      pivot: () => {
        return this.body.onFloor() && Math.sign(this.body.velocity.x) === (this.flipX ? 1 : -1);
      },
      jump: () => {
        return this.body.velocity.y < 0;
      },
      flip: () => {
        return this.body.velocity.y < 0 && this.moveState.is('flipping');
      },
      fall: () => {
        return this.body.velocity.y > 0;
      },
    };
  }

  setUpMovement() {
    this.moveState = new StateMachine({
      init: 'standing',
      transitions: [
        { name: 'jump', from: 'standing', to: 'jumping' },
        { name: 'flip', from: ['jumping', 'flipping'], to: 'flipping' },
        { name: 'fall', from: 'standing', to: 'falling' },
        { name: 'touchdown', from: ['jumping', 'flipping', 'falling'], to: 'standing' },
        { name: 'die', from: ['jumping', 'flipping', 'falling', 'standing'], to: 'dead' },
      ],
      methods: {
        onEnterState: (lifecycle) => {
          console.log(lifecycle);
        },
        onJump: () => {
          this.body.setVelocityY(-300);
        },
        onFlip: () => {
          this.body.setVelocityY(-150);
        },
        onDie: () => {
          this.body.setVelocity(0, 0);
          this.body.setAcceleration(0);
        },
      },
    });


    this.movePredicates = {
      jump: () => {
        return this.input.didPressJump;
      },
      flip: () => {
        return this.input.didPressJump;
      },
      fall: () => {
        return !this.body.onFloor();
      },
      touchdown: () => {
        return this.body.onFloor();
      },
    };
  }

  kill() {
    if (this.moveState.can('die')) {
      this.moveState.die();
      this.animeState.die();
      this.emit('died');
    }
  }

  isDead() {
    return this.moveState.is('dead');
  }


  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    this.input.didPressJump = !this.isDead() && Phaser.Input.Keyboard.JustDown(this.w_key);

    if (!this.isDead() && this.a_key.isDown) {
      // this.body.setVelocityX(-250);
      this.body.setAccelerationX(-500);
      this.setFlipX(true);
      this.body.offset.x = 8;
    } else if (!this.isDead() && this.d_key.isDown) {
      // this.body.setVelocityX(250);
      this.body.setAccelerationX(500);
      this.setFlipX(false);
      this.body.offset.x = 12;
    } else {
      this.body.setVelocityX(0);
      this.body.setAccelerationX(0);
    }
    if (this.moveState.is('jumping') || this.moveState.is('flipping')) {
      if (!this.w_key.isDown && this.body.velocity.y < -250) {
        this.body.setVelocityY(-250);
      }
    }

    for (const t of this.moveState.transitions()) {
      if (t in this.movePredicates && this.movePredicates[t]()) {
        this.moveState[t]();
        break;
      }
    }

    for (const t of this.animeState.transitions()) {
      if (t in this.animePredicates && this.animePredicates[t]()) {
        this.animeState[t]();
        break;
      }
    }

  }

}

export default Hero;