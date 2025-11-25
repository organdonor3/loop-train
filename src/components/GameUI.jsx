import React, { useState } from 'react';
import { useGameStore } from '../game/state';
import HUD from './HUD';
import CardSelection from './CardSelection';
import Glossary from './Glossary';
import GameOver from './GameOver';
import { BookOpen } from 'lucide-react';
import DebugMenu from './DebugMenu';
import SetupScreen from './SetupScreen';

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

    const handleStart = (engine, wagon) => {
        if (gameInstance) {
            gameInstance.startGame(engine, wagon);
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

    return (
        <div className="w-full h-full relative font-mono">
            {gameState !== 'SETUP' && <HUD />}

            {/* Glossary Button */}
            {gameState !== 'SETUP' && (
                <button
                    onClick={toggleGlossary}
                    className="absolute top-4 right-4 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg border border-slate-600 flex items-center gap-2 pointer-events-auto transition-colors z-40"
                >
                    <BookOpen className="w-4 h-4" />
                    MANUAL
                </button>
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
