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
window.addEventListener("keydown", e => {
  if (e.code === "Space") { e.preventDefault(); game.flap(); }
});
window.addEventListener("pointerdown", e => {
  if (e.target.closest("#game")) game.flap();
});
