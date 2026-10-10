import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { createBird } from "./Bird.js";
import { createPipes } from "./Pipes.js";
import { PHYSICS } from "./constants.js";
import { createEnvironment } from "./Environment.js";

export function createGame({onScore,onTime,onState,onGameOver,onStart,onPause,onResume,onHome,onSound,onCountdown}) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 0, 12);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  Object.assign(renderer.domElement.style, {
    position: "fixed", inset: "0", width: "100%", height: "100%",
    zIndex: "0", touchAction: "none", outline: "none"
  });
  renderer.domElement.setAttribute("aria-label", "Tap or click to flap");
  (document.querySelector("#game") || document.body).appendChild(renderer.domElement);

  const environment = createEnvironment(scene);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 0.8));
  const bird = createBird(scene);
  const pipes = createPipes(scene);
  const clock = new THREE.Clock();
  let velocity = 0, running = false, paused = false, started = false, score = 0;
  let elapsedSeconds = 0, lastReportedSecond = -1;
  let countdownActive = false, countdownTimeout = null, countdownToken = 0;
  let soundEnabled = true;
  let audioContext;

  function playTone(frequency, duration = 0.07, type = "sine") {
    if (!soundEnabled) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext.state === "suspended") audioContext.resume();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      gain.gain.setValueAtTime(0.045, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
      oscillator.connect(gain); gain.connect(audioContext.destination);
      oscillator.start(); oscillator.stop(audioContext.currentTime + duration);
    } catch {}
  }
  function reset() {
    velocity = 0; score = 0;
    elapsedSeconds = 0; lastReportedSecond = -1;
    onTime?.(0);
    bird.mesh.position.set(0, 0, 0);
    pipes.reset();
    onScore(0);
    onState("");
  }
  function start() {
    if (running || countdownActive) return;
    if (countdownTimeout !== null) clearTimeout(countdownTimeout);
    const token = ++countdownToken;
    reset();
    started = true; paused = false; running = false; countdownActive = true;
    onStart?.();
    playTone(520, 0.09, "triangle");

    const countdownStep = value => {
      if (token !== countdownToken || !countdownActive) return;
      if (value > 0) {
        onCountdown?.(String(value));
        countdownTimeout = setTimeout(() => countdownStep(value - 1), 1000);
        return;
      }
      onCountdown?.("GO!");
      countdownTimeout = setTimeout(() => {
        if (token !== countdownToken || !countdownActive) return;
        countdownActive = false;
        countdownTimeout = null;
        onCountdown?.(null);
        running = true;
        clock.getDelta();
      }, 450);
    };
    countdownStep(3);
  }
  function flap() {
    if (!running || paused) return;
    velocity = PHYSICS.FLAP;
    playTone(720, 0.055, "sine");
  }
  function pause() {
    if (countdownActive) {
      countdownActive = false;
      countdownToken++;
      if (countdownTimeout !== null) clearTimeout(countdownTimeout);
      countdownTimeout = null;
      onCountdown?.(null);
      paused = true;
      onPause?.();
      return;
    }
    if (!running) return;
    running = false; paused = true;
    onPause?.();
  }
  function resume() {
    if (!paused) return;
    paused = false;
    onResume?.();
    start();
  }
  function home() {
    running = false; paused = false; started = false; countdownActive = false;
    countdownToken++;
    if (countdownTimeout !== null) clearTimeout(countdownTimeout);
    countdownTimeout = null;
    onCountdown?.(null);
    reset();
    onHome?.();
  }
  function restart() { start(); }
  function end() {
    if (!running) return;
    running = false; paused = false;
    playTone(180, 0.22, "sawtooth");
    onState("");
    onGameOver?.(score);
  }
  function update() {
    const delta = Math.min(clock.getDelta(), 0.05);
    environment.update(delta, running);
    if (running) {
      elapsedSeconds += delta;
      const wholeSeconds = Math.floor(elapsedSeconds);
      if (wholeSeconds !== lastReportedSecond) {
        lastReportedSecond = wholeSeconds;
        onTime?.(wholeSeconds);
      }
      velocity -= PHYSICS.GRAVITY;
      bird.mesh.position.y += velocity;
      bird.animate(delta, velocity);
      if (Math.abs(bird.mesh.position.y) > 5) end();
      const result = pipes.update(bird.mesh.position, score);
      if (result.hit) end();
      if (result.scored) {
        score++;
        onScore(score);
        playTone(900, 0.045, "triangle");
      }
    } else if (!started) {
      bird.mesh.position.y = Math.sin(performance.now() * 0.0018) * 0.16;
      bird.animate(delta, 0.02);
    }
    renderer.render(scene, camera);
    requestAnimationFrame(update);
  }
  addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  });
  reset();
  update();
  return {
    flap, start, pause, resume, home, restart,
    setSoundEnabled(enabled) { soundEnabled = enabled; onSound?.(enabled); }
  };
}
