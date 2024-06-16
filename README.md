<p align="center">
  <img src="./src/assets/img/rr-logo.png" />
  <br/>
  Music-based platformer game.
</p>
<hr />
<h3 align="center"><a href="https://mejia.dev/rhythm-runner/" target="_blank">Click to Play!</a></h3>


## ❔ Description
Upload an audio file, then run through a level generated directly from the audio data while dodging obstacles in your way!

This game was developed in vanilla TypeScript using no external libraries or technologies (outside of React for page rendering). This was created as my capstone project for Epicodus. I was inspired to create a project that combined my passion for game design with my passion for music. For more information, see the Development Log section below.

**Note**: Chromium-based browsers (Chrome, Edge, Brave, etc.) are recommended. Game does not behave consistently in Firefox.


## 🎮 Controls
- **W / SPACE / UP Arrow**: Jump / Double-Jump


## 💻 Technologies Used
- [TypeScript](https://www.typescriptlang.org/)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [React + Vite](https://vitejs.dev/)
- [Visual Studio Code](https://code.visualstudio.com/)


## 🔧 Setup / Installation Steps

#### Required:
- Clone this repository by running the following command from the Git Bash console:
  ```bash
   git clone https://github.com/mejia-dev/rhythmrunner.git
   ```

- Navigate to the project directory:
  ```bash
  cd rhythmrunner
  ```

- Run the following command to install dependencies:
  ```bash
  npm install
  ```

- Once the dependencies install, run the following command to start the development build:
  ```bash
  npm run dev
  ```

- The development server opens at http://localhost:5173/ by default. Navigate to this page in a web browser to play the game.


#### Optional:
- To generate a production build of the game, run: 
  ```bash
  npm run build
  ```

- To run ESLint against the code, run:
  ```bash
  npm run lint
  ```


## 🎞️ Media Credits
- Spritesheet: [16x16 Robot Tileset](https://0x72.itch.io/16x16-robot-tileset) by 0x72.
- Sound Effects: [Freesound](https://freesound.org/)


## 📃 Development Log
The development of this game happened in 120 hours of Epicodus class time. Below is a list of resources in other repositories that display my progress taking the game from a concept into an actual finished project.
- Dec 1, 2023: [Capstone Idea Outline](https://github.com/mejia-dev/epicodus-capstone-planning) - The idea board and subsequent notes in this repository laid the foundational ideas for what I wanted to do for my Capstone.
- Mar 22, 2024: [Timetracker & Development Log](https://github.com/mejia-dev/epicodus-capstone-mvp/blob/main/Timetracker.md) - This is the master devlog for the game, and also how I kept track of the time spent on the project. This file was updated until the very last day of development.
- Mar 25, 2024: [Formal Capstone Proposal](https://github.com/mejia-dev/epicodus-capstone-mvp/blob/main/capstone-proposal.md) - This is my proposal of my Capstone project that I submitted to Epicodus.
- Mar 30, 2024 - Apr 29, 2024: [Development Demos](https://github.com/mejia-dev/epicodus-capstone-mvp/tree/main/demos) - This is a link to some folders containing demos of early versions of the MVP of the game. I kept these around as separate files so that they were easy to quickly inspect.


## ⚠️ Known Bugs
If you see an issue, please report it on the [Issues](https://github.com/mejia-dev/rhythmrunner/issues) page.
- Line 31 of `GameRendering.tsx` uses an `any` variable declaration.
- Player falls back to ground very quickly after resuming from pause.
- Player invincibility glow can stay active after the track is restarted.
- Audio tracks with consistent/ambient low frequencies can cause visualizer and rendering to become glitchy.


## 🗣️ Report an Issue / Give Feedback
Please open an [Issue](https://github.com/mejia-dev/rhythmrunner/issues) to leave feedback or report a bug!


## ⚖️ License

Copyright (C) 2024 Aaron Mejia<br />
Open Source under the [GPLv3 License](./LICENSE.txt).
