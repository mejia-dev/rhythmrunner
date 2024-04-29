export default class InputController {
  jump: {pressed: boolean}
  pause: {pressed: boolean}

  constructor() {
    this.jump = {
      pressed: false
    }
    this.pause = {
      pressed: false
    }
    window.addEventListener('keydown', (event: KeyboardEvent) => {
      switch (event.key) {
        case 'w':
          this.jump.pressed = true;
          break;
        case ' ':
          this.jump.pressed = true;
          break;
        case 'ArrowUp':
          this.jump.pressed = true;
          break;
      }
    })
    window.addEventListener('keyup', (event: KeyboardEvent) => {
      switch (event.key) {
        case 'w':
          this.jump.pressed = false;
          break;
        case ' ':
          this.jump.pressed = false;
          break;
        case 'ArrowUp':
          this.jump.pressed = false;
          break;
      }
    })
  }
}