import { create } from 'zustand';

export const useGameStore = create((set) => ({
    // UI State
    hp: 100,
    maxHp: 100,
    scrap: 100,
    wave: 1,
    level: 1,
    xp: 0,
    maxXp: 100,
    wagonCount: 0,
    maxWagonCount: 0,
    ownedWagons: [], // { id, level }
    speed: 0,
    gear: 0,
    waveTimer: 0,
    waveDuration: 1800,
    gameState: 'PLAY', // PLAY, LEVEL_UP, GLOSSARY, GAMEOVER

    // Actions called by Game Loop
    setStats: (stats) => set((state) => ({ ...state, ...stats })),
    setGameState: (newState) => set({ gameState: newState }),

    // Actions called by UI
    rerollCost: 50,
    increaseRerollCost: () => set((state) => ({ rerollCost: state.rerollCost + 50 })),
}));
