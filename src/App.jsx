import React, { useEffect, useRef, useState } from 'react';
import Game from './game/Game';
import GameUI from './components/GameUI';

function App() {
    const canvasRef = useRef(null);
    const [gameInstance, setGameInstance] = useState(null);

    const initializingRef = useRef(false);
    const gameRef = useRef(null);

    useEffect(() => {
        if (canvasRef.current && !gameInstance && !initializingRef.current) {
            initializingRef.current = true;
            const game = new Game(canvasRef.current);
            gameRef.current = game;
            window.game = game; // Expose for debugging

            // Use a flag to track if the component is still mounted
            let isMounted = true;

            setTimeout(async () => {
                await game.init((instance) => {
                    if (isMounted) {
                        setGameInstance(instance);

                        // Debug Quick Start
                        const params = new URLSearchParams(window.location.search);
                        const isQuickStart = params.get('quickstart') === 'true' || params.get('debug') === 'true';
                        console.log('App.jsx: Checking Quick Start:', isQuickStart, window.location.search);

                        if (isQuickStart) {
                            console.log('App.jsx: Debug Quick Start Triggered');
                            const engines = [
                                { id: 'pioneer', stats: { hp: 100, speed: 5.0, ram: 0, magnet: 120 }, track: 'circle' }
                            ];
                            const wagons = ['gunner', 'sniper', 'flame', 'mortar', 'tesla', 'cryo', 'railgun', 'acid', 'gravity', 'thumper'];
                            const randomWagon = wagons[Math.floor(Math.random() * wagons.length)];

                            // Wrap in timeout to ensure state updates have propagated
                            setTimeout(() => {
                                console.log('App.jsx: Executing startGame...');
                                try {
                                    instance.startGame(
                                        engines[0],
                                        { id: randomWagon },
                                        { id: 'normal', multiplier: 1.0 }
                                    );
                                    console.log('App.jsx: startGame executed successfully');
                                } catch (error) {
                                    console.error('App.jsx: Error starting game:', error);
                                }
                            }, 500);
                        }
                    }
                });
                initializingRef.current = false;
            }, 0);

            return () => {
                isMounted = false;
                if (gameRef.current) {
                    gameRef.current.destroy();
                    gameRef.current = null;
                }
                initializingRef.current = false;
                setGameInstance(null);
            };
        }
    }, []);

    return (
        <div className="relative w-full h-full bg-slate-950 overflow-hidden">
            <canvas ref={canvasRef} id="gameCanvas" className="block absolute top-0 left-0 z-0" />

            {/* UI Overlay */}
            {/* UI Overlay */}
            <div className="absolute inset-0 pointer-events-none z-10">
                {gameInstance && <GameUI gameInstance={gameInstance} />}
            </div>
        </div>
    );
}

export default App;
