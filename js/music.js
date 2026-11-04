(function () {
  "use strict";

  const TRACKS = ["music/fh.mp3", "music/jb.mp3"];
  const audio = document.getElementById("bg-audio");
  const toggleBtn = document.getElementById("music-toggle-btn");
  const spinWrap = document.getElementById("music-spin-wrap");
  const desktopSlot = document.getElementById("music-desktop-slot");
  const pingDot = document.getElementById("music-ping-dot");

  let isPlaying = false;
  let needsInteraction = false;

  // Pilih track random saat load
  audio.src = TRACKS[Math.floor(Math.random() * TRACKS.length)];
  audio.volume = 0.55;

  function updateUI() {
    if (isPlaying) {
      spinWrap.classList.add("animate-spin");
      spinWrap.style.animationDuration = "3s";
      spinWrap.style.animationPlayState = "running";
      if (desktopSlot) {
        desktopSlot.innerHTML = `<i data-lucide="pause" class="w-5 h-5"></i>`;
      }
      pingDot.classList.add("hidden");
    } else {
      spinWrap.style.animationPlayState = "paused";
      if (desktopSlot) {
        desktopSlot.innerHTML = `<i data-lucide="music-2" class="w-5 h-5"></i>`;
      }
      if (needsInteraction) {
        pingDot.classList.remove("hidden");
      } else {
        pingDot.classList.add("hidden");
      }
    }
    if (window.lucide) lucide.createIcons();
  }

  async function tryPlay() {
    if (!audio.src) return;
    try {
      await audio.play();
      isPlaying = true;
      needsInteraction = false;
      updateUI();
    } catch {
      isPlaying = false;
      needsInteraction = true;
      updateUI();
    }
  }

  function toggle() {
    if (audio.paused) {
      tryPlay();
    } else {
      audio.pause();
      isPlaying = false;
      updateUI();
    }
  }

  toggleBtn.addEventListener("click", toggle);

  // Autoplay saat interaksi pertama user (karena browser memblokir audio otomatis tanpa interaksi)
  function onFirstInteract() {
    if (audio.paused) {
      tryPlay();
    }
    window.removeEventListener("click", onFirstInteract);
    window.removeEventListener("touchend", onFirstInteract);
    window.removeEventListener("keydown", onFirstInteract);
  }

  window.addEventListener("click", onFirstInteract, { once: true });
  window.addEventListener("touchend", onFirstInteract, { once: true });
  window.addEventListener("keydown", onFirstInteract, { once: true });

  // Coba putar pertama kali
  tryPlay();
})();
