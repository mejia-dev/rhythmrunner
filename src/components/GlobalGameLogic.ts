let globalAudioBuffer: AudioBuffer;
let globalAudioContext: AudioContext;
let globalAudioHTMLElement: HTMLMediaElement;
let globalAudioIsPlaying: boolean = false;
let globalCanvas;
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


export function handleAudioUpload(event: Event) {
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


function initializeAudioTrack(bufferedAudioArray: ArrayBuffer) {
  // globalAudioContext = new (window.AudioContext || window.webkitAudioContext)();
  globalAudioContext = new window.AudioContext();
  globalAudioHTMLElement = document.getElementById("audioSource") as HTMLMediaElement;
  const track = globalAudioContext.createMediaElementSource(globalAudioHTMLElement);
  track.connect(globalAudioContext.destination);
  globalAudioContext.decodeAudioData(bufferedAudioArray, (buffer) => {
    globalAudioBuffer = buffer;
    
    initializeAudioControls();
    // createLevelData();
    // startCanvas();
  })
}

function initializeAudioControls() {
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