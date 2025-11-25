import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../game/state';
import { RefreshCw } from 'lucide-react';

export default function GameOver() {
    const { level } = useGameStore();

    return (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/90 z-50 pointer-events-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
            >
                <h1 className="text-8xl font-black text-red-600 mb-4 tracking-tighter drop-shadow-[0_0_30px_rgba(220,38,38,0.5)]">DERAILED</h1>
                <p className="text-2xl text-slate-400 mb-8 font-mono">LOCOMOTIVE DESTROYED</p>

                <div className="mb-12 p-6 bg-slate-900 rounded-lg border border-slate-800 inline-block">
                    <div className="text-sm text-slate-500 font-bold uppercase tracking-widest mb-1">Level Reached</div>
                    <div className="text-4xl font-black text-white">{level}</div>
                </div>

                <div>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-red-600 hover:bg-red-500 text-white font-bold py-4 px-12 rounded-full shadow-lg flex items-center gap-3 mx-auto transition-all hover:scale-105"
                    >
                        <RefreshCw className="w-6 h-6" />
                        RESTART ENGINE
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
