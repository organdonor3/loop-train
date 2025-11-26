import React, { useState } from 'react';
import { useGameStore } from '../game/state';
import HUD from './HUD';
import CardSelection from './CardSelection';
import Glossary from './Glossary';
import GameOver from './GameOver';
import { BookOpen, Gauge, Volume2, VolumeX } from 'lucide-react';
import DebugMenu from './DebugMenu';
import SetupScreen from './SetupScreen';
import { audioManager } from '../game/core/Audio';

function MuteButton() {
    const [isMuted, setIsMuted] = useState(audioManager.isMuted);

    const toggle = () => {
        const newState = audioManager.toggleMute();
        setIsMuted(newState);
    };

    return (
        <button
            onClick={toggle}
            className={`p-2 rounded-lg flex items-center justify-center transition-colors ${!isMuted
                ? 'hover:bg-slate-700 text-slate-400 hover:text-slate-200'
                : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                }`}
            title={isMuted ? "Unmute" : "Mute"}
        >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
    );
}

export default function GameUI({ gameInstance }) {
    const gameState = useGameStore(state => state.gameState);
    const setGameState = useGameStore(state => state.setGameState);
    const [showGlossary, setShowGlossary] = useState(false);
    const [showDebug, setShowDebug] = useState(false);

    const handleCardSelect = (card) => {
        if (gameInstance) {
            gameInstance.selectCard(card);
        }
    };

    const handleStart = (engine, wagon, difficulty) => {
        if (gameInstance) {
            gameInstance.startGame(engine, wagon, difficulty);
        }
    };

    const toggleGlossary = () => {
        if (showGlossary) {
            setShowGlossary(false);
            setGameState('PLAY');
        } else {
            setShowGlossary(true);
            setGameState('GLOSSARY');
        }
    };

    // Toggle Debug with '`' key
    React.useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === '`') setShowDebug(prev => !prev);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const cameraMode = useGameStore(state => state.cameraMode);

    return (
        <div className="w-full h-full relative font-mono">
            {gameState !== 'SETUP' && <HUD />}

            {gameState !== 'SETUP' && (
                <div className="absolute top-4 right-4 flex flex-col gap-2 z-40 items-end pointer-events-auto">
                    <div className="flex gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-700 backdrop-blur-sm">
                        <button
                            onClick={() => gameInstance?.toggleCamera()}
                            className={`p-2 rounded-lg flex items-center justify-center transition-colors ${cameraMode === 'birdseye'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                                : 'hover:bg-slate-700 text-slate-400 hover:text-slate-200'
                                }`}
                            title="Toggle Camera"
                        >
                            <Gauge className="w-5 h-5" />
                        </button>
                        <div className="w-px bg-slate-700 my-1"></div>
                        <button
                            onClick={toggleGlossary}
                            className={`p-2 rounded-lg flex items-center justify-center transition-colors ${showGlossary
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                                : 'hover:bg-slate-700 text-slate-400 hover:text-slate-200'
                                }`}
                            title="Manual"
                        >
                            <BookOpen className="w-5 h-5" />
                        </button>
                        <div className="w-px bg-slate-700 my-1"></div>
                        <MuteButton />
                    </div>
                </div>
            )}

            {/* Overlays */}
            {gameState === 'SETUP' && <SetupScreen onStart={handleStart} />}
            {gameState === 'LEVEL_UP' && <CardSelection onSelect={handleCardSelect} />}
            {gameState === 'GAMEOVER' && <GameOver />}
            {showGlossary && <Glossary onClose={toggleGlossary} />}

            {showDebug && <DebugMenu gameInstance={gameInstance} />}
        </div>
    );
}
