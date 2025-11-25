import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ENGINES, CARDS } from '../game/constants';
import { useGameStore } from '../game/state';

export default function SetupScreen({ onStart }) {
    const [step, setStep] = useState(1);
    const [selectedEngine, setSelectedEngine] = useState(null);
    const [selectedWagon, setSelectedWagon] = useState(null);

    const startingWagons = CARDS.filter(c => c.type === 'wagon' && c.rarity === 'common');

    const handleStart = () => {
        if (selectedEngine && selectedWagon) {
            onStart(selectedEngine, selectedWagon);
        }
    };

    return (
        <div className="absolute inset-0 bg-slate-950 flex items-center justify-center z-50 p-8 pointer-events-auto">
            <div className="max-w-6xl w-full">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-bold text-center text-slate-200 mb-12 tracking-[0.2em]"
                >
                    INITIATE SEQUENCE
                </motion.h1>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <h2 className="text-2xl text-center text-blue-400 font-bold tracking-widest">SELECT ENGINE CLASS</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                {ENGINES.map(engine => (
                                    <button
                                        key={engine.id}
                                        onClick={() => setSelectedEngine(engine)}
                                        className={`p-6 rounded-xl border-2 transition-all duration-300 text-left relative overflow-hidden group
                                            ${selectedEngine?.id === engine.id
                                                ? 'border-blue-500 bg-blue-900/20 shadow-[0_0_30px_rgba(59,130,246,0.3)]'
                                                : 'border-slate-800 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-800'
                                            }`}
                                    >
                                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <div className="text-6xl font-black">{engine.id.substring(0, 1).toUpperCase()}</div>
                                        </div>
                                        <h3 className={`text-xl font-bold mb-2 ${selectedEngine?.id === engine.id ? 'text-blue-400' : 'text-slate-200'}`}>
                                            {engine.name}
                                        </h3>
                                        <p className="text-sm text-slate-400 mb-4 h-12">{engine.desc}</p>
                                        <div className="space-y-2 text-xs font-mono text-slate-500">
                                            <div className="flex justify-between"><span>HP</span> <span className="text-slate-300">{engine.stats.hp}</span></div>
                                            <div className="flex justify-between"><span>SPEED</span> <span className="text-slate-300">{engine.stats.speed}</span></div>
                                            <div className="flex justify-between"><span>MAGNET</span> <span className="text-slate-300">{engine.stats.magnet}</span></div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <div className="flex justify-center mt-8">
                                <button
                                    disabled={!selectedEngine}
                                    onClick={() => setStep(2)}
                                    className={`px-12 py-4 rounded font-bold tracking-widest transition-all
                                        ${selectedEngine
                                            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg hover:shadow-blue-500/25'
                                            : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                        }`}
                                >
                                    CONFIRM ENGINE
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <h2 className="text-2xl text-center text-yellow-400 font-bold tracking-widest">SELECT STARTING WAGON</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {startingWagons.map(card => (
                                    <button
                                        key={card.id}
                                        onClick={() => setSelectedWagon(card)}
                                        className={`p-6 rounded-xl border-2 transition-all duration-300 text-left relative overflow-hidden group
                                            ${selectedWagon?.id === card.id
                                                ? 'border-yellow-500 bg-yellow-900/20 shadow-[0_0_30px_rgba(234,179,8,0.3)]'
                                                : 'border-slate-800 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-800'
                                            }`}
                                    >
                                        <h3 className={`text-xl font-bold mb-2 ${selectedWagon?.id === card.id ? 'text-yellow-400' : 'text-slate-200'}`}>
                                            {card.title}
                                        </h3>
                                        <p className="text-sm text-slate-400">{card.desc}</p>
                                    </button>
                                ))}
                            </div>
                            <div className="flex justify-center gap-4 mt-8">
                                <button
                                    onClick={() => setStep(1)}
                                    className="px-8 py-4 rounded font-bold tracking-widest bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-all"
                                >
                                    BACK
                                </button>
                                <button
                                    disabled={!selectedWagon}
                                    onClick={handleStart}
                                    className={`px-12 py-4 rounded font-bold tracking-widest transition-all
                                        ${selectedWagon
                                            ? 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-lg hover:shadow-yellow-500/25'
                                            : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                        }`}
                                >
                                    LAUNCH
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
