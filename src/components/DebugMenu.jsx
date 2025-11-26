import React from 'react';
import { useGameStore } from '../game/state';
import { FastForward, ArrowUpCircle, Skull, Package } from 'lucide-react';

export default function DebugMenu({ gameInstance }) {
    if (!gameInstance) return null;

    const godMode = useGameStore(state => state.godMode);

    return (
        <div className="absolute bottom-4 right-4 flex flex-col gap-2 pointer-events-auto z-50">
            <button
                onClick={() => gameInstance.advanceWave()}
                className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded border border-slate-600 flex items-center gap-2 text-xs font-bold"
            >
                <FastForward className="w-4 h-4 text-blue-400" />
                NEXT WAVE
            </button>
            <div className="flex rounded border border-slate-600 overflow-hidden">
                <button
                    onClick={() => gameInstance.forceLevelUp()}
                    className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 px-3 py-2 flex items-center gap-2 text-xs font-bold border-r border-slate-600"
                >
                    <ArrowUpCircle className="w-4 h-4 text-green-400" />
                    LEVEL UP
                </button>
                <button
                    onClick={() => gameInstance.debugAutoLevelUp()}
                    className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 px-2 py-2 flex items-center justify-center text-xs font-bold"
                    title="Auto Pick Random Upgrade"
                >
                    🎲
                </button>
            </div>
            <button
                onClick={() => gameInstance.toggleGodMode()}
                className={`px-3 py-2 rounded border flex items-center gap-2 text-xs font-bold ${godMode
                    ? 'bg-yellow-600/80 hover:bg-yellow-500 text-white border-yellow-400'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-600'
                    }`}
            >
                <span className="text-yellow-400">🛡️</span>
                GOD MODE
            </button>
            <button
                onClick={() => gameInstance.spawnMiniBoss()}
                className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded border border-slate-600 flex items-center gap-2 text-xs font-bold"
            >
                <Skull className="w-4 h-4 text-red-500" />
                SPAWN BOSS
            </button>
            <button
                onClick={() => gameInstance.debugSpawnDepot()}
                className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded border border-slate-600 flex items-center gap-2 text-xs font-bold"
            >
                <Package className="w-4 h-4 text-amber-400" />
                SPAWN DEPOT
            </button>
            <button
                onClick={() => gameInstance.debugAddScrap()}
                className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded border border-slate-600 flex items-center gap-2 text-xs font-bold"
            >
                <span className="text-yellow-400">💰</span>
                +SCRAP
            </button>
        </div>
    );
}
