import { createGame } from "./game/Game.js";
import { createUI } from "./ui/UI.js";

const ui = createUI();
const game = createGame({ onScore: ui.setScore, onState: ui.setMessage });
ui.bindStart(game.flap);
window.addEventListener("keydown", e => { if (e.code === "Space") { e.preventDefault(); game.flap(); } });
window.addEventListener("pointerdown", game.flap);
