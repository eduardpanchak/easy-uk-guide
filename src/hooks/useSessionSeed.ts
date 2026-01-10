import { useMemo } from 'react';

const SESSION_SEED_KEY = 'servicesOrderSeed';

/**
 * Generates or retrieves a session-level randomization seed.
 * The seed is created once per browser session and persists across page navigation.
 * It resets only when the browser tab/window is closed.
 */
export const useSessionSeed = (): number => {
  const seed = useMemo(() => {
    // Check if seed already exists in sessionStorage
    const existingSeed = sessionStorage.getItem(SESSION_SEED_KEY);
    
    if (existingSeed !== null) {
      return parseInt(existingSeed, 10);
    }
    
    // Generate new seed for this session
    const newSeed = Math.floor(Math.random() * 1000000);
    sessionStorage.setItem(SESSION_SEED_KEY, newSeed.toString());
    
    return newSeed;
  }, []);

  return seed;
};

/**
 * Seeded random number generator using a simple LCG algorithm.
 * Produces deterministic "random" numbers based on the seed.
 */
export const seededRandom = (seed: number, index: number): number => {
  const x = Math.sin(seed + index) * 10000;
  return x - Math.floor(x);
};

/**
 * Shuffles an array deterministically based on the provided seed.
 * Same seed + same array = same shuffle result every time.
 */
export const seededShuffle = <T>(array: T[], seed: number): T[] => {
  const result = [...array];
  
  for (let i = result.length - 1; i > 0; i--) {
    const randomValue = seededRandom(seed, i);
    const j = Math.floor(randomValue * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  
  return result;
};
