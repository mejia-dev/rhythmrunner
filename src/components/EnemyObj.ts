import { globalCanvasCtx, globalRenderX } from "./GameRendering";

export default class EnemyObj {
  width: number;
  height: number;
  isAlive: boolean;
  readyForDeletion: boolean;
  xPositionOnTrack: number
  position: { x: number, y: number }

  constructor(spawnX: number, spawnY: number, xPosOnTrack: number) {
    this.width = 50;
    this.height = 50;
    this.isAlive = true;
    this.readyForDeletion = false;
    this.xPositionOnTrack = xPosOnTrack
    this.position = {
      x: spawnX,
      y: spawnY
    }
  }

  draw() {
    const halfWidth = this.width / 2;
    const halfHeight = this.height / 2;
    globalCanvasCtx.fillStyle = "red";
    globalCanvasCtx.beginPath();
    globalCanvasCtx.moveTo(this.position.x, this.position.y + halfHeight);
    globalCanvasCtx.lineTo(this.position.x + halfWidth, this.position.y - halfHeight);
    globalCanvasCtx.lineTo(this.position.x + this.width, this.position.y + halfHeight);
    globalCanvasCtx.closePath();
    globalCanvasCtx.fill();
  }

  updatePosition(deltaTimeMultiplier: number): void {
    this.position.x = (this.xPositionOnTrack - globalRenderX) * deltaTimeMultiplier;
  }

  requestUpdate(deltaTimeMultiplier: number): void {
    this.updatePosition(deltaTimeMultiplier);
    if (this.isAlive) {
      this.draw();
    }
  }
}