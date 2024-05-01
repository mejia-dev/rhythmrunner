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
    globalCanvasCtx.fillStyle = "red";
    globalCanvasCtx.fillRect(this.position.x, this.position.y, this.width, this.height);
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