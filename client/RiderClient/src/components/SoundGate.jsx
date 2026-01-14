import React, { useEffect, useState } from 'react';
import { isSoundUnlocked, enableSoundManually } from '../utils/audio';

const SoundGate = () => {
  const [unlocked, setUnlocked] = useState(isSoundUnlocked());

  useEffect(() => {
    const onFirstUserAction = () => {
      enableSoundManually();
      setUnlocked(true);
      document.removeEventListener('pointerdown', onFirstUserAction, true);
      document.removeEventListener('keydown', onFirstUserAction, true);
      document.removeEventListener('touchstart', onFirstUserAction, true);
    };
    if (!unlocked) {
      document.addEventListener('pointerdown', onFirstUserAction, true);
      document.addEventListener('keydown', onFirstUserAction, true);
      document.addEventListener('touchstart', onFirstUserAction, true);
    }
    return () => {
      document.removeEventListener('pointerdown', onFirstUserAction, true);
      document.removeEventListener('keydown', onFirstUserAction, true);
      document.removeEventListener('touchstart', onFirstUserAction, true);
    };
  }, [unlocked]);

  if (unlocked) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 z-50">
      <div className="bg-blue-600 text-white shadow-lg rounded-lg px-4 py-3 flex items-center justify-between">
        <span className="text-sm">
          Click "Enable Sound" once to play notification audio.
        </span>
        <button
          onClick={() => { enableSoundManually(); setUnlocked(true); }}
          className="ml-3 px-3 py-1.5 bg-white text-blue-700 rounded-md text-sm font-medium hover:bg-blue-50"
        >
          Enable Sound
        </button>
      </div>
    </div>
  );
};

export default SoundGate;
