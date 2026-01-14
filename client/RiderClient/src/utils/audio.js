let unlocked = false;
let listenersAttached = false;
const pending = [];

const isUserActivated = () => {
  try {
    const ua = navigator.userActivation;
    return !!(ua && (ua.isActive || ua.hasBeenActive));
  } catch {
    return false;
  }
};

const removeInteractionListeners = () => {
  if (!listenersAttached) return;
  listenersAttached = false;
  window.removeEventListener('pointerdown', onFirstInteraction, true);
  window.removeEventListener('click', onFirstInteraction, true);
  window.removeEventListener('touchstart', onFirstInteraction, true);
  window.removeEventListener('keydown', onFirstInteraction, true);
};

const flushPending = () => {
  const toPlay = pending.splice(0, pending.length);
  toPlay.forEach(({ url, volume }) => {
    try {
      const audio = new Audio(url);
      audio.volume = typeof volume === 'number' ? volume : 0.7;
      audio.play().catch(() => {});
    } catch {
      // ignore
    }
  });
};

function onFirstInteraction() {
  unlocked = true;
  removeInteractionListeners();
  flushPending();
}

const ensureInteractionListeners = () => {
  if (listenersAttached || unlocked) return;
  listenersAttached = true;
  window.addEventListener('pointerdown', onFirstInteraction, true);
  window.addEventListener('click', onFirstInteraction, true);
  window.addEventListener('touchstart', onFirstInteraction, true);
  window.addEventListener('keydown', onFirstInteraction, true);
};

export const playSound = async (url, volume = 0.7) => {
  if (unlocked || isUserActivated()) {
    try {
      const audio = new Audio(url);
      audio.volume = volume;
      await audio.play();
      unlocked = true;
      return true;
    } catch (e) {
      if (e && (e.name === 'NotAllowedError' || e.code === 0)) {
        pending.push({ url, volume });
        ensureInteractionListeners();
        return false;
      }
      throw e;
    }
  }
  pending.push({ url, volume });
  ensureInteractionListeners();
  return false;
};

export const enableSoundManually = () => {
  unlocked = true;
  removeInteractionListeners();
  flushPending();
};

export const isSoundUnlocked = () => unlocked || isUserActivated();
