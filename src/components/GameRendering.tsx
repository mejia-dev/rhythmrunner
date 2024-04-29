import PlayerObj from "./PlayerObj";
import InputController from "./InputController";
// import { globalAudioBuffer, globalAudioHTMLElement, globalAudioIsPlaying, globalCanvas, globalCanvasCtx, globalDoneInitializing, globalLevelData, globalEnemyPositionList, globalPlatformY, globalScoreSet, handleAudioUpload, } from "./GlobalGameLogic";
import EnemyObj from "./EnemyObj";

export let globalCanvas: HTMLCanvasElement;
export let globalCanvasCtx: CanvasRenderingContext2D;
export let globalEnemyPositionList: { x: number; y: number }[];

export let globalScoreSet: Set<string> = new Set();
export const globalGravity: number = 0.8;
export let globalLevelData: { x: number; y: number }[];

export let globalPlatformY: number;

export let globalDoneInitializing: boolean = false;

export let globalAudioBuffer: AudioBuffer;
let globalAudioContext: AudioContext;
export let globalAudioHTMLElement: HTMLMediaElement;
export let globalAudioIsPlaying: boolean = false;



export let globalRenderX: number;
export let globalPreviousRenderX: number;
let globalEnemySpawnedList: EnemyObj[] = [];
let globalEnemyTimer = 0;
let globalEnemyTimerPausedState = 0;
let globalEnemySpawnInterval;

