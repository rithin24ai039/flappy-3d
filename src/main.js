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
  const menuOpen = document.body.classList.contains("menu-open");
  if (menuOpen) {
    // Enter is the keyboard equivalent of the retry button on the Game Over screen.
    const gameOverVisible = !document.querySelector("#gameOver")?.classList.contains("hidden");
    if (event.code === "Enter" && gameOverVisible) {
      event.preventDefault();
      game.restart();
      return;
    }
    // All other gameplay keys are ignored while a menu/settings screen is visible.
    if (event.code === "Space" || event.code === "ArrowUp" || event.code === "Enter") {
      event.preventDefault();
    }
    return;
  }
  if (event.code === "Space" || event.code === "ArrowUp") {
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
  if (document.body.classList.contains("menu-open")) return;
  if (event.button !== undefined && event.button !== 0) return;
  event.preventDefault();
  game.flap();
}, { passive: false });

ui.showStart();
