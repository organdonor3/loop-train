// Setup Screen Component
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ENGINES, CARDS } from '../game/constants';
import { ChevronRight, Shield, Zap, Crosshair, Activity, Gauge, Magnet } from 'lucide-react';

const DIFFICULTIES = [
    { id: 'easy', label: 'CADET', desc: 'For those learning the ropes.', multiplier: 0.8, color: 'text-green-400', border: 'border-green-500/50' },
    { id: 'normal', label: 'ENGINEER', desc: 'The standard experience.', multiplier: 1.0, color: 'text-blue-400', border: 'border-blue-500/50' },
    { id: 'hard', label: 'CONDUCTOR', desc: 'Unforgiving void.', multiplier: 1.2, color: 'text-red-400', border: 'border-red-500/50' }
];

export default function SetupScreen({ onStart }) {
    const [step, setStep] = useState(1);
    const [difficulty, setDifficulty] = useState(DIFFICULTIES[1]);
    const [selectedEngine, setSelectedEngine] = useState(null);
    const [selectedWagon, setSelectedWagon] = useState(null);

    const startingWagons = CARDS.filter(c => c.type === 'wagon' && c.rarity === 'common');

    const handleStart = () => {
        if (selectedEngine && selectedWagon) {
            onStart(selectedEngine, selectedWagon, difficulty);
        }
    };

    const StatBar = ({ label, value, max = 10, icon: Icon, color = "bg-blue-500" }) => (
        <div className="flex items-center gap-2 text-xs font-mono">
            {Icon && <Icon size={12} className="text-slate-400" />}
            <span className="w-12 text-slate-400">{label}</span>
            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(value / max) * 100}%` }}
                    className={`h-full ${color}`}
                />
            </div>
            <span className="w-8 text-right text-slate-300">{value}</span>
        </div>
    );

    return (
        <div className="absolute inset-0 bg-slate-950 flex items-center justify-center z-50 p-8 pointer-events-auto overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-20 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle at center, #1e293b 1px, transparent 1px)', backgroundSize: '40px 40px' }}
            />

            <div className="max-w-7xl w-full relative z-10 flex flex-col h-full max-h-[900px]">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-slate-100 to-slate-500 tracking-[0.2em]">
                        INITIATE RUN
                    </h1>
                    <div className="flex justify-center gap-2 mt-4 relative">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`h-1 w-16 rounded-full transition-colors ${step >= i ? 'bg-blue-500' : 'bg-slate-800'}`} />
                        ))}
                        <button
                            onClick={() => window.location.href = window.location.pathname + '?quickstart=true'}
                            className="absolute right-[-120px] top-[-10px] text-[10px] bg-red-900/50 text-red-400 px-2 py-1 rounded border border-red-800 hover:bg-red-900 hover:text-white transition-colors"
                        >
                            DEBUG START
                        </button>
                    </div>
                </motion.div>

                <div className="flex-1 relative">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                className="h-full flex flex-col items-center justify-center"
                            >
                                <h2 className="text-2xl text-slate-400 font-bold tracking-widest mb-12">SELECT DIFFICULTY</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
                                    {DIFFICULTIES.map(diff => (
                                        <button
                                            key={diff.id}
                                            onClick={() => setDifficulty(diff)}
                                            className={`p-8 rounded-2xl border-2 transition-all duration-300 text-left relative overflow-hidden group hover:-translate-y-2
                                                ${difficulty.id === diff.id
                                                    ? `${diff.border} bg-slate-900 shadow-[0_0_50px_rgba(0,0,0,0.5)]`
                                                    : 'border-slate-800 bg-slate-900/50 hover:border-slate-600'
                                                }`}
                                        >
                                            <div className={`text-3xl font-black mb-4 ${diff.color}`}>{diff.label}</div>
                                            <p className="text-slate-400 text-lg mb-8">{diff.desc}</p>
                                            <div className="text-sm font-mono text-slate-500">
                                                SCORE MULTIPLIER: <span className="text-white">x{diff.multiplier}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setStep(2)}
                                    className="mt-16 px-16 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold tracking-widest shadow-lg hover:shadow-blue-500/25 transition-all flex items-center gap-2"
                                >
                                    NEXT STEP <ChevronRight />
                                </button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                className="h-full flex flex-col"
                            >
                                <h2 className="text-2xl text-center text-blue-400 font-bold tracking-widest mb-8">SELECT ENGINE CLASS</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-y-auto pb-4">
                                    {ENGINES.map(engine => (
                                        <button
                                            key={engine.id}
                                            onClick={() => setSelectedEngine(engine)}
                                            className={`p-4 rounded-xl border-2 transition-all duration-300 text-left relative overflow-hidden group flex flex-col
                                                ${selectedEngine?.id === engine.id
                                                    ? 'border-blue-500 bg-blue-950/50 shadow-lg ring-1 ring-blue-500/50'
                                                    : 'border-slate-800 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-800'
                                                }`}
                                        >
                                            <div className="mb-4 relative h-32 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-center overflow-hidden">
                                                {/* Mini Map Preview Placeholder */}
                                                <div className={`w-20 h-20 rounded-full border-2 border-dashed opacity-50 ${selectedEngine?.id === engine.id ? 'border-blue-500' : 'border-slate-600'}`}
                                                    style={{ borderRadius: engine.track === 'oval' ? '40%' : engine.track === 'circle' ? '50%' : '10%' }}
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center text-6xl font-black opacity-10 select-none">
                                                    {engine.id[0].toUpperCase()}
                                                </div>
                                            </div>

                                            <h3 className={`text-lg font-bold mb-1 ${selectedEngine?.id === engine.id ? 'text-blue-400' : 'text-slate-200'}`}>
                                                {engine.name}
                                            </h3>
                                            <p className="text-xs text-slate-500 mb-4 h-8 leading-tight">{engine.desc}</p>

                                            <div className="space-y-2 mt-auto">
                                                <StatBar label="HP" value={engine.stats.hp} max={200} icon={Shield} color="bg-emerald-500" />
                                                <StatBar label="SPD" value={engine.stats.speed} max={8} icon={Gauge} color="bg-cyan-500" />
                                                <StatBar label="MAG" value={engine.stats.magnet} max={200} icon={Magnet} color="bg-purple-500" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                <div className="flex justify-center gap-4 mt-8">
                                    <button onClick={() => setStep(1)} className="px-8 py-3 rounded-full font-bold tracking-widest bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-all">
                                        BACK
                                    </button>
                                    <button
                                        disabled={!selectedEngine}
                                        onClick={() => setStep(3)}
                                        className={`px-12 py-3 rounded-full font-bold tracking-widest transition-all flex items-center gap-2
                                            ${selectedEngine
                                                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg'
                                                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                            }`}
                                    >
                                        CONFIRM ENGINE <ChevronRight />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                className="h-full flex flex-col"
                            >
                                <h2 className="text-2xl text-center text-yellow-400 font-bold tracking-widest mb-8">SELECT STARTING WAGON</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
                                            <div className="flex items-start justify-between mb-4">
                                                <div className={`p-3 rounded-lg ${selectedWagon?.id === card.id ? 'bg-yellow-500 text-black' : 'bg-slate-800 text-slate-400'}`}>
                                                    <Crosshair size={24} />
                                                </div>
                                                <div className="text-xs font-mono text-slate-500 uppercase tracking-wider">{card.rarity}</div>
                                            </div>
                                            <h3 className={`text-xl font-bold mb-2 ${selectedWagon?.id === card.id ? 'text-yellow-400' : 'text-slate-200'}`}>
                                                {card.title}
                                            </h3>
                                            <p className="text-sm text-slate-400 leading-relaxed">{card.desc}</p>
                                        </button>
                                    ))}
                                </div>
                                <div className="flex justify-center gap-4 mt-auto pt-8">
                                    <button onClick={() => setStep(2)} className="px-8 py-4 rounded-full font-bold tracking-widest bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-all">
                                        BACK
                                    </button>
                                    <button
                                        disabled={!selectedWagon}
                                        onClick={handleStart}
                                        className={`px-16 py-4 rounded-full font-bold tracking-widest transition-all text-lg
                                            ${selectedWagon
                                                ? 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-lg hover:shadow-yellow-500/25'
                                                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                            }`}
                                    >
                                        LAUNCH SEQUENCE
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
