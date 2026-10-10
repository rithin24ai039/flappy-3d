export function createUI() {
  const $ = selector => document.querySelector(selector);
  const score = $("#score");
  const timer = $("#timer");
  const msg = $("#msg");
  const startScreen = $("#startScreen");
  const pauseScreen = $("#pauseScreen");
  const gameOver = $("#gameOver");
  const settingsScreen = $("#settingsScreen");
  const finalScore = $("#finalScore");
  const bestScore = $("#bestScore");
  const newBest = $("#newBest");
  const resultTitle = $("#resultTitle");
  const pauseBtn = $("#pauseBtn");
  const soundBtn = $("#soundBtn");
  const settingsSoundBtn = $("#settingsSoundBtn");
  const motionBtn = $("#motionBtn");
  const countdownOverlay = $("#countdownOverlay");
  const countdownNumber = $("#countdownNumber");

  let best = 0;
  try { best = Number(localStorage.getItem("flappy3d-best") || 0); } catch {}
  let soundEnabled = true;
  let reducedMotion = false;
  let settingsReturn = "start";
  let actions = {};

  const hideScreens = () => {
    [startScreen, pauseScreen, gameOver, settingsScreen].forEach(el => el.classList.add("hidden"));
  };
  const showScreen = screen => {
    hideScreens();
    if (screen) screen.classList.remove("hidden");
    // A visible menu is a modal state: underlying game controls must not receive input.
    document.body.classList.toggle("menu-open", Boolean(screen));
  };
  const setSound = enabled => {
    soundEnabled = enabled;
    [soundBtn, settingsSoundBtn].forEach(button => {
      button.classList.toggle("is-off", !enabled);
    });
    soundBtn.textContent = enabled ? "♫" : "♩";
    soundBtn.setAttribute("aria-label", enabled ? "Turn sound off" : "Turn sound on");
    settingsSoundBtn.textContent = enabled ? "ON" : "OFF";
    settingsSoundBtn.setAttribute("aria-checked", String(enabled));
    actions.onSoundChange?.(enabled);
  };
  const setReducedMotion = enabled => {
    reducedMotion = enabled;
    document.body.classList.toggle("reduced-motion", enabled);
    motionBtn.textContent = enabled ? "ON" : "OFF";
    motionBtn.classList.toggle("is-off", !enabled);
    motionBtn.setAttribute("aria-checked", String(enabled));
  };
  const openSettings = from => {
    settingsReturn = from;
    showScreen(settingsScreen);
  };

  $("#playBtn").addEventListener("click", () => actions.onPlay?.());
  $("#resumeBtn").addEventListener("click", () => actions.onResume?.());
  $("#restartBtn").addEventListener("click", () => actions.onRestart?.());
  $("#pauseBtn").addEventListener("click", () => actions.onPause?.());
  $("#homeBtn").addEventListener("click", () => {
    showScreen(startScreen);
    pauseBtn.classList.add("hidden");
    actions.onHome?.();
  });
  $("#quitBtn").addEventListener("click", () => {
    showScreen(startScreen);
    pauseBtn.classList.add("hidden");
    actions.onHome?.();
  });
  $("#settingsBtn").addEventListener("click", () => openSettings("start"));
  $("#pauseSettingsBtn").addEventListener("click", () => openSettings("pause"));
  $("#closeSettingsBtn").addEventListener("click", () => {
    showScreen(settingsReturn === "pause" ? pauseScreen : startScreen);
  });
  soundBtn.addEventListener("click", () => setSound(!soundEnabled));
  settingsSoundBtn.addEventListener("click", () => setSound(!soundEnabled));
  motionBtn.addEventListener("click", () => setReducedMotion(!reducedMotion));

  // Explicitly show the welcome screen on every fresh page load.
  showScreen(startScreen);
  pauseBtn.classList.add("hidden");

  return {
    setScore(value) { score.textContent = String(value); },
    setTime(totalSeconds) {
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      timer.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    },
    setMessage(value) {
      msg.textContent = value || "";
      msg.classList.toggle("hidden", !value);
    },
    showStart() {
      showScreen(startScreen);
      pauseBtn.classList.add("hidden");
      score.textContent = "0";
    },
    showPlaying() {
      hideScreens();
      document.body.classList.remove("menu-open");
      pauseBtn.classList.remove("hidden");
      msg.classList.add("hidden");
    },
    showCountdown(value) {
      if (!countdownOverlay) return;
      if (value == null) {
        countdownOverlay.classList.add("hidden");
        countdownOverlay.setAttribute("aria-hidden", "true");
        return;
      }
      countdownNumber.textContent = value;
      countdownOverlay.classList.remove("hidden");
      countdownOverlay.setAttribute("aria-hidden", "false");
      countdownOverlay.classList.remove("countdown-pop");
      // Restart the pop animation each time the number changes.
      void countdownNumber.offsetWidth;
      countdownOverlay.classList.add("countdown-pop");
    },
    showPaused() {
      showScreen(pauseScreen);
      pauseBtn.classList.add("hidden");
    },
    showGameOver(value) {
      const isBest = value > best;
      if (isBest) {
        best = value;
        try { localStorage.setItem("flappy3d-best", String(best)); } catch {}
      }
      finalScore.textContent = String(value);
      bestScore.textContent = String(best);
      resultTitle.textContent = isBest && value > 0 ? "New personal best!" : value >= 10 ? "Incredible flight!" : value >= 5 ? "Great flying!" : "Nice try!";
      newBest.textContent = isBest && value > 0 ? "★ NEW PERSONAL BEST" : "";
      showScreen(gameOver);
      pauseBtn.classList.add("hidden");
    },
    hideGameOver() { gameOver.classList.add("hidden"); },
    bindActions(callbacks) { actions = callbacks; },
    isSoundEnabled: () => soundEnabled,
    showScreen
  };
}
