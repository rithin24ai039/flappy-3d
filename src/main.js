import { createGame } from "./game/Game.js";
import { createUI } from "./ui/UI.js";

const ui = createUI();
const game = createGame({
  onScore: ui.setScore,
  onState: ui.setMessage,
  onGameOver: ui.showGameOver,
  onStart: ui.hideGameOver
});

const flap = event => {
  event?.preventDefault?.();
  game.flap();
};

window.addEventListener("keydown", event => {
  if (event.code === "Space") flap(event);
});

// Touch events are kept explicitly for mobile browser compatibility.
document.addEventListener("touchstart", flap, { passive: false });
document.addEventListener("mousedown", flap);
document.addEventListener("pointerdown", flap, { passive: false });
