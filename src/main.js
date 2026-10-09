import { createGame } from "./game/Game.js";
import { createUI } from "./ui/UI.js";

const ui = createUI();
const game = createGame({
  onScore: ui.setScore,
  onState: ui.setMessage,
  onGameOver: ui.showGameOver,
  onStart: ui.showPlaying,
  onPause: ui.showPaused,
  onResume: ui.showPlaying,
  onHome: ui.showStart
});

ui.bindActions({
  onPlay: game.start,
  onPause: game.pause,
  onResume: game.resume,
  onRestart: game.restart,
  onHome: game.home,
  onSoundChange: game.setSoundEnabled
});

window.addEventListener("keydown", event => {
  if (event.code === "Space") {
    event.preventDefault();
    game.flap();
  }
  if (event.code === "Enter") {
    const gameOverVisible = !document.querySelector("#gameOver")?.classList.contains("hidden");
    if (gameOverVisible) {
      event.preventDefault();
      game.restart();
    }
  }
  if (event.code === "Escape" || event.code === "KeyP") {
    event.preventDefault();
    game.pause();
  }
});

const canvas = document.querySelector("#game");
canvas?.addEventListener("pointerdown", event => {
  if (event.button !== undefined && event.button !== 0) return;
  event.preventDefault();
  game.flap();
}, { passive: false });

ui.showStart();
