import React from 'react';
import { useGameStore } from '../game/state';
import { FastForward, ArrowUpCircle } from 'lucide-react';

export default function DebugMenu({ gameInstance }) {
    if (!gameInstance) return null;

    return (
        <div className="absolute bottom-4 right-4 flex flex-col gap-2 pointer-events-auto z-50">
            <button
                onClick={() => gameInstance.advanceWave()}
                className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded border border-slate-600 flex items-center gap-2 text-xs font-bold"
            >
                <FastForward className="w-4 h-4 text-blue-400" />
                NEXT WAVE
            </button>
            <button
                onClick={() => gameInstance.forceLevelUp()}
                className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded border border-slate-600 flex items-center gap-2 text-xs font-bold"
            >
                <ArrowUpCircle className="w-4 h-4 text-green-400" />
                LEVEL UP
            </button>
            <button
                onClick={() => gameInstance.toggleGodMode()}
                className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded border border-slate-600 flex items-center gap-2 text-xs font-bold"
            >
                <span className="text-yellow-400">🛡️</span>
                GOD MODE
            </button>
        </div>
    );
}
