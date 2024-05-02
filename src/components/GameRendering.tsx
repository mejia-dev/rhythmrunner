import PlayerObj from "./PlayerObj";
import InputController from "./InputController";
import EnemyObj from "./EnemyObj";
import { ChangeEvent, useState } from "react";
import deathSound from "../assets/audio/492651__rvgerxini__power-down.mp3";

export let globalCanvasCtx: CanvasRenderingContext2D;
export let globalPlatformY: number;
export let globalRenderX: number;
export const globalScoreSet: Set<number> = new Set();


export default function Game() {
  let globalAudioIsPlaying: boolean = false;
  let globalAudioBuffer: AudioBuffer;
  let globalAudioColor: string;
  let globalAudioContext: AudioContext;
  let globalAudioHTMLElement: HTMLMediaElement;
  let globalCanvas: HTMLCanvasElement;
  let globalEnemiesPerLevelDisplay: number = 0;
  let globalEnemyPositionList: { x: number; y: number }[];
  let globalEnemySpawnedList: EnemyObj[] = [];
  let globalEnemyTimer: number = 0;
  let globalEnemyTimerPausedState: number = 0;
  let globalLevelData: { x: number; y: number }[];
  let globalPlayButton: HTMLButtonElement;
  let globalPlayButtonText: HTMLSpanElement;

  const [loading, setLoading] = useState<boolean>(false);

  function handleAudioUpload(event: Event | ChangeEvent): void {
    setLoading(true);
    const blob: any = window.URL || window.webkitURL;
    const file: File | undefined = (event.target as HTMLInputElement)?.files?.[0];
    const fileUrl: string = blob.createObjectURL(file);
    const audioElement: HTMLMediaElement = document.getElementById("audioSource") as HTMLMediaElement;
    document.getElementById("gameSetup")?.classList.add("hidden");
    audioElement.src = fileUrl;

    const fileReader: FileReader = new FileReader();
    fileReader.onload = function () {
      const bufferedAudioArray: ArrayBuffer = this.result as ArrayBuffer;
      initializeAudioTrack(bufferedAudioArray);
    };
    if (file) fileReader.readAsArrayBuffer(file);
  }

  function initializeAudioTrack(bufferedAudioArray: ArrayBuffer): void {
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
    globalPlayButton = document.getElementById("playButton") as HTMLButtonElement;
    globalPlayButtonText = document.getElementById("playButtonText") as HTMLSpanElement;
    globalPlayButton.addEventListener("click", () => {
      if (globalAudioContext.state === "suspended") {
        globalAudioContext.resume();
        globalAudioIsPlaying = true;
        globalCanvas.focus();
      }
      if (globalPlayButton.dataset.playing === "false") {
        globalPlayButtonText.innerText = "Play / Pause";
        globalAudioHTMLElement.play();
        globalAudioIsPlaying = true;
        globalPlayButton.dataset.playing = "true";
        globalCanvas.focus();
      } else if (globalPlayButton.dataset.playing === "true") {
        globalAudioHTMLElement.pause();
        globalAudioIsPlaying = false;
        globalPlayButton.dataset.playing = "false";
        globalCanvas.focus();
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
    const audioData: Float32Array = globalAudioBuffer.getChannelData(0);
    const samplesCount: number = audioData.length;
    const levelWidth: number = globalAudioBuffer.duration * 1000;
    const levelHeight: number = globalCanvas.height;
    let lastEnemyXPos: number = -300;

    globalPlatformY = (globalCanvas.height / 3) * 2
    globalLevelData = [];
    globalEnemyPositionList = [];

    for (let i: number = 0; i < samplesCount; i += Math.floor(samplesCount / levelWidth)) {
      const sample: number = Math.abs(audioData[i]);
      const posX: number = (i / samplesCount) * levelWidth;
      const posY: number = Math.floor(sample * levelHeight) / 2;
      if (posY > 200 && posX > lastEnemyXPos + 400) {
        globalEnemyPositionList.push({ x: posX, y: globalPlatformY - 50 });
        lastEnemyXPos = posX;
      }
      // if (posY > 200) {
      //   globalEnemyPositionList.push({ x: posX, y: globalPlatformY - 50 });
      //   lastEnemyXPos = posX;
      // }
      globalLevelData.push({ x: posX, y: levelHeight - posY });
    }
  }

  function startCanvas(): void {
    setInterval(() => {
      globalEnemyTimer++;
    }, 1000);
    const p1InputController: InputController = new InputController();
    const player1: PlayerObj = new PlayerObj(p1InputController);

    player1.position.x = globalCanvas.width / 2 - 200;
    preLoadEnemies();

    const targetFPS: number = 60;
    const frame_interval: number = 1000 / targetFPS;
    let deltaTime: number = 0;
    let deltaTimeMultiplier: number = 1;
    let previousTime: number = performance.now();

    setLoading(false);
    document.getElementById("gameButtons")?.classList.remove("hidden");

    globalRenderX = 0;
    globalCanvasCtx.fillStyle = "black";
    globalCanvasCtx.fillRect(0, 0, globalCanvas.width, globalCanvas.height);
    globalCanvasCtx.fillStyle = "white";
    globalCanvasCtx.font = "40px Audiowide";
    globalCanvasCtx.textAlign = "center";
    globalCanvasCtx.fillText("Press Play to Start", globalCanvas.width / 2, globalCanvas.height / 2);


    requestAnimationFrame(gameLoop);

    function gameLoop(timestamp: number): void {
      // checkEnemySpawn();
      if (globalAudioIsPlaying) {
        deltaTime = timestamp - previousTime;
        deltaTimeMultiplier = deltaTime / frame_interval;
        resetCanvas();
        updateGlobalAudioColor();
        drawPlatform();
        drawLevel(deltaTimeMultiplier);
        player1.requestUpdate(deltaTimeMultiplier);
        updateSpawnedEnemies(deltaTimeMultiplier);
        handleWin();
        handleLose();
        drawHUD();
        updateRenderX();
        previousTime = timestamp;
      }
      requestAnimationFrame(gameLoop);
    }

    function resetCanvas(): void {
      globalCanvasCtx.clearRect(0, 0, globalCanvas.width, globalCanvas.height);
      globalCanvasCtx.fillStyle = "black";
      globalCanvasCtx.fillRect(0, 0, globalCanvas.width, globalCanvas.height);
    }

    function updateGlobalAudioColor(): void {
      const colorIndex: number = Math.floor((globalRenderX / globalLevelData.length) * 255);
      globalAudioColor = `rgb(${colorIndex}, ${(255 - colorIndex)}, ${(128 + colorIndex)})`;
      document.getElementById("logoText")?.style.setProperty("color", globalAudioColor)
    }

    function drawPlatform(): void {
      globalCanvasCtx.fillStyle = globalAudioColor;
      globalCanvasCtx.fillRect(0, globalPlatformY, globalCanvas.width, 3);
    }

    function drawLevel(deltaTimeMultiplier: number): void {
      globalCanvasCtx.beginPath();
      globalCanvasCtx.strokeStyle = globalAudioColor;
      globalCanvasCtx.moveTo(globalLevelData[0].x - globalRenderX, globalLevelData[0].y);
      for (let i: number = 1; i < globalLevelData.length; i++) {
        globalCanvasCtx.lineTo((globalLevelData[i].x - globalRenderX) * deltaTimeMultiplier, globalLevelData[i].y);
      }
      globalCanvasCtx.stroke();
    }

    function preLoadEnemies(): void {
      globalEnemyPositionList.forEach(kvp => {
        const newEnemy = new EnemyObj(globalCanvas.width, globalPlatformY - 50, kvp.x);
        globalEnemySpawnedList.push(newEnemy);
      });

      const maxEnemyLimit: number = Math.round((globalAudioBuffer.duration / 50) * 75);
      
      // reduceEnemiesByNThousand(10);
      reduceEnemiesByNThousand(5);
      // reduceEnemiesByNThousand(2);

      if (globalEnemySpawnedList.length > maxEnemyLimit) {
        console.log("This needs to be reduced! Enemy limit for this track is " + maxEnemyLimit + ", but " + globalEnemySpawnedList.length + " were generated!")
        const numberToRemove: number = globalEnemySpawnedList.length - maxEnemyLimit;
        const enemyReducer: number = Math.round(globalEnemySpawnedList.length / numberToRemove);
        console.log("Reducing by " + enemyReducer);
        console.log(numberToRemove)
        // const reducedEnemySpawnedList: EnemyObj[] = [];
        for (let i: number = 0; i < globalEnemySpawnedList.length; i = i + enemyReducer) {
          globalEnemySpawnedList.splice(i, 1);
          // reducedEnemySpawnedList.push();
        }
        globalEnemiesPerLevelDisplay = globalEnemySpawnedList.length;

        
      } else {
        console.log("All good! Enemy limit for this track is " + maxEnemyLimit + ", and only " + globalEnemySpawnedList.length + " were generated")
      }
      


      





      console.log("Final enemy count: " + globalEnemySpawnedList.length)
    }

    function reduceEnemiesByNThousand(multiplier: number): void {
      const thousandValue: number = multiplier * 1000
      if (globalEnemySpawnedList.length > thousandValue) {
        console.log("true: " + globalEnemySpawnedList.length + " is greater than " + thousandValue)
        const reducedEnemySpawnedList: EnemyObj[] = [];
        for (let i: number = 0; i < globalEnemySpawnedList.length; i = i + multiplier) {
          reducedEnemySpawnedList.push(globalEnemySpawnedList[i]);
        }
        console.log(multiplier + "th-reduced Enemies: " + reducedEnemySpawnedList.length)
        globalEnemySpawnedList = reducedEnemySpawnedList;
      }
    }

    function checkEnemySpawn(): void {
      if (!globalAudioIsPlaying) {
        globalEnemyTimer = globalEnemyTimerPausedState;
        return;
      }
      globalEnemyTimerPausedState = globalEnemyTimer;
      // if (globalEnemyTimer === 3) {
      //   globalEnemyTimer = 0;
      globalEnemyPositionList.forEach(kvp => {
        if (kvp.x >= globalRenderX && kvp.x <= globalRenderX + globalCanvas.width && !globalEnemySpawnedList.some((enemy: EnemyObj) => enemy.xPositionOnTrack != kvp.x)) {
          const newEnemy = new EnemyObj(globalCanvas.width, globalPlatformY - 50, kvp.x);

          globalEnemySpawnedList.push(newEnemy);

        }
      });
      // }
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
          globalScoreSet.add(enemy.xPositionOnTrack)
          player1.updateScore();
          enemy.readyForDeletion = true;
        }
      });
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
        globalCanvasCtx.font = "40px Audiowide";
        globalCanvasCtx.textAlign = "center";
        globalCanvasCtx.fillText("You Win", globalCanvas.width / 2, (globalCanvas.height / 2) - 40);
        globalCanvasCtx.fillStyle = "white";
        globalCanvasCtx.font = "20px Audiowide";
        globalCanvasCtx.textAlign = "center";
        globalCanvasCtx.fillText(`Your score: ${player1.score} `, globalCanvas.width / 2, (globalCanvas.height / 2));
        globalRenderX += 250;
        if (player1.position.x < globalCanvas.width) {
          player1.position.x += 9;
        } else {
          freezeGame();
          setTimeout(resetGame, 500);
        }
      }
    }

    function handleLose(): void {
      if (player1.lives <= 0) {
        freezeGame();
        globalCanvasCtx.fillStyle = "white";
        globalCanvasCtx.font = "40px Audiowide";
        globalCanvasCtx.textAlign = "center";
        globalCanvasCtx.fillText("You Lose", globalCanvas.width / 2, globalCanvas.height / 2);
        const loseSound: HTMLAudioElement = new Audio(deathSound);
        loseSound.play();
        setTimeout(resetGame, 500);
      }
    }

    function freezeGame(): void {
      globalAudioHTMLElement.pause();
      globalAudioIsPlaying = false;
      globalPlayButton.dataset.playing = "false";
    }

    function resetGame(): void {
      globalPlayButtonText.innerText = "Retry Track";
      player1.position.x = globalCanvas.width / 2 - 200;
      player1.reset();
      globalEnemySpawnedList = [];
      preLoadEnemies();
      globalEnemyTimerPausedState = 0;
      globalRenderX = 0;
      globalAudioHTMLElement.currentTime = 0;
    }

    function drawHUD(): void {
      globalCanvasCtx.fillStyle = "white";
      globalCanvasCtx.font = "20px Audiowide";
      globalCanvasCtx.fillText(`Score: ${player1.score}`, 70, 70);
      globalCanvasCtx.fillText(`Points Possible: ${globalEnemiesPerLevelDisplay}`, 650, 40);
      if (player1.lives < 2) {
        globalCanvasCtx.fillStyle = "red";
      }
      globalCanvasCtx.fillText(`Lives: ${player1.lives}`, 70, 40);
    }

    function updateRenderX(): void {
      if (globalRenderX < globalLevelData.length) {
        const visualOffsetInMs: number = 250;
        const progressPercentage: number = globalAudioHTMLElement.currentTime / globalAudioBuffer.duration;
        const audioTimeVis: number = progressPercentage * globalLevelData[globalLevelData.length - 1].x;
        const offsetAudioTime: number = audioTimeVis - visualOffsetInMs;
        globalRenderX = Math.max(offsetAudioTime, 0);
      }
    }
  }

  return (
    <>
      <h1 id="logoText">Rhythm Runner</h1>
      <hr />
      <br />
      <div id="gameSetup">
        <p>Upload an audio file to play:</p>
        <input
          type="file"
          accept="audio/*"
          id="audioFile"
          onChange={handleAudioUpload}
        />
        <audio id="audioSource" />
      </div>

      {loading && (
        <p>Loading...</p>
      )}

      <div id="gameButtons" className="hidden">
        <button id="playButton" data-playing="false" role="switch" aria-checked="false">
          <span id="playButtonText">Play / Pause</span>
        </button>

        <button id="changeTrackButton" aria-checked="false" onClick={() => location.reload()}>
          <span>Change Track</span>
        </button>
        <br /><br />
      </div>


      <canvas id="playArea" width="800" height="600" tabIndex={0} />
    </>
  )
}