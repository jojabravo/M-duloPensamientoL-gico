
/**
 * Utility to manage and play application sound effects.
 */
export const playSound = (type: 'pop' | 'success' | 'error' | 'finish') => {
  const sounds = {
    pop: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
    success: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3',
    error: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
    finish: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'
  };
  
  const audio = new Audio(sounds[type]);
  audio.volume = 0.4;
  audio.play().catch(() => {
    // Audio might be blocked by browser policy until first interaction
    // We ignore errors to prevent app crashes
  });
};
