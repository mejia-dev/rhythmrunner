import { globalCanvasCtx, globalLevelData, globalRenderX, globalPreviousRenderX } from "./GlobalGameLogic";

export default class EnemyObj {
  id: string;
  width: number;
  height: number;
  moveSpeed: number
  isAlive: boolean;
  readyForDeletion: boolean;
  position: { x: number, y: number }

  constructor(spawnX: number, spawnY: number) {
    this.id = new Date().toLocaleTimeString();
    this.width = 50;
    this.height = 50;
    this.moveSpeed = 0;
    this.isAlive = true;
    this.readyForDeletion = false;
    this.position = {
      x: spawnX,
      y: spawnY
    }
  }

  draw() {
    globalCanvasCtx.fillStyle = "red";
    globalCanvasCtx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  updateMoveSpeed(): void {
    const prevLevelX = (globalPreviousRenderX / globalLevelData.length) * globalLevelData[globalLevelData.length - 1].x;
    const currentLevelX = (globalRenderX / globalLevelData.length) * globalLevelData[globalLevelData.length - 1].x;
    this.moveSpeed = (currentLevelX - prevLevelX);
  }

  requestUpdate(deltaTimeMultiplier: number): void {
    this.updateMoveSpeed();
    this.position.x -= this.moveSpeed * deltaTimeMultiplier;
    if (this.isAlive) {
      this.draw();
    }
  }
}