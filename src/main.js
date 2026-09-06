import { createGame } from "./game/Game.js";
import { createUI } from "./ui/UI.js";

const ui = createUI();
const game = createGame({
  onScore: ui.setScore,
  onState: ui.setMessage,
  onGameOver: ui.showGameOver,
  onStart: ui.hideGameOver
});

ui.bindStart(game.flap);

// Keyboard
window.addEventListener("keydown", event => {
  if (event.code === "Space") {
    event.preventDefault();
    game.flap();
  }
});

// Mobile + desktop: one primary press handler.
// Preventing the default touch action stops accidental scrolling/zooming.
window.addEventListener("pointerdown", event => {
  if (event.pointerType === "touch" || event.pointerType === "mouse") {
    event.preventDefault();
    game.flap();
  }
}, { passive: false });
