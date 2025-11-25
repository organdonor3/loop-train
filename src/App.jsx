import React, { useEffect, useRef, useState } from 'react';
import Game from './game/Game';
import GameUI from './components/GameUI';

function App() {
    const canvasRef = useRef(null);
    const [gameInstance, setGameInstance] = useState(null);

    useEffect(() => {
        // Force HMR update
        if (canvasRef.current && !gameInstance) {
            const game = new Game(canvasRef.current);
            window.game = game; // Expose for debugging
            game.start();
            setGameInstance(game);

            return () => {
                game.stop();
            };
        }
    }, []);

    return (
        <div className="relative w-full h-full bg-slate-950 overflow-hidden">
            <canvas ref={canvasRef} id="gameCanvas" className="block absolute top-0 left-0 z-0" />

            {/* UI Overlay */}
            <div className="absolute inset-0 pointer-events-none z-10">
                <GameUI gameInstance={gameInstance} />
            </div>
        </div>
    );
}

export default App;
