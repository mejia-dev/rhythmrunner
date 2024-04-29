import InputController from "./InputController";
import { globalCanvasCtx, globalGravity, globalPlatformY, globalScoreSet } from "./GlobalGameLogic";


export default class PlayerObj {

  inputController: InputController
  width: number;
  height: number;
  jumpHeight: number;
  canDoubleJump: boolean;
  isGrounded: boolean;
  score: number;
  lives: number;
  isInvincible: boolean;
  position: { x: number, y: number }
  velocity: { y: number }

  constructor(playerInputController: InputController) {
    this.inputController = playerInputController;
    this.width = 50;
    this.height = 50;
    this.jumpHeight = 15;
    this.canDoubleJump = false;
    this.isGrounded = true;
    this.score = 0;
    this.lives = 3;
    this.isInvincible = false;
    this.position = {
      x: 0,
      y: 0
    }
    this.velocity = {
      y: 0
    }
  }

  draw(): void {
    if (this.isInvincible) {
      globalCanvasCtx.shadowBlur = 15;
      globalCanvasCtx.shadowColor = "red";
    }
    globalCanvasCtx.fillStyle = "blue";
    globalCanvasCtx.fillRect(this.position.x, this.position.y, this.width, this.height);
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
    this.velocity.y = this.velocity.y + globalGravity * deltaTimeMultiplier;

    if (this.position.y + this.height >= globalPlatformY) {
      this.position.y = globalPlatformY - this.height;
      this.velocity.y = 0;
      this.isGrounded = true;
    } else {
      this.isGrounded = false;
    }
  }

  updateScore() {
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

  requestUpdate(deltaTimeMultiplier: number): void {
    this.checkJump();
    this.enforceGravity(deltaTimeMultiplier);
    this.draw();
  }
}
