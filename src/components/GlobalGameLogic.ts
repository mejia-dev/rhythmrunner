
let globalCanvas: HTMLCanvasElement;
export let globalCanvasCtx: CanvasRenderingContext2D;
let globalEnemyPositionList;
let globalEnemySpawnedList = [];
let globalEnemySpawnInterval;
let globalEnemyTimer = 0;
let globalEnemyTimerPausedState = 0;
export let globalScoreSet: Set<string> = new Set();
export const globalGravity: number = 0.8;
let globalLastTimestamp = 0;
export let globalLevelData: { x: number; y: number }[];
export let globalRenderX: number;
export let globalPlatformY: number;
export let globalPreviousRenderX: number;

let globalAudioBuffer: AudioBuffer;
let globalAudioContext: AudioContext;
let globalAudioHTMLElement: HTMLMediaElement;
let globalAudioIsPlaying: boolean = false;


export function handleAudioUpload(event: Event): void {
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
  globalCanvas = document.getElementById("visualizer") as HTMLCanvasElement;
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
  globalRenderX = 0;
  globalCanvasCtx.fillStyle = "black";
  globalCanvasCtx.fillRect(0, 0, globalCanvas.width, globalCanvas.height);
  // player1.position.x = globalCanvas.width / 2 - 50;
  globalEnemySpawnInterval = setInterval(() => {
    globalEnemyTimer++;
  }, 1000);
}