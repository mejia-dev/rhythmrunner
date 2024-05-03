import htpInvincible from "../assets/img/howto-invincible.png";
import htpPlayer from "../assets/img/howto-ramon.png";
import htpSpike from "../assets/img/howto-spike.png";

export default function GameInfo() {
  return (
    <div id="gameInfo">
      <div>
        <h2>How to Play</h2>
        <ul>
          <li>Upload an audio file to begin procedurally generating a level.</li>
          <li>Press the "Play / Pause" button to begin the level.</li>
          <li>Take note of the following objects on-screen:</li>
        </ul>
        <div id="howTo-Screenshots">
          <div className="howTo-singleScreenshot">
            <img src={htpPlayer} width="120px" alt="The player" />
            <h3>The Player</h3>
            <span>The player can jump and double-jump to dodge the audio spikes using the <span id="howTo-MovementKeys">W key, Up Arrow, or Spacebar</span>.</span>
          </div>
          <div className="howTo-singleScreenshot">
            <img src={htpSpike} width="120px" alt="A red spike in the audio that must be dodged" />
            <h3>Audio Spike</h3>
            <span>Any red audio spike will hurt the player if touched, but will count for one point if successfully dodged by the player.</span>
          </div>
          <div className="howTo-singleScreenshot">
            <img src={htpInvincible} width="120px" alt="The player with a three-second invincibility bonus" />
            <h3>3-Second Invincibility</h3>
            <span>If the player has more than one life, a three-second invincibility perk is gained after hitting an enemy.</span>
          </div>
        </div>
        <hr />
      </div>
      <div id="devInfo">
        <p>Copyright (c) 2024 Aaron Mejia.</p>
        <p>View the <a href="https://github.com/mejia-dev/rhythmrunner" target="_blank">GitHub repository</a>.</p>
      </div>
    </div>
  )
}