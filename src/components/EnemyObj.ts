import { globalCanvasCtx, globalRenderX } from "./GameRendering";

export default class EnemyObj {
  id: string;
  width: number;
  height: number;
  moveSpeed: number
  isAlive: boolean;
  readyForDeletion: boolean;
  xPositionOnTrack: number
  position: { x: number, y: number }

  constructor(spawnX: number, spawnY: number, xPosOnTrack: number) {
    this.id = new Date().toLocaleTimeString();
    this.width = 50;
    this.height = 50;
    this.moveSpeed = 0;
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