export default function Game() {

  window.onload = () => {
    document.getElementById("audioFile")?.addEventListener("change", handleAudioUpload);
  }

  function handleAudioUpload(event: Event): void {
    let blob: any = window.URL || window.webkitURL;
    const file: any = (event.target as HTMLInputElement)?.files?.[0];
    const fileUrl: string = blob.createObjectURL(file);
    const audioElement: HTMLMediaElement = document.getElementById("audioSource") as HTMLMediaElement;
    audioElement.src = fileUrl;

    const fileReader: FileReader = new FileReader();
    fileReader.onload = function () {
      const bufferedAudioArray: ArrayBuffer = this.result as ArrayBuffer;
      initializeAudioTrack(bufferedAudioArray);
    };
    fileReader.readAsArrayBuffer(file);
  }


  function initializeAudioTrack(bufferedAudioArray: ArrayBuffer): void {
    // globalAudioContext = new (window.AudioContext || window.webkitAudioContext)();
    globalAudioContext = new window.AudioContext();
    globalAudioHTMLElement = document.getElementById("audioSource") as HTMLMediaElement;
    const track = globalAudioContext.createMediaElementSource(globalAudioHTMLElement);
    track.connect(globalAudioContext.destination);
    globalAudioContext.decodeAudioData(bufferedAudioArray, (buffer) => {
      globalAudioBuffer = buffer;

      initializeAudioControls();
      initializeCanvas();
    });
  }

  function initializeAudioControls(): void {
    const playButton: HTMLButtonElement = document.getElementById("playButton") as HTMLButtonElement;
    playButton.addEventListener("click", () => {
      if (globalAudioContext.state === "suspended") {
        globalAudioContext.resume();
        globalAudioIsPlaying = true;
      }
      if (playButton.dataset.playing === "false") {
        globalAudioHTMLElement.play();
        globalAudioIsPlaying = true;
        playButton.dataset.playing = "true";
      } else if (playButton.dataset.playing === "true") {
        globalAudioHTMLElement.pause();
        globalAudioIsPlaying = false;
        playButton.dataset.playing = "false";
      }
    },
      false,
    );
  }

  function initializeCanvas(): void {
    globalCanvas = document.getElementById("playArea") as HTMLCanvasElement;
    globalCanvasCtx = globalCanvas.getContext("2d") as CanvasRenderingContext2D;
    createLevelData();
    startCanvas();
  }

  function createLevelData(): void {
    const audioData = globalAudioBuffer.getChannelData(0);
    const samplesCount = audioData.length;
    const levelWidth = globalAudioBuffer.duration * 1000;
    const levelHeight = globalCanvas.height;

    globalPlatformY = (globalCanvas.height / 3) * 2
    globalLevelData = [];
    globalEnemyPositionList = [];

    for (let i = 0; i < samplesCount; i += Math.floor(samplesCount / levelWidth)) {
      const sample = Math.abs(audioData[i]);
      const posX = (i / samplesCount) * levelWidth;
      const posY = Math.floor(sample * levelHeight) / 2;
      if (posY > 200) {
        // 50 is currently arbitrary representation of final enemy height.
        globalEnemyPositionList.push({ x: posX, y: globalPlatformY - 50 });
      }
      globalLevelData.push({ x: posX, y: levelHeight - posY });
    }
  }

  function startCanvas(): void {
    console.log("recevs")
    globalEnemySpawnInterval = setInterval(() => {
      globalEnemyTimer++;
    }, 1000);

    globalRenderX = 0;
    globalCanvasCtx.fillStyle = "black";
    globalCanvasCtx.fillRect(0, 0, globalCanvas.width, globalCanvas.height);
    globalCanvasCtx.fillStyle = "white";
    globalCanvasCtx.font = "40px Arial";
    globalCanvasCtx.textAlign = "center";
    globalCanvasCtx.fillText("Press Play to Start", globalCanvas.width / 2, globalCanvas.height / 2);

    const p1InputController: InputController = new InputController();
    const player1: PlayerObj = new PlayerObj(p1InputController);

    player1.position.x = globalCanvas.width / 2 - 50;

    const targetFPS: number = 60;
    const frame_interval: number = 1000 / targetFPS;
    let deltaTime: number = 0;
    let deltaTimeMultiplier: number = 1;
    let previousTime: number = performance.now();

    requestAnimationFrame(gameLoop);

    function gameLoop(timestamp: number) {
      checkEnemySpawn();
      if (globalAudioIsPlaying) {
        deltaTime = timestamp - previousTime;
        deltaTimeMultiplier = deltaTime / frame_interval;


        globalCanvasCtx.clearRect(0, 0, globalCanvas.width, globalCanvas.height);
        drawLevel(deltaTimeMultiplier);
        player1.requestUpdate(deltaTimeMultiplier);
        updateSpawnedEnemies(deltaTimeMultiplier);
        drawPlatform();
        handleWin();
        handleLose();
        drawHUD();
        updateRenderX();
        previousTime = timestamp;
      }
      requestAnimationFrame(gameLoop);
    }

    function drawLevel(deltaTimeMultiplier: number): void {
      globalCanvasCtx.clearRect(0, 0, globalCanvas.width, globalCanvas.height);
      globalCanvasCtx.beginPath();

      const colorIndex = Math.floor((globalRenderX / globalLevelData.length) * 255);
      const color = `rgb(${colorIndex}, ${(255 - colorIndex)}, ${(128 + colorIndex)})`;
      globalCanvasCtx.strokeStyle = color;

      globalCanvasCtx.moveTo(globalLevelData[0].x - globalRenderX, globalLevelData[0].y);
      for (let i = 1; i < globalLevelData.length; i++) {
        globalCanvasCtx.lineTo((globalLevelData[i].x - globalRenderX) * deltaTimeMultiplier, globalLevelData[i].y);
      }
      globalCanvasCtx.stroke();
    }

    function updateRenderX(): void {
      if (globalRenderX < globalLevelData.length) {
        // visual Offset milliseconds may need to be adjusted if sprite ever moves. 
        const visualOffsetInMs = 700;
        const progressPercentage = globalAudioHTMLElement.currentTime / globalAudioBuffer.duration;
        const audioTimeVis = progressPercentage * globalLevelData[globalLevelData.length - 1].x;
        const offsetAudioTime = audioTimeVis - visualOffsetInMs;
        globalPreviousRenderX = globalRenderX;
        // using Math.max to ensure that the value does not reverse in the event of it being negative
        globalRenderX = Math.max(offsetAudioTime, 0);
      }
    }

    function checkCollision(
      object1: { position: { x: number, y: number }, width: number, height: number }, object2: { position: { x: number, y: number }, width: number, height: number }
    ): boolean {
      return (
        object1.position.x + object1.width >= object2.position.x &&
        object1.position.y + object1.height >= object2.position.y &&
        object2.position.x + object2.height >= object1.position.x &&
        object2.position.y + object2.height >= object1.position.y
      );
    }

    function handleWin(): void {
      if (globalAudioHTMLElement.currentTime >= globalAudioBuffer.duration) {
        globalCanvasCtx.fillStyle = "white";
        globalCanvasCtx.font = "40px Arial";
        globalCanvasCtx.textAlign = "center";
        globalCanvasCtx.fillText("You Win!", globalCanvas.width / 2, (globalCanvas.height / 2) - 40);
        globalCanvasCtx.fillStyle = "white";
        globalCanvasCtx.font = "20px Arial";
        globalCanvasCtx.textAlign = "center";
        globalCanvasCtx.fillText(`Your score: ${player1.score} `, globalCanvas.width / 2, (globalCanvas.height / 2));
        // you win!
        // your score is: 
      }
    }

    function handleLose(): void {
      if (player1.lives <= 0) {
        globalAudioHTMLElement.pause();
        globalAudioIsPlaying = false;
        globalCanvasCtx.fillStyle = "white";
        globalCanvasCtx.font = "40px Arial";
        globalCanvasCtx.textAlign = "center";
        globalCanvasCtx.fillText("You Lose", globalCanvas.width / 2, globalCanvas.height / 2);
      }
    }

    function checkEnemySpawn(): void {
      if (!globalAudioIsPlaying) {
        globalEnemyTimer = globalEnemyTimerPausedState;
        return;
      }
      globalEnemyTimerPausedState = globalEnemyTimer;

      if (globalEnemyTimer === 3) {
        globalEnemyTimer = 0;
        globalEnemyPositionList.forEach(kvp => {
          if (kvp.x >= globalRenderX && kvp.x <= globalRenderX + globalCanvas.width) {
            let newEnemy = new EnemyObj(globalCanvas.width, globalPlatformY - 50);
            globalEnemySpawnedList.push(newEnemy);
          }
        });
      }
    }

    function updateSpawnedEnemies(deltaTimeMultiplier: number): void {
      globalEnemySpawnedList = globalEnemySpawnedList.filter(enemy => !enemy.readyForDeletion);
      globalEnemySpawnedList.forEach(enemy => {
        enemy.requestUpdate(deltaTimeMultiplier);
        if (checkCollision(player1, enemy)) {
          player1.takeDamage(1);
          enemy.isAlive = false;
          enemy.readyForDeletion = true;
        }
        if (enemy.position.x < 0 - enemy.width) {
          globalScoreSet.add(enemy.id)
          player1.updateScore();
          enemy.readyForDeletion = true;
        }
      });
    }


    function drawHUD(): void {
      globalCanvasCtx.fillStyle = "white";
      globalCanvasCtx.font = "20px Arial";
      globalCanvasCtx.fillText(`Lives: ${player1.lives}`, 50, 30);
      globalCanvasCtx.fillText(`Score: ${ player1.score }`, 50, 60);

      
    }


    // this function draws the platform.
    function drawPlatform(): void {
      globalCanvasCtx.fillStyle = "green";
      globalCanvasCtx.fillRect(0, globalPlatformY, globalCanvas.width, 10);
    }

  }

  return (
    <>
      <h1>Rhythm Runner</h1>

      <input type="file" accept="audio/*" id="audioFile"></input>
      <p id="fileUploadError"></p>
      <audio id="audioSource" src="sample-audio.mp3"></audio>

      <button id="playButton" data-playing="false" role="switch" aria-checked="false">
        <span>Play/Pause</span>
      </button>

      <button id="debugAudioFrameButton">
        <span>Debug Audio Frame</span>
      </button>

      <canvas id="playArea" width="800" height="600"></canvas>
    </>
  )
}