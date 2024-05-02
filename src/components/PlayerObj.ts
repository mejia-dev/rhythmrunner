import InputController from "./InputController";
import { globalCanvasCtx, globalPlatformY, globalScoreSet } from "./GameRendering";
import spritesheet from "../assets/img/robo_sprite_sheet.png";

const playerSpriteSheet: HTMLImageElement = new Image();
playerSpriteSheet.src = spritesheet;
const spriteHeight: number = 72;
const spriteWidth: number = 64;
let animationFrame: number = 0;
let frameXPos: number = 0;

export default class PlayerObj {
  inputController: InputController
  width: number;
  height: number;
  jumpHeight: number;
  canDoubleJump: boolean;
  isGrounded: boolean;
  score: number;
  lives: number;
  gravity: number;
  isInvincible: boolean;
  position: { x: number, y: number }
  velocity: { y: number }

  constructor(playerInputController: InputController) {
    this.inputController = playerInputController;
    this.width = 47;
    this.height = 50;
    this.jumpHeight = 15;
    this.canDoubleJump = false;
    this.isGrounded = true;
    this.score = 0;
    this.lives = 3;
    this.gravity = 1.3;
    this.isInvincible = false;
    this.position = {
      x: 0,
      y: 0
    }
    this.velocity = {
      y: 0
    }
  }

  draw(deltaTimeMultiplier: number): void {
    if (this.isInvincible) {
      globalCanvasCtx.shadowBlur = 15;
      globalCanvasCtx.shadowColor = "red";
    }

    frameXPos = spriteWidth + (spriteWidth * Math.floor(animationFrame))

    globalCanvasCtx.drawImage(playerSpriteSheet, 8 + frameXPos, 0, spriteWidth, spriteHeight, this.position.x, this.position.y, this.width, this.height)
    
    animationFrame += 0.60 * deltaTimeMultiplier;
    if (animationFrame >= 7) animationFrame = -1;

    globalCanvasCtx.shadowBlur = 0;
  }

  checkJump(): void {
    if (this.isGrounded) {
      this.canDoubleJump = false;
    }

    if (this.inputController.jump.pressed) {
      if (this.isGrounded) {
        this.velocity.y = -this.jumpHeight;
        this.canDoubleJump = true;
      }
    }
    if (this.inputController.jump.pressed && this.velocity.y > 0 && this.canDoubleJump) {
      this.velocity.y = -this.jumpHeight;
      this.canDoubleJump = false;
    }
  }

  enforceGravity(deltaTimeMultiplier: number): void {
    this.position.y = this.position.y + this.velocity.y * deltaTimeMultiplier;
    this.velocity.y = this.velocity.y + this.gravity * deltaTimeMultiplier;

    if (this.position.y + this.height >= globalPlatformY) {
      this.position.y = globalPlatformY - this.height;
      this.velocity.y = 0;
      this.isGrounded = true;
    } else {
      this.isGrounded = false;
    }
  }

  updateScore(): void {
    this.score = globalScoreSet.size;
  }

  takeDamage(attackDamage: number): void {
    if (!this.isInvincible) {
      this.lives -= attackDamage;
      this.isInvincible = true;
      const removeTempInvincibility = () => {
        this.isInvincible = false;
      }
      setTimeout(removeTempInvincibility, 3000);
    }
  }

  reset(): void {
    this.lives = 3;
    this.score = 0;
    globalScoreSet.clear();
  }

  requestUpdate(deltaTimeMultiplier: number): void {
    this.checkJump();
    this.enforceGravity(deltaTimeMultiplier);
    this.draw(deltaTimeMultiplier);
  }
}